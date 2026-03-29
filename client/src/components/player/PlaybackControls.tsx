// ============================================================
// src/components/player/PlaybackControls.tsx — Playback Buttons
// ============================================================
// Shuffle, Previous, Play/Pause, Next, Repeat controls.
// Designed with Apple Music's clean, minimal aesthetic with
// smooth hover/tap animations via Framer Motion.
// ============================================================

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PlaybackControlsProps {
  isPlaying:  boolean;
  shuffle:    boolean;
  repeat:     'off' | 'track' | 'context';
  onPlay:     () => void;
  onPause:    () => void;
  onNext:     () => void;
  onPrevious: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat:  () => void;
  className?: string;
}

export default function PlaybackControls({
  isPlaying,
  shuffle,
  repeat,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onToggleShuffle,
  onToggleRepeat,
  className = '',
}: PlaybackControlsProps) {

  const buttonBase = `
    relative flex items-center justify-center
    text-white/40 hover:text-white drop-shadow-lg
    transition-all duration-300
  `;

  const activeClass = 'text-[var(--accent)] drop-shadow-[0_0_12px_var(--accent)] hover:text-white';

  return (
    <div className={`flex items-center justify-center gap-5 ${className}`}>

      {/* ── Shuffle ─────────────────────────────────────────── */}
      <motion.button
        className={`${buttonBase} w-8 h-8 hidden md:flex ${shuffle ? activeClass : ''}`}
        onClick={onToggleShuffle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Toggle shuffle"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <path d="M16 3h5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 20L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 16v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 15l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 4l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {shuffle && (
          <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
        )}
      </motion.button>

      {/* ── Previous ────────────────────────────────────────── */}
      <motion.button
        className={`${buttonBase} w-10 h-10`}
        onClick={onPrevious}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.85 }}
        aria-label="Previous track"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M19 20L9 12l10-8v16z" />
          <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" />
        </svg>
      </motion.button>

      {/* ── Play / Pause (main button) ──────────────────────── */}
      <motion.button
        className="relative flex items-center justify-center w-14 h-14 rounded-full border border-white/10 text-white transition-all duration-300 group overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}
        onClick={isPlaying ? onPause : onPlay}
        whileHover={{ scale: 1.05, boxShadow: '0 0 30px var(--accent-alpha), inset 0 0 20px var(--accent-alpha)', borderColor: 'var(--accent)' }}
        whileTap={{ scale: 0.95 }}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-tr from-[var(--accent)] to-transparent" style={{ opacity: 0.1 }} />
        {isPlaying ? (
          // Pause icon
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] relative z-10">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          // Play icon (slightly offset right for optical centering)
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] relative z-10">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </motion.button>

      {/* ── Next ─────────────────────────────────────────────── */}
      <motion.button
        className={`${buttonBase} w-10 h-10`}
        onClick={onNext}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.85 }}
        aria-label="Next track"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M5 4l10 8-10 8V4z" />
          <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" />
        </svg>
      </motion.button>

      {/* ── Repeat ──────────────────────────────────────────── */}
      <motion.button
        className={`${buttonBase} w-8 h-8 hidden md:flex ${repeat !== 'off' ? activeClass : ''}`}
        onClick={onToggleRepeat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={`Repeat: ${repeat}`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <path d="M17 1l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 11V9a4 4 0 014-4h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 23l-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 13v2a4 4 0 01-4 4H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {repeat === 'track' && (
          <span className="absolute -top-1 -right-1 text-[9px] font-black text-[var(--accent)] drop-shadow-[0_0_4px_var(--accent)]">1</span>
        )}
        {repeat !== 'off' && (
          <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
        )}
      </motion.button>
    </div>
  );
}
