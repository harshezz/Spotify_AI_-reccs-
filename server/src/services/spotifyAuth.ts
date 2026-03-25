// ============================================================
// src/services/spotifyAuth.ts — Spotify Authentication Service
// ============================================================
// Encapsulates all interactions with the Spotify Accounts API.
// This is a pure service layer — no Express request/response
// handling happens here, making it easy to test and reuse.
// ============================================================

import axios from 'axios';
import { config } from '../config/env';
import { SpotifyTokenResponse } from '../types';
import { logger } from '../utils/logger';

// Spotify Accounts API base URL (separate from the Web API)
const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com';
const SPOTIFY_API_BASE      = 'https://api.spotify.com/v1';

// ---------------------------------------------------------------------------
// Scopes: Define exactly what permissions our app needs from the user.
// ---------------------------------------------------------------------------
// Reference: https://developer.spotify.com/documentation/web-api/concepts/scopes
const SPOTIFY_SCOPES = [
  // User profile
  'user-read-email',
  'user-read-private',

  // Playback (Web Playback SDK requires these)
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',

  // Library
  'user-library-read',
  'user-library-modify',

  // Playlists (read + create for AI feature)
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',

  // Listening history (for recommendations)
  'user-top-read',
  'user-read-recently-played',
].join(' ');


// ---------------------------------------------------------------------------
// 1. Generate the Spotify Authorization URL
// ---------------------------------------------------------------------------
// This URL is where we redirect the user to login and grant permissions.
// On success, Spotify will redirect back to our callback with an auth code.
// ---------------------------------------------------------------------------
export function getSpotifyAuthUrl(): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id:     config.spotify.clientId,
    scope:         SPOTIFY_SCOPES,
    redirect_uri:  config.spotify.redirectUri,
    // `show_dialog: true` forces the consent screen every time (useful in dev)
    show_dialog:   'true',
  });

  const authUrl = `${SPOTIFY_ACCOUNTS_BASE}/authorize?${params.toString()}`;
  logger.debug(`Generated Spotify auth URL: ${authUrl}`);
  return authUrl;
}


// ---------------------------------------------------------------------------
// 2. Exchange Authorization Code for Access + Refresh Tokens
// ---------------------------------------------------------------------------
// Called during the OAuth callback. The authorization code is single-use
// and expires quickly, so this must be called immediately.
// ---------------------------------------------------------------------------
export async function exchangeCodeForTokens(
  code: string
): Promise<SpotifyTokenResponse> {
  logger.info('Exchanging authorization code for tokens...');

  try {
    const response = await axios.post<SpotifyTokenResponse>(
      `${SPOTIFY_ACCOUNTS_BASE}/api/token`,
      new URLSearchParams({
        grant_type:   'authorization_code',
        code,
        redirect_uri: config.spotify.redirectUri,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // Spotify requires Basic auth: base64(client_id:client_secret)
          Authorization: `Basic ${Buffer.from(
            `${config.spotify.clientId}:${config.spotify.clientSecret}`
          ).toString('base64')}`,
        },
      }
    );

    logger.success('Successfully exchanged code for tokens');
    return response.data;
  } catch (error: any) {
    logger.error('Token exchange failed:', error.response?.data || error.message);
    throw new Error('Failed to exchange authorization code for tokens');
  }
}


// ---------------------------------------------------------------------------
// 3. Refresh an Expired Access Token
// ---------------------------------------------------------------------------
// Access tokens expire after ~1 hour. This uses the refresh token
// (which doesn't expire unless revoked) to get a new access token.
// ---------------------------------------------------------------------------
export async function refreshAccessToken(
  refreshToken: string
): Promise<SpotifyTokenResponse> {
  logger.info('Refreshing expired access token...');

  try {
    const response = await axios.post<SpotifyTokenResponse>(
      `${SPOTIFY_ACCOUNTS_BASE}/api/token`,
      new URLSearchParams({
        grant_type:    'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${config.spotify.clientId}:${config.spotify.clientSecret}`
          ).toString('base64')}`,
        },
      }
    );

    logger.success('Successfully refreshed access token');
    return response.data;
  } catch (error: any) {
    logger.error('Token refresh failed:', error.response?.data || error.message);
    throw new Error('Failed to refresh access token');
  }
}


// ---------------------------------------------------------------------------
// 4. Fetch the Current User's Spotify Profile
// ---------------------------------------------------------------------------
// Uses a valid access token to retrieve the user's profile data.
// ---------------------------------------------------------------------------
export async function getSpotifyUserProfile(accessToken: string) {
  try {
    const response = await axios.get(`${SPOTIFY_API_BASE}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error: any) {
    logger.error('Failed to fetch user profile:', error.response?.data || error.message);
    throw new Error('Failed to fetch Spotify user profile');
  }
}
