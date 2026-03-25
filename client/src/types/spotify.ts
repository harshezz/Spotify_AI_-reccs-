// ============================================================
// src/types/spotify.ts — Spotify API Type Definitions
// ============================================================
// Comprehensive TypeScript types matching the Spotify Web API
// response schemas. Used throughout the frontend for type safety.
// ============================================================

// ---------------------------------------------------------------------------
// Image — used across many Spotify entities
// ---------------------------------------------------------------------------
export interface SpotifyImage {
  url:    string;
  height: number | null;
  width:  number | null;
}

// ---------------------------------------------------------------------------
// User Profile
// ---------------------------------------------------------------------------
export interface SpotifyUser {
  id:            string;
  display_name:  string;
  email:         string;
  images:        SpotifyImage[];
  product:       'premium' | 'free' | 'open';
  country:       string;
  uri:           string;
  followers?: {
    total: number;
  };
}

// ---------------------------------------------------------------------------
// Simplified Artist
// ---------------------------------------------------------------------------
export interface SpotifyArtist {
  id:   string;
  name: string;
  uri:  string;
  images?: SpotifyImage[];
}

// ---------------------------------------------------------------------------
// Album
// ---------------------------------------------------------------------------
export interface SpotifyAlbum {
  id:           string;
  name:         string;
  images:       SpotifyImage[];
  release_date: string;
  uri:          string;
  artists:      SpotifyArtist[];
  album_type:   string;
  total_tracks: number;
}

// ---------------------------------------------------------------------------
// Track
// ---------------------------------------------------------------------------
export interface SpotifyTrack {
  id:          string;
  name:        string;
  uri:         string;
  duration_ms: number;
  artists:     SpotifyArtist[];
  album:       SpotifyAlbum;
  preview_url: string | null;
  popularity:  number;
  track_number: number;
  explicit:    boolean;
  is_playable?: boolean;
}

// ---------------------------------------------------------------------------
// Playlist
// ---------------------------------------------------------------------------
export interface SpotifyPlaylist {
  id:          string;
  name:        string;
  description: string | null;
  images:      SpotifyImage[];
  uri:         string;
  tracks: {
    total: number;
    items?: PlaylistTrackItem[];
  };
  owner: {
    id:           string;
    display_name: string;
  };
  public:      boolean;
  collaborative: boolean;
}

// ---------------------------------------------------------------------------
// Playlist Track Item (track + metadata)
// ---------------------------------------------------------------------------
export interface PlaylistTrackItem {
  added_at: string;
  track:    SpotifyTrack;
}

// ---------------------------------------------------------------------------
// Saved Track Item (liked songs)
// ---------------------------------------------------------------------------
export interface SavedTrackItem {
  added_at: string;
  track:    SpotifyTrack;
}

// ---------------------------------------------------------------------------
// Paginated Response wrapper
// ---------------------------------------------------------------------------
export interface SpotifyPaginatedResponse<T> {
  items:    T[];
  total:    number;
  limit:    number;
  offset:   number;
  next:     string | null;
  previous: string | null;
}

// ---------------------------------------------------------------------------
// Playback State (from Web Playback SDK / Spotify API)
// ---------------------------------------------------------------------------
export interface PlaybackState {
  is_playing:    boolean;
  progress_ms:   number;
  duration_ms:   number;
  item:          SpotifyTrack | null;
  device?: {
    id:                string;
    is_active:         boolean;
    name:              string;
    volume_percent:    number;
  };
  shuffle_state: boolean;
  repeat_state:  'off' | 'track' | 'context';
}
