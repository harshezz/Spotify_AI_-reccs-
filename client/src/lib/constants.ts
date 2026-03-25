// ============================================================
// src/lib/constants.ts — Application Constants
// ============================================================

export const APP_NAME = 'Vibe';
export const APP_DESCRIPTION = 'Your personal AI-powered music experience';

// Spotify Web Playback SDK script URL
export const SPOTIFY_SDK_URL = 'https://sdk.scdn.co/spotify-player.js';

// Default equalizer settings
export const EQUALIZER = {
  BAR_COUNT:     64,       // number of frequency bars to display
  BAR_GAP:       2,        // pixels between bars
  MIN_BAR_HEIGHT: 3,       // minimum bar height (so you always see something)
  SMOOTHING:     0.8,      // FFT smoothing (0-1, higher = smoother)
  FFT_SIZE:      256,      // FFT analysis size (power of 2)
} as const;

// Colors used in the equalizer gradient
export const EQUALIZER_COLORS = {
  start:  '#8B5CF6',  // violet
  middle: '#EC4899',  // pink
  end:    '#F97316',  // orange
} as const;

// Breakpoints matching Tailwind defaults
export const BREAKPOINTS = {
  sm:  640,
  md:  768,
  lg:  1024,
  xl:  1280,
  '2xl': 1536,
} as const;
