// ============================================================
// src/components/player/AudioPlayer.tsx — Main Audio Player
// ============================================================
// The flagship component that assembles all player sub-components
// into a cohesive, premium music player experience.
//
// Layout (inspired by Apple Music / Spotify):
// ┌───────────────────────────────────────────────────────────┐
// │                   🎵 EQUALIZER CANVAS                    │
// │                   (frequency bars here)                  │
// ├───────────────────────────────────────────────────────────┤
// │  ┌────┐                                                  │
// │  │🎼  │  Track Name                    🔊 ──────── vol  │
// │  │art │  Artist Name                                     │
// │  └────┘                                                  │
// │         ○── 1:32 ────────────────── 3:45 ──○             │
// │              ⟲   ⏮   ▶   ⏭   🔁                       │
// └───────────────────────────────────────────────────────────┘
//
// This component is designed to be used in two modes:
//   1. As the main full-height player (in a dedicated view)
//   2. As a compact "Now Playing" bar (at bottom of dashboard)
// ============================================================

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

import Equalizer          from './Equalizer';
import ProgressBar        from './ProgressBar';
import PlaybackControls   from './PlaybackControls';
import VolumeControl      from './VolumeControl';

import { SpotifyTrack }   from '@/types/spotify';
import { formatArtists, getBestImage } from '@/lib/utils';
import { slideUp, fadeIn, scaleIn } from '@/styles/animations';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface AudioPlayerProps {
  // Current track data
  currentTrack:   SpotifyTrack | null;
  isPlaying:      boolean;
  progress:       number;     // current position in ms
  duration:       number;     // total duration in ms
  volume:         number;     // 0-100
  isMuted:        boolean;
  shuffle:        boolean;
  repeat:         'off' | 'track' | 'context';

  // Playback control handlers
  onPlay:         () => void;
  onPause:        () => void;
  onNext:         () => void;
  onPrevious:     () => void;
  onSeek:         (positionMs: number) => void;
  onVolumeChange: (percent: number) => void;
  onToggleMute:   () => void;
  onToggleShuffle: () => void;
  onToggleRepeat:  () => void;

  // Optional: audio element for real equalizer data
  audioElement?:  HTMLAudioElement | null;

  // Layout variant
  variant?:       'full' | 'compact';

  className?:     string;
}


export default function AudioPlayer({
  currentTrack,
  isPlaying,
  progress,
  duration,
  volume,
  isMuted,
  shuffle,
  repeat,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  audioElement,
  variant = 'full',
  className = '',
}: AudioPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // ---------------------------------------------------------------------------
  // Album Art URL
  // ---------------------------------------------------------------------------
  const albumArt = currentTrack
    ? getBestImage(currentTrack.album.images, 'large')
    : '/images/placeholder-album.svg';

  const trackName  = currentTrack?.name || 'No Track Playing';
  const artistName = currentTrack ? formatArtists(currentTrack.artists) : 'Select a track to start';


  // ═══════════════════════════════════════════════════════════════
  // FULL VARIANT — Large player with equalizer
  // ═══════════════════════════════════════════════════════════════
  if (variant === 'full') {
    return (
      <motion.div
        className={`relative w-full max-w-2xl mx-auto ${className}`}
        variants={slideUp}
        initial="hidden"
        animate="visible"
      >
        {/* ── Background Blur (album color bleed) ────────────── */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          {currentTrack && (
            <div
              className="absolute inset-0 scale-150 blur-3xl opacity-30"
              style={{
                backgroundImage: `url(${albumArt})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
        </div>

        {/* ── Main Player Container ───────────────────────────── */}
        <div className="relative p-8 rounded-3xl border border-white/[0.06]">

          {/* ── Equalizer Visualization ────────────────────────── */}
          <div className="mb-8 flex justify-center">
            <Equalizer
              isPlaying={isPlaying}
              audioElement={audioElement}
              width={520}
              height={160}
              barCount={48}
              variant="full"
            />
          </div>

          {/* ── Track Info + Album Art ──────────────────────────── */}
          <div className="flex items-center gap-5 mb-6">
            {/* Album Art */}
            <motion.div
              className="relative w-16 h-16 rounded-xl overflow-hidden shadow-2xl shadow-purple-500/20 flex-shrink-0"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              key={currentTrack?.id || 'empty'}
            >
              {currentTrack ? (
                <Image
                  src={albumArt}
                  alt={`${trackName} album art`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 opacity-60">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}
            </motion.div>

            {/* Track Name + Artist */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.h3
                  key={trackName}
                  className="text-white font-semibold text-lg truncate"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {trackName}
                </motion.h3>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.p
                  key={artistName}
                  className="text-white/50 text-sm truncate mt-0.5"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, delay: 0.05 }}
                >
                  {artistName}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Volume */}
            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={onVolumeChange}
              onToggleMute={onToggleMute}
            />
          </div>

          {/* ── Progress Bar ────────────────────────────────────── */}
          <ProgressBar
            progress={progress}
            duration={duration}
            onSeek={onSeek}
            className="mb-4"
          />

          {/* ── Playback Controls ───────────────────────────────── */}
          <PlaybackControls
            isPlaying={isPlaying}
            shuffle={shuffle}
            repeat={repeat}
            onPlay={onPlay}
            onPause={onPause}
            onNext={onNext}
            onPrevious={onPrevious}
            onToggleShuffle={onToggleShuffle}
            onToggleRepeat={onToggleRepeat}
          />
        </div>
      </motion.div>
    );
  }


  // ═══════════════════════════════════════════════════════════════
  // COMPACT VARIANT — Now Playing Bar (bottom of screen)
  // ═══════════════════════════════════════════════════════════════
  return (
    <motion.div
      className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}
      variants={slideUp}
      initial="hidden"
      animate="visible"
    >
      {/* Glass background */}
      <div className="relative bg-black/80 backdrop-blur-2xl border-t border-white/[0.06]">

        {/* Progress bar at the very top of the bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5">
          <motion.div
            className="h-full"
            style={{
              width: `${duration > 0 ? (progress / duration) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
            }}
            layout
          />
        </div>

        <div className="flex items-center gap-4 px-4 py-3 max-w-screen-2xl mx-auto">
          {/* ── Left: Track Info ───────────────────────────────── */}
          <div className="flex items-center gap-3 flex-1 min-w-0 max-w-xs">
            {/* Mini album art */}
            <motion.div
              className="relative w-12 h-12 rounded-lg overflow-hidden shadow-lg flex-shrink-0"
              key={currentTrack?.id || 'empty-compact'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {currentTrack ? (
                <Image
                  src={getBestImage(currentTrack.album.images, 'small')}
                  alt={trackName}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-600/50 to-pink-600/50 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 opacity-40">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}
            </motion.div>

            {/* Track text */}
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{trackName}</p>
              <p className="text-white/40 text-xs truncate">{artistName}</p>
            </div>
          </div>

          {/* ── Center: Controls + Progress ────────────────────── */}
          <div className="flex flex-col items-center gap-1 flex-1 max-w-lg">
            <PlaybackControls
              isPlaying={isPlaying}
              shuffle={shuffle}
              repeat={repeat}
              onPlay={onPlay}
              onPause={onPause}
              onNext={onNext}
              onPrevious={onPrevious}
              onToggleShuffle={onToggleShuffle}
              onToggleRepeat={onToggleRepeat}
              className="!gap-3"
            />
            <ProgressBar
              progress={progress}
              duration={duration}
              onSeek={onSeek}
              className="w-full"
            />
          </div>

          {/* ── Right: Volume + Mini Equalizer ─────────────────── */}
          <div className="flex items-center gap-3 flex-1 justify-end max-w-xs">
            {/* Mini equalizer */}
            <Equalizer
              isPlaying={isPlaying}
              width={60}
              height={28}
              barCount={12}
              variant="mini"
            />

            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={onVolumeChange}
              onToggleMute={onToggleMute}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
