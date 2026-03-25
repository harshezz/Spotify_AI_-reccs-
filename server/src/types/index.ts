// ============================================================
// src/types/index.ts — Shared Type Definitions for the Server
// ============================================================

import { Session } from 'express-session';

// ---------------------------------------------------------------------------
// Spotify Token Response — what Spotify returns from /api/token
// ---------------------------------------------------------------------------
export interface SpotifyTokenResponse {
  access_token:  string;
  token_type:    string;       // "Bearer"
  scope:         string;
  expires_in:    number;       // seconds until expiry (usually 3600)
  refresh_token?: string;      // only present on initial auth, not on refresh
}

// ---------------------------------------------------------------------------
// Extended Express Session — stores Spotify tokens securely server-side
// ---------------------------------------------------------------------------
export interface SpotifySession extends Session {
  spotifyAccessToken?:  string;
  spotifyRefreshToken?: string;
  tokenExpiresAt?:      number;   // Unix timestamp (ms) when token expires
}

// ---------------------------------------------------------------------------
// Spotify User Profile (slim version for our needs)
// ---------------------------------------------------------------------------
export interface SpotifyUserProfile {
  id:           string;
  display_name: string;
  email:        string;
  images:       { url: string; height: number; width: number }[];
  product:      string;    // "premium" | "free" | "open"
  country:      string;
  uri:          string;
}

// ---------------------------------------------------------------------------
// AI Playlist Generation Types
// ---------------------------------------------------------------------------
export interface TrackSeed {
  name:   string;
  artist: string;
}

export interface AiSuggestion {
  title:  string;
  artist: string;
}

export interface AiGenerateRequest {
  tracks:    TrackSeed[];
  mood?:     string;
  count?:    number;       // how many tracks to suggest (default: 15)
}
