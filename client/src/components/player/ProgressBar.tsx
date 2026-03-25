// ============================================================
// src/components/player/ProgressBar.tsx — Track Progress Bar
// ============================================================
// A sleek, interactive progress bar with:
//   - Click-to-seek functionality
//   - Drag-to-seek with smooth tracking
//   - Elapsed/remaining time display
//   - Premium hover expansion effect
// ============================================================

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { formatDuration } from '@/lib/utils';

interface ProgressBarProps {
  progress:     number;    // current position in ms
  duration:     number;    // total duration in ms
  onSeek:       (positionMs: number) => void;
  className?:   string;
}

export default function ProgressBar({
  progress,
  duration,
  onSeek,
  className = '',
}: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);

  const percent = duration > 0 ? (progress / duration) * 100 : 0;

  // ── Calculate position from mouse/touch event ───────────────
  const getPercentFromEvent = useCallback(
    (clientX: number): number => {
      if (!barRef.current) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      return Math.max(0, Math.min(100, (x / rect.width) * 100));
    },
    []
  );

  // ── Click to seek ───────────────────────────────────────────
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const pct = getPercentFromEvent(e.clientX);
      onSeek(Math.floor((pct / 100) * duration));
    },
    [duration, onSeek, getPercentFromEvent]
  );

  // ── Drag handlers ──────────────────────────────────────────
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);

    const handleMouseMove = (e: MouseEvent) => {
      const pct = getPercentFromEvent(e.clientX);
      setHoverPercent(pct);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const pct = getPercentFromEvent(e.clientX);
      onSeek(Math.floor((pct / 100) * duration));
      setIsDragging(false);
      setHoverPercent(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [duration, onSeek, getPercentFromEvent]);

  // ── Hover tracking ──────────────────────────────────────────
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) {
        setHoverPercent(getPercentFromEvent(e.clientX));
      }
    },
    [isDragging, getPercentFromEvent]
  );

  const displayPercent = isDragging && hoverPercent !== null ? hoverPercent : percent;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Elapsed time */}
      <span className="text-[11px] font-medium text-white/50 tabular-nums w-10 text-right select-none">
        {formatDuration(isDragging && hoverPercent !== null
          ? (hoverPercent / 100) * duration
          : progress)}
      </span>

      {/* Track bar */}
      <div
        ref={barRef}
        className="group relative flex-1 h-5 flex items-center cursor-pointer"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => !isDragging && setHoverPercent(null)}
      >
        {/* Background track */}
        <div className="absolute inset-x-0 h-[3px] rounded-full bg-white/10 group-hover:h-[5px] transition-all duration-200" />

        {/* Hover preview */}
        {hoverPercent !== null && (
          <div
            className="absolute h-[3px] rounded-full bg-white/15 group-hover:h-[5px] transition-all duration-200"
            style={{ width: `${hoverPercent}%` }}
          />
        )}

        {/* Progress fill */}
        <motion.div
          className="absolute h-[3px] rounded-full group-hover:h-[5px] transition-[height] duration-200"
          style={{
            width: `${displayPercent}%`,
            background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
          }}
          layout
        />

        {/* Seek knob (visible on hover/drag) */}
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-white shadow-lg shadow-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ left: `calc(${displayPercent}% - 6px)` }}
          animate={{
            scale: isDragging ? 1.3 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      </div>

      {/* Remaining time */}
      <span className="text-[11px] font-medium text-white/50 tabular-nums w-10 select-none">
        -{formatDuration(Math.max(0, duration - (isDragging && hoverPercent !== null
          ? (hoverPercent / 100) * duration
          : progress)))}
      </span>
    </div>
  );
}
