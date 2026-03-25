// ============================================================
// src/config/env.ts — Environment Variable Validation & Export
// ============================================================
// Centralizes all env vars with runtime validation so the
// server fails fast if critical config is missing.
// ============================================================

import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the server root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ---------------------------------------------------------------------------
// Helper: Require an env var or throw a clear error at startup
// ---------------------------------------------------------------------------
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `❌ Missing required environment variable: ${key}. ` +
      `Check your server/.env file.`
    );
  }
  return value;
}

// ---------------------------------------------------------------------------
// Exported configuration object — accessed throughout the server
// ---------------------------------------------------------------------------
export const config = {
  // Server
  port: parseInt(process.env.PORT || '5000', 10),

  // Spotify OAuth
  spotify: {
    clientId:     requireEnv('SPOTIFY_CLIENT_ID'),
    clientSecret: requireEnv('SPOTIFY_CLIENT_SECRET'),
    redirectUri:  requireEnv('SPOTIFY_REDIRECT_URI'),
  },

  // Frontend
  frontendUrl: requireEnv('FRONTEND_URL'),

  // Session
  sessionSecret: requireEnv('SESSION_SECRET'),

  // AI API Keys (optional — only needed for Phase 2+)
  openaiApiKey:  process.env.OPENAI_API_KEY  || '',
  geminiApiKey:  process.env.GEMINI_API_KEY  || '',
} as const;

// Freeze the object to prevent accidental mutations
Object.freeze(config);
