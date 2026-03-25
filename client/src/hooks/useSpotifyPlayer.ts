// ============================================================
// src/hooks/useSpotifyPlayer.ts — Spotify Web Playback SDK Hook
// ============================================================
// Manages the lifecycle of the Spotify Web Playback SDK:
//   1. Dynamically loads the SDK script
//   2. Creates a Player instance with our access token
//   3. Connects the player and handles state changes
//   4. Provides playback controls to the rest of the app
//
// REQUIREMENTS:
//   - User must have Spotify Premium
//   - The SDK creates a virtual playback device in the user's
//     Spotify account (visible as "Vibe Web Player")
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { spotifyService } from '@/services/spotifyService';
import { SPOTIFY_SDK_URL } from '@/lib/constants';
import { PlayerState } from '@/types/player';
import { SpotifyTrack } from '@/types/spotify';

// ---------------------------------------------------------------------------
// Extend Window to include Spotify SDK types
// ---------------------------------------------------------------------------
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume: number;
      }) => SpotifyPlayerInstance;
    };
  }
}

interface SpotifyPlayerInstance {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, callback: (data: any) => void) => void;
  removeListener: (event: string) => void;
  getCurrentState: () => Promise<any | null>;
  setName: (name: string) => Promise<void>;
  getVolume: () => Promise<number>;
  setVolume: (volume: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  previousTrack: () => Promise<void>;
  nextTrack: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Hook Return Type
// ---------------------------------------------------------------------------
interface UseSpotifyPlayerReturn {
  player:       SpotifyPlayerInstance | null;
  playerState:  PlayerState;
  deviceId:     string | null;
  isReady:      boolean;
  error:        string | null;
}

// ---------------------------------------------------------------------------
// Initial player state
// ---------------------------------------------------------------------------
const initialPlayerState: PlayerState = {
  isPlaying:    false,
  currentTrack: null,
  progress:     0,
  duration:     0,
  volume:       50,
  isMuted:      false,
  shuffle:      false,
  repeat:       'off',
  deviceId:     null,
  isReady:      false,
};


export function useSpotifyPlayer(): UseSpotifyPlayerReturn {
  const playerRef = useRef<SpotifyPlayerInstance | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>(initialPlayerState);
  const [deviceId, setDeviceId]       = useState<string | null>(null);
  const [isReady, setIsReady]         = useState(false);
  const [error, setError]             = useState<string | null>(null);


  // ---------------------------------------------------------------------------
  // Step 1: Load the Spotify SDK script dynamically
  // ---------------------------------------------------------------------------
  const loadSdkScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.Spotify) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src   = SPOTIFY_SDK_URL;
      script.async = true;

      script.onload  = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Spotify SDK'));

      document.body.appendChild(script);
    });
  }, []);


  // ---------------------------------------------------------------------------
  // Step 2: Initialize the Player
  // ---------------------------------------------------------------------------
  const initializePlayer = useCallback(async () => {
    try {
      // Load the SDK script first
      await loadSdkScript();

      // Wait for the SDK to be ready
      const waitForSdk = (): Promise<void> => {
        return new Promise((resolve) => {
          if (window.Spotify) {
            resolve();
          } else {
            window.onSpotifyWebPlaybackSDKReady = () => resolve();
          }
        });
      };

      await waitForSdk();

      // ── Create the Player instance ──────────────────────────
      const player = new window.Spotify.Player({
        name: 'Vibe Web Player',
        getOAuthToken: async (cb) => {
          try {
            const { accessToken } = await spotifyService.getAccessToken();
            cb(accessToken);
          } catch (err) {
            console.error('[SDK] Failed to get access token:', err);
            setError('Failed to authenticate with Spotify');
          }
        },
        volume: 0.5,
      });

      // ── Event Listeners ─────────────────────────────────────

      // Device is ready to receive commands
      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('[SDK] ✅ Ready with Device ID:', device_id);
        setDeviceId(device_id);
        setIsReady(true);
        setPlayerState((prev) => ({
          ...prev,
          deviceId: device_id,
          isReady: true,
        }));
      });

      // Device has gone offline
      player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('[SDK] ⚠️ Device not ready:', device_id);
        setIsReady(false);
      });

      // Playback state changed (track changed, play/pause, etc.)
      player.addListener('player_state_changed', (state: any) => {
        if (!state) return;

        const currentTrack = state.track_window.current_track;
        const track: SpotifyTrack | null = currentTrack ? {
          id:           currentTrack.id,
          name:         currentTrack.name,
          uri:          currentTrack.uri,
          duration_ms:  currentTrack.duration_ms,
          artists:      currentTrack.artists.map((a: any) => ({
            id:   a.uri.split(':')[2],
            name: a.name,
            uri:  a.uri,
          })),
          album: {
            id:           currentTrack.album.uri.split(':')[2],
            name:         currentTrack.album.name,
            images:       currentTrack.album.images,
            release_date: '',
            uri:          currentTrack.album.uri,
            artists:      [],
            album_type:   '',
            total_tracks: 0,
          },
          preview_url:  null,
          popularity:   0,
          track_number: 0,
          explicit:     false,
        } : null;

        setPlayerState((prev) => ({
          ...prev,
          isPlaying:    !state.paused,
          currentTrack: track,
          progress:     state.position,
          duration:     state.duration,
          shuffle:      state.shuffle,
          repeat:       state.repeat_mode === 0 ? 'off' :
                        state.repeat_mode === 1 ? 'context' : 'track',
        }));
      });

      // Error handlers
      player.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('[SDK] Initialization error:', message);
        setError(`SDK initialization failed: ${message}`);
      });

      player.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('[SDK] Authentication error:', message);
        setError('Spotify authentication expired. Please login again.');
      });

      player.addListener('account_error', ({ message }: { message: string }) => {
        console.error('[SDK] Account error:', message);
        setError('Spotify Premium is required for in-browser playback.');
      });

      player.addListener('playback_error', ({ message }: { message: string }) => {
        console.error('[SDK] Playback error:', message);
      });

      // ── Connect the player ─────────────────────────────────
      const connected = await player.connect();

      if (connected) {
        console.log('[SDK] ✅ Player connected successfully');
        playerRef.current = player;
      } else {
        setError('Failed to connect to Spotify');
      }

    } catch (err: any) {
      console.error('[SDK] Setup failed:', err);
      setError(err.message || 'Failed to initialize Spotify player');
    }
  }, [loadSdkScript]);


  // ---------------------------------------------------------------------------
  // Mount/Unmount lifecycle
  // ---------------------------------------------------------------------------
  useEffect(() => {
    initializePlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
        console.log('[SDK] Player disconnected');
      }
    };
  }, [initializePlayer]);


  // ---------------------------------------------------------------------------
  // Progress tracker — polls position while playing
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!playerState.isPlaying || !playerRef.current) return;

    const interval = setInterval(async () => {
      const state = await playerRef.current?.getCurrentState();
      if (state) {
        setPlayerState((prev) => ({
          ...prev,
          progress: state.position,
        }));
      }
    }, 500); // Update every 500ms

    return () => clearInterval(interval);
  }, [playerState.isPlaying]);


  return {
    player: playerRef.current,
    playerState,
    deviceId,
    isReady,
    error,
  };
}
