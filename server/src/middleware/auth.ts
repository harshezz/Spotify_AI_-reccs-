// ============================================================
// src/middleware/auth.ts — Authentication Middleware
// ============================================================
// Verifies that incoming requests have a valid Spotify session.
// Automatically refreshes expired tokens before forwarding.
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { SpotifySession } from '../types';
import { refreshAccessToken } from '../services/spotifyAuth';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// requireAuth — Middleware that ensures a valid Spotify access token
// ---------------------------------------------------------------------------
// Attaches the access token to `req.session` for downstream route handlers.
// If the token is expired, it auto-refreshes using the stored refresh token.
// ---------------------------------------------------------------------------
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const session = req.session as SpotifySession;

  // ── Check if we have tokens at all ──────────────────────────
  if (!session.spotifyAccessToken || !session.spotifyRefreshToken) {
    logger.warn('Unauthorized request — no tokens in session');
    res.status(401).json({
      error: 'Not authenticated',
      message: 'Please login with Spotify first',
    });
    return;
  }

  // ── Check if the access token has expired ───────────────────
  const now = Date.now();
  const isExpired = session.tokenExpiresAt && now >= session.tokenExpiresAt;

  if (isExpired) {
    logger.info('Access token expired — attempting auto-refresh...');

    try {
      const tokenData = await refreshAccessToken(session.spotifyRefreshToken);

      // Update session with the new token
      session.spotifyAccessToken = tokenData.access_token;
      session.tokenExpiresAt = Date.now() + tokenData.expires_in * 1000;

      // Spotify may (rarely) return a new refresh token
      if (tokenData.refresh_token) {
        session.spotifyRefreshToken = tokenData.refresh_token;
      }

      logger.success('Token auto-refreshed successfully');
    } catch (error) {
      logger.error('Auto-refresh failed — clearing session');
      session.destroy((err) => {
        if (err) logger.error('Session destroy error:', err);
      });
      res.status(401).json({
        error: 'Session expired',
        message: 'Token refresh failed. Please login again.',
      });
      return;
    }
  }

  // Token is valid — proceed to the next handler
  next();
}
