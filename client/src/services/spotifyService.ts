// ============================================================
// src/services/spotifyService.ts — Spotify API Service Layer
// ============================================================
// This is the SINGLE SOURCE OF TRUTH for all communication
// between the Next.js frontend and the Express backend.
//
// Every function here maps to an Express route that proxies
// the request to the Spotify Web API. The frontend never
// talks to Spotify directly — all requests go through our
// Express backend which attaches the access token.
//
// Usage example:
//   import { spotifyService } from '@/services/spotifyService';
//   const playlists = await spotifyService.getUserPlaylists();
// ============================================================

import api from './api';
import {
  SpotifyUser,
  SpotifyPlaylist,
  SpotifyTrack,
  SpotifyPaginatedResponse,
  PlaylistTrackItem,
  SavedTrackItem,
  PlaybackState,
} from '@/types/spotify';


// ---------------------------------------------------------------------------
// Session & Authentication
// ---------------------------------------------------------------------------
export const spotifyService = {

  // ── Get the Spotify login URL and redirect the user ─────────
  login(): void {
    // This directly navigates to our backend which redirects to Spotify
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/api/auth/login`;
  },

  // ── Check if the user has an active authenticated session ───
  async getSession(): Promise<{
    authenticated: boolean;
    user?: {
      id:          string;
      displayName: string;
      email:       string;
      imageUrl:    string | null;
      product:     string;
    };
  }> {
    const { data } = await api.get('/api/auth/session');
    return data;
  },

  // ── Get a valid access token (needed for Web Playback SDK) ──
  async getAccessToken(): Promise<{
    accessToken: string;
    expiresAt:   number;
  }> {
    const { data } = await api.get('/api/auth/token');
    return data;
  },

  // ── Refresh the token manually ──────────────────────────────
  async refreshToken(): Promise<{ success: boolean; expiresIn: number }> {
    const { data } = await api.post('/api/auth/refresh');
    return data;
  },

  // ── Logout and destroy session ──────────────────────────────
  async logout(): Promise<void> {
    await api.post('/api/auth/logout');
  },


  // ---------------------------------------------------------------------------
  // User Profile
  // ---------------------------------------------------------------------------

  // ── Get the current user's full Spotify profile ─────────────
  async getUserProfile(): Promise<SpotifyUser> {
    const { data } = await api.get('/api/spotify/me');
    return data;
  },


  // ---------------------------------------------------------------------------
  // Playlists
  // ---------------------------------------------------------------------------

  // ── Get the user's playlists (paginated) ────────────────────
  async getUserPlaylists(
    limit = 20,
    offset = 0
  ): Promise<SpotifyPaginatedResponse<SpotifyPlaylist>> {
    const { data } = await api.get('/api/spotify/me/playlists', {
      params: { limit, offset },
    });
    return data;
  },

  // ── Get a specific playlist by ID ───────────────────────────
  async getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
    const { data } = await api.get(`/api/spotify/playlists/${playlistId}`);
    return data;
  },

  // ── Get tracks from a specific playlist (paginated) ─────────
  async getPlaylistTracks(
    playlistId: string,
    limit = 50,
    offset = 0
  ): Promise<SpotifyPaginatedResponse<PlaylistTrackItem>> {
    const { data } = await api.get(
      `/api/spotify/playlists/${playlistId}/tracks`,
      { params: { limit, offset } }
    );
    return data;
  },


  // ---------------------------------------------------------------------------
  // Library / Liked Songs
  // ---------------------------------------------------------------------------

  // ── Get the user's saved/liked tracks (paginated) ───────────
  async getLikedSongs(
    limit = 20,
    offset = 0
  ): Promise<SpotifyPaginatedResponse<SavedTrackItem>> {
    const { data } = await api.get('/api/spotify/me/tracks', {
      params: { limit, offset },
    });
    return data;
  },


  // ---------------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------------

  // ── Search Spotify for tracks, albums, artists, etc. ────────
  async search(
    query: string,
    type: string = 'track',
    limit: number = 20
  ): Promise<{ tracks?: SpotifyPaginatedResponse<SpotifyTrack> }> {
    const { data } = await api.get('/api/spotify/search', {
      params: { q: query, type, limit },
    });
    return data;
  },


  // ---------------------------------------------------------------------------
  // Playback Control
  // ---------------------------------------------------------------------------

  // ── Start/resume playback ───────────────────────────────────
  async play(options?: {
    uris?: string[];       // array of track URIs
    context_uri?: string;  // playlist/album/artist URI
    offset?: { position: number } | { uri: string };
    device_id?: string;
  }): Promise<void> {
    await api.put('/api/spotify/me/player/play', options || {});
  },

  // ── Pause playback ─────────────────────────────────────────
  async pause(): Promise<void> {
    await api.put('/api/spotify/me/player/pause');
  },

  // ── Skip to next track ─────────────────────────────────────
  async next(): Promise<void> {
    await api.post('/api/spotify/me/player/next');
  },

  // ── Skip to previous track ─────────────────────────────────
  async previous(): Promise<void> {
    await api.post('/api/spotify/me/player/previous');
  },

  // ── Set volume ──────────────────────────────────────────────
  async setVolume(percent: number): Promise<void> {
    await api.put('/api/spotify/me/player/volume', null, {
      params: { volume_percent: Math.round(percent) },
    });
  },

  // ── Get current playback state ──────────────────────────────
  async getPlaybackState(): Promise<PlaybackState | null> {
    const { data } = await api.get('/api/spotify/me/player');
    return data;
  },


  // ---------------------------------------------------------------------------
  // Playlist Management (for AI feature)
  // ---------------------------------------------------------------------------

  // ── Create a new playlist on the user's account ─────────────
  async createPlaylist(
    userId: string,
    name: string,
    description: string = '',
    isPublic: boolean = false
  ): Promise<SpotifyPlaylist> {
    const { data } = await api.post(
      `/api/spotify/users/${userId}/playlists`,
      { name, description, public: isPublic }
    );
    return data;
  },

  // ── Add tracks to a playlist ────────────────────────────────
  async addTracksToPlaylist(
    playlistId: string,
    trackUris: string[]
  ): Promise<void> {
    await api.post(`/api/spotify/playlists/${playlistId}/tracks`, {
      uris: trackUris,
    });
  },
};
