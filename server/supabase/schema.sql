-- ============================================================
-- Vibe Music — Supabase Database Schema
-- ============================================================
-- Run this in your Supabase SQL editor to create the tables.
-- Dashboard: https://supabase.com/dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── User Profiles ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spotify_id    TEXT UNIQUE,
  display_name  TEXT NOT NULL DEFAULT 'User',
  email         TEXT,
  avatar_url    TEXT,
  theme         TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  accent_color  TEXT NOT NULL DEFAULT 'violet',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Listening History ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS listening_history (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  track_id      TEXT NOT NULL,
  track_name    TEXT NOT NULL,
  artist_name   TEXT NOT NULL,
  album_art_url TEXT,
  played_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_ms   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_history_user ON listening_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_played ON listening_history(played_at DESC);

-- ── Saved Playlists ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_playlists (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  description         TEXT,
  spotify_playlist_id TEXT,
  is_ai_generated     BOOLEAN NOT NULL DEFAULT FALSE,
  track_count         INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_playlists_user ON saved_playlists(user_id);

-- ── Row Level Security ─────────────────────────────────────
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_playlists ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can manage their own listening history
CREATE POLICY "Users can view own history"
  ON listening_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON listening_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can manage their own playlists
CREATE POLICY "Users can view own playlists"
  ON saved_playlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own playlists"
  ON saved_playlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists"
  ON saved_playlists FOR DELETE
  USING (auth.uid() = user_id);
