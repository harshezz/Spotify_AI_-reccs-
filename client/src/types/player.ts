// ============================================================
// src/types/player.ts — Player State Type Definitions
// ============================================================

import { SpotifyTrack } from './spotify';

// ---------------------------------------------------------------------------
// Player State — Internal app state for the audio player
// ---------------------------------------------------------------------------
export interface PlayerState {
  isPlaying:     boolean;
  currentTrack:  SpotifyTrack | null;
  progress:      number;   // current position in ms
  duration:      number;   // total duration in ms
  volume:        number;   // 0-100
  isMuted:       boolean;
  shuffle:       boolean;
  repeat:        'off' | 'track' | 'context';
  deviceId:      string | null;
  isReady:       boolean;  // SDK connected and ready
}

// ---------------------------------------------------------------------------
// Player Actions — what the PlayerContext can do
// ---------------------------------------------------------------------------
export interface PlayerActions {
  play:          (uri?: string, contextUri?: string) => Promise<void>;
  pause:         () => Promise<void>;
  resume:        () => Promise<void>;
  next:          () => Promise<void>;
  previous:      () => Promise<void>;
  seek:          (positionMs: number) => Promise<void>;
  setVolume:     (percent: number) => Promise<void>;
  toggleMute:    () => void;
  toggleShuffle: () => Promise<void>;
  toggleRepeat:  () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Equalizer Data — frequency data for canvas visualization
// ---------------------------------------------------------------------------
export interface EqualizerData {
  frequencyData:  number[];    // Raw frequency bin values (0-255)
  barCount:       number;      // Number of bars to render
  isActive:       boolean;     // Whether audio is currently being analyzed
}
