// ============================================================
// src/lib/supabase.ts — Supabase Client
// ============================================================
// Creates and exports a singleton Supabase client for use
// throughout the application. Handles auth, database CRUD,
// and real-time subscriptions.
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// ── Database Types ────────────────────────────────────────────
export interface UserProfile {
  id: string;
  spotify_id: string | null;
  display_name: string;
  email: string | null;
  avatar_url: string | null;
  theme: 'light' | 'dark';
  accent_color: string;
  created_at: string;
  updated_at: string;
}

export interface ListeningHistory {
  id: string;
  user_id: string;
  track_id: string;
  track_name: string;
  artist_name: string;
  album_art_url: string | null;
  played_at: string;
  duration_ms: number;
}

export interface SavedPlaylist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  spotify_playlist_id: string | null;
  is_ai_generated: boolean;
  track_count: number;
  created_at: string;
}

// ── Helper Functions ──────────────────────────────────────────

/** Fetch user profile from Supabase */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[Supabase] Error fetching profile:', error.message);
    return null;
  }
  return data;
}

/** Create or update user profile */
export async function upsertUserProfile(profile: Partial<UserProfile> & { id: string }): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error upserting profile:', error.message);
    return null;
  }
  return data;
}

/** Update user theme preference */
export async function updateUserTheme(userId: string, theme: 'light' | 'dark', accentColor: string) {
  const { error } = await supabase
    .from('user_profiles')
    .update({ theme, accent_color: accentColor, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('[Supabase] Error updating theme:', error.message);
  }
}

/** Log a track play to listening history */
export async function logTrackPlay(entry: Omit<ListeningHistory, 'id'>) {
  const { error } = await supabase
    .from('listening_history')
    .insert(entry);

  if (error) {
    console.error('[Supabase] Error logging track:', error.message);
  }
}

/** Get listening history for a user */
export async function getListeningHistory(userId: string, limit = 50): Promise<ListeningHistory[]> {
  const { data, error } = await supabase
    .from('listening_history')
    .select('*')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[Supabase] Error fetching history:', error.message);
    return [];
  }
  return data || [];
}

/** Get saved playlists for a user */
export async function getSavedPlaylists(userId: string): Promise<SavedPlaylist[]> {
  const { data, error } = await supabase
    .from('saved_playlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching playlists:', error.message);
    return [];
  }
  return data || [];
}
