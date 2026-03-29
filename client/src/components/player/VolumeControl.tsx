'use client';

import React from 'react';
import ElasticSlider from './ElasticSlider';

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

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Elastic Volume slider */}
      <div className="w-32 flex items-center">
        <ElasticSlider
          defaultValue={50}
          startingValue={0}
          maxValue={100}
          value={displayVolume}
          onChange={onVolumeChange}
          leftIcon={
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleMute();
              }}
              className="p-1 shrink-0"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              <VolumeIcon />
            </button>
          }
          className="p-0!"
        />
      </div>
    </div>
  );
}
