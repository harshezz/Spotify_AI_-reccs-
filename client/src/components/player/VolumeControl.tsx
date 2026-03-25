// ============================================================
// src/components/player/VolumeControl.tsx — Volume Slider
// ============================================================
// A sleek volume control with mute toggle and smooth slider.
// Matches the aesthetic of Apple Music / Spotify controls.
// ============================================================

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface VolumeControlProps {
  volume:       number;    // 0-100
  isMuted:      boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute:   () => void;
  className?:   string;
}

export default function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  className = '',
}: VolumeControlProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const displayVolume = isMuted ? 0 : volume;

  // ── Volume icon based on level ──────────────────────────────
  const VolumeIcon = () => {
    if (isMuted || volume === 0) {
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (volume < 50) {
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
        <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M19.07 4.93a10 10 0 010 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  };

  // ── Calculate volume from mouse position ────────────────────
  const getVolumeFromEvent = useCallback((clientX: number): number => {
    if (!sliderRef.current) return volume;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
  }, [volume]);

  // ── Click to set volume ─────────────────────────────────────
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      onVolumeChange(getVolumeFromEvent(e.clientX));
    },
    [onVolumeChange, getVolumeFromEvent]
  );

  // ── Drag handlers ──────────────────────────────────────────
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);

    const handleMove = (e: MouseEvent) => {
      onVolumeChange(getVolumeFromEvent(e.clientX));
    };

    const handleUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [onVolumeChange, getVolumeFromEvent]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Mute toggle button */}
      <button
        onClick={onToggleMute}
        className="text-white/60 hover:text-white transition-colors duration-200 p-1"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon />
      </button>

      {/* Volume slider */}
      <div
        ref={sliderRef}
        className="group relative w-24 h-5 flex items-center cursor-pointer"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
      >
        {/* Track background */}
        <div className="absolute inset-x-0 h-[3px] rounded-full bg-white/10 group-hover:h-[5px] transition-all duration-200" />

        {/* Volume fill */}
        <div
          className="absolute h-[3px] rounded-full bg-white/80 group-hover:h-[5px] transition-[height] duration-200"
          style={{ width: `${displayVolume}%` }}
        />

        {/* Knob */}
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ left: `calc(${displayVolume}% - 6px)` }}
          animate={{ scale: isDragging ? 1.3 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      </div>
    </div>
  );
}
