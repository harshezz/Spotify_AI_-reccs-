// ============================================================
// src/routes/auth.ts — Spotify OAuth Authentication Routes
// ============================================================
// Handles the complete Spotify Authorization Code Flow:
//
//   1. GET  /api/auth/login     → Redirects user to Spotify login
//   2. GET  /api/auth/callback  → Handles Spotify's redirect with auth code
//   3. POST /api/auth/refresh   → Manually refresh an expired access token
//   4. GET  /api/auth/session   → Check current session status
//   5. POST /api/auth/logout    → Destroy the session
//   6. GET  /api/auth/token     → Return valid access token to frontend
//                                  (for Spotify Web Playback SDK)
//
// All tokens are stored in server-side sessions (HTTP-only cookies).
// The frontend NEVER receives the raw refresh_token.
// ============================================================

import { Router, Request, Response } from 'express';
import { SpotifySession } from '../types';
import {
  getSpotifyAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  getSpotifyUserProfile,
} from '../services/spotifyAuth';
import { config } from '../config/env';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import { logger } from '../utils/logger';

const router = Router();
// Force nodemon restart to pick up latest HTTP .env changes

// Apply rate limiting to all auth routes
router.use(authLimiter);


// ═══════════════════════════════════════════════════════════════
// 1. LOGIN — Redirect the user to Spotify's authorization page
// ═══════════════════════════════════════════════════════════════
router.get('/login', (_req: Request, res: Response) => {
  logger.info('User initiating Spotify login...');

  const authUrl = getSpotifyAuthUrl();

  // Redirect the browser to Spotify's consent screen
  res.redirect(authUrl);
});


// ═══════════════════════════════════════════════════════════════
// 2. CALLBACK — Handle Spotify's redirect after user consent
// ═══════════════════════════════════════════════════════════════
// Spotify redirects here with ?code=xxx or ?error=xxx
// We exchange the code for tokens and store them in the session.
// ═══════════════════════════════════════════════════════════════
router.get('/callback', async (req: Request, res: Response) => {
  const { code, error } = req.query;

  // ── Handle user denial or Spotify error ─────────────────────
  if (error) {
    logger.warn(`Spotify auth error: ${error}`);
    res.redirect(
      `${config.frontendUrl}/login?error=${encodeURIComponent(error as string)}`
    );
    return;
  }

  // ── Validate that we received an authorization code ─────────
  if (!code || typeof code !== 'string') {
    logger.error('No authorization code received in callback');
    res.redirect(`${config.frontendUrl}/login?error=no_code`);
    return;
  }

  try {
    // ── Exchange the code for access + refresh tokens ─────────
    const tokenData = await exchangeCodeForTokens(code);
    const session = req.session as SpotifySession;

    // Store tokens securely in the server-side session
    session.spotifyAccessToken  = tokenData.access_token;
    session.spotifyRefreshToken = tokenData.refresh_token;

    // Calculate the exact expiry timestamp
    // (Spotify tokens last ~3600 seconds, we subtract 60s as buffer)
    session.tokenExpiresAt = Date.now() + (tokenData.expires_in - 60) * 1000;

    logger.success('OAuth callback complete — tokens stored in session');

    // Redirect the user to the dashboard on the frontend
    res.redirect(`${config.frontendUrl}/dashboard`);
  } catch (err) {
    logger.error('OAuth callback failed:', err);
    res.redirect(`${config.frontendUrl}/login?error=token_exchange_failed`);
  }
});


// ═══════════════════════════════════════════════════════════════
// 3. REFRESH — Manually trigger a token refresh
// ═══════════════════════════════════════════════════════════════
// Normally handled automatically by the auth middleware.
// This endpoint allows explicit refresh by the frontend.
// ═══════════════════════════════════════════════════════════════
router.post('/refresh', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;

  if (!session.spotifyRefreshToken) {
    res.status(401).json({
      error: 'No refresh token',
      message: 'Please login again',
    });
    return;
  }

  try {
    const tokenData = await refreshAccessToken(session.spotifyRefreshToken);

    // Update session
    session.spotifyAccessToken = tokenData.access_token;
    session.tokenExpiresAt = Date.now() + (tokenData.expires_in - 60) * 1000;

    if (tokenData.refresh_token) {
      session.spotifyRefreshToken = tokenData.refresh_token;
    }

    logger.success('Manual token refresh successful');

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      expiresIn: tokenData.expires_in,
    });
  } catch (err) {
    logger.error('Manual token refresh failed:', err);
    res.status(500).json({
      error: 'Refresh failed',
      message: 'Unable to refresh token. Please login again.',
    });
  }
});


// ═══════════════════════════════════════════════════════════════
// 4. SESSION — Check current authentication status
// ═══════════════════════════════════════════════════════════════
// The frontend calls this on app mount to determine if the
// user is already logged in (session cookie still valid).
// ═══════════════════════════════════════════════════════════════
router.get('/session', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;

  if (!session.spotifyAccessToken) {
    res.json({ authenticated: false });
    return;
  }

  try {
    // Verify the token is still valid by fetching the user profile
    const profile = await getSpotifyUserProfile(session.spotifyAccessToken);

    res.json({
      authenticated: true,
      user: {
        id:          profile.id,
        displayName: profile.display_name,
        email:       profile.email,
        imageUrl:    profile.images?.[0]?.url || null,
        product:     profile.product,   // "premium" or "free"
      },
    });
  } catch {
    // Token might be expired — try to refresh
    if (session.spotifyRefreshToken) {
      try {
        const tokenData = await refreshAccessToken(session.spotifyRefreshToken);
        session.spotifyAccessToken = tokenData.access_token;
        session.tokenExpiresAt = Date.now() + (tokenData.expires_in - 60) * 1000;

        const profile = await getSpotifyUserProfile(tokenData.access_token);

        res.json({
          authenticated: true,
          user: {
            id:          profile.id,
            displayName: profile.display_name,
            email:       profile.email,
            imageUrl:    profile.images?.[0]?.url || null,
            product:     profile.product,
          },
        });
        return;
      } catch {
        // Refresh also failed — session is toast
      }
    }

    res.json({ authenticated: false });
  }
});


// ═══════════════════════════════════════════════════════════════
// 5. LOGOUT — Destroy the server-side session
// ═══════════════════════════════════════════════════════════════
router.post('/logout', (req: Request, res: Response) => {
  logger.info('User logging out...');

  req.session.destroy((err) => {
    if (err) {
      logger.error('Session destruction failed:', err);
      res.status(500).json({ error: 'Logout failed' });
      return;
    }

    // Clear the session cookie from the browser
    res.clearCookie('connect.sid');
    logger.success('User logged out successfully');
    res.json({ success: true, message: 'Logged out' });
  });
});


// ═══════════════════════════════════════════════════════════════
// 6. TOKEN — Return a valid access token to the frontend
// ═══════════════════════════════════════════════════════════════
// The Spotify Web Playback SDK needs the access token directly.
// This is the ONLY route that exposes the token to the frontend.
// It's protected by requireAuth which auto-refreshes if expired.
// ═══════════════════════════════════════════════════════════════
router.get('/token', requireAuth, (req: Request, res: Response) => {
  const session = req.session as SpotifySession;

  res.json({
    accessToken: session.spotifyAccessToken,
    expiresAt:   session.tokenExpiresAt,
  });
});


export default router;
