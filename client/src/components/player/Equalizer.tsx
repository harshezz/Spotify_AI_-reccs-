// ============================================================
// src/components/player/Equalizer.tsx — Canvas-Based Equalizer
// ============================================================
// A stunning real-time audio visualizer using HTML5 Canvas.
// Renders frequency bars with a gradient fill, glow effects,
// and smooth animations. Designed to look like a premium
// music app equalizer (Apple Music / Spotify inspired).
//
// Uses the useEqualizer hook for data (real or simulated).
// ============================================================

'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { EQUALIZER, EQUALIZER_COLORS } from '@/lib/constants';

interface EqualizerProps {
  isPlaying:      boolean;
  audioElement?:  HTMLAudioElement | null;
  width?:         number;
  height?:        number;
  barCount?:      number;
  className?:     string;
  variant?:       'full' | 'mini' | 'circular';
}

export default function Equalizer({
  isPlaying,
  audioElement,
  width = 600,
  height = 200,
  barCount = EQUALIZER.BAR_COUNT,
  className = '',
  variant = 'full',
}: EqualizerProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const audioCtxRef  = useRef<AudioContext | null>(null);
  const sourceRef    = useRef<MediaElementAudioSourceNode | null>(null);

  // ---------------------------------------------------------------------------
  // Setup Web Audio API (when real audio element is provided)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!audioElement) return;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      const ctx = audioCtxRef.current;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = EQUALIZER.FFT_SIZE;
      analyser.smoothingTimeConstant = EQUALIZER.SMOOTHING;
      analyserRef.current = analyser;

      if (!sourceRef.current) {
        const source = ctx.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        sourceRef.current = source;
      }
    } catch (err) {
      console.warn('[Equalizer] Web Audio setup failed:', err);
    }
  }, [audioElement]);


  // ---------------------------------------------------------------------------
  // Simulated frequency data generator
  // ---------------------------------------------------------------------------
  function generateSimulatedData(timestamp: number, count: number, playing: boolean): Uint8Array {
    const data = new Uint8Array(count);
    const time = timestamp * 0.002;

    for (let i = 0; i < count; i++) {
      if (!playing) {
        // Gentle idle wave
        data[i] = Math.sin(i * 0.2 + timestamp * 0.0008) * 6 + 8;
        continue;
      }

      const pos = i / count;

      // Bass (heavy, pulsing)
      const bass = Math.max(0, 1 - pos * 2.5) *
        (Math.sin(time * 2.3) * 0.35 + 0.65) *
        (Math.sin(time * 0.7) * 0.2 + 0.8);

      // Mids (melodic movement)
      const mid = Math.exp(-Math.pow(pos - 0.3, 2) * 15) *
        (Math.sin(time * 3.1 + pos * 6) * 0.4 + 0.6);

      // Upper mids
      const upperMid = Math.exp(-Math.pow(pos - 0.55, 2) * 10) *
        (Math.sin(time * 4.7 + pos * 10) * 0.35 + 0.55);

      // Treble (sparkly)
      const treble = Math.max(0, pos - 0.6) * 1.8 *
        (Math.sin(time * 6.3 + pos * 12) * 0.45 + 0.5) * 0.5;

      const combined = bass + mid + upperMid + treble;
      const noise = Math.random() * 0.12;

      data[i] = Math.min(255, Math.max(
        EQUALIZER.MIN_BAR_HEIGHT,
        Math.floor((combined + noise) * 170)
      ));
    }

    return data;
  }


  // ---------------------------------------------------------------------------
  // Canvas Rendering Loop
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const render = (timestamp: number) => {
      ctx.clearRect(0, 0, width, height);

      // Get frequency data
      let data: number[];
      if (analyserRef.current) {
        const rawData = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(rawData);
        data = Array.from(rawData);
      } else {
        data = Array.from(generateSimulatedData(timestamp, barCount, isPlaying));
      }

      if (variant === 'circular') {
        renderCircular(ctx, data, width, height);
      } else if (variant === 'mini') {
        renderMini(ctx, data, width, height);
      } else {
        renderFull(ctx, data, width, height);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [width, height, barCount, isPlaying, variant]);


  // ---------------------------------------------------------------------------
  // Render: Full Bars (default)
  // ---------------------------------------------------------------------------
  function renderFull(
    ctx: CanvasRenderingContext2D,
    data: number[],
    w: number,
    h: number
  ) {
    const barW = (w - (barCount - 1) * EQUALIZER.BAR_GAP) / barCount;

    // Create gradient
    const grad = ctx.createLinearGradient(0, h, 0, 0);
    grad.addColorStop(0, EQUALIZER_COLORS.start);
    grad.addColorStop(0.5, EQUALIZER_COLORS.middle);
    grad.addColorStop(1, EQUALIZER_COLORS.end);

    // Reflection gradient (subtle)
    const reflGrad = ctx.createLinearGradient(0, h, 0, h + 40);
    reflGrad.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
    reflGrad.addColorStop(1, 'rgba(139, 92, 246, 0)');

    for (let i = 0; i < barCount; i++) {
      const value = data[i % data.length] || 0;
      const barH = Math.max(
        EQUALIZER.MIN_BAR_HEIGHT,
        (value / 255) * h * 0.85
      );

      const x = i * (barW + EQUALIZER.BAR_GAP);
      const y = h - barH;
      const radius = Math.min(barW / 2, 4);

      // Main bar
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + barW - radius, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
      ctx.lineTo(x + barW, h);
      ctx.lineTo(x, h);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();

      // Glow effect for tall bars
      if (barH > h * 0.5) {
        ctx.save();
        ctx.shadowColor = EQUALIZER_COLORS.middle;
        ctx.shadowBlur = 12 * (barH / h);
        ctx.fill();
        ctx.restore();
      }

      // Top peak indicator dot
      if (barH > h * 0.3) {
        ctx.fillStyle = EQUALIZER_COLORS.end;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(x, y - 3, barW, 2);
        ctx.globalAlpha = 1;
      }
    }
  }


  // ---------------------------------------------------------------------------
  // Render: Mini (compact for the now-playing bar)
  // ---------------------------------------------------------------------------
  function renderMini(
    ctx: CanvasRenderingContext2D,
    data: number[],
    w: number,
    h: number
  ) {
    const miniBarCount = Math.min(barCount, 24);
    const barW = (w - (miniBarCount - 1) * 2) / miniBarCount;

    const grad = ctx.createLinearGradient(0, h, 0, 0);
    grad.addColorStop(0, EQUALIZER_COLORS.start);
    grad.addColorStop(1, EQUALIZER_COLORS.middle);

    for (let i = 0; i < miniBarCount; i++) {
      const dataIndex = Math.floor(i * (data.length / miniBarCount));
      const value = data[dataIndex] || 0;
      const barH = Math.max(2, (value / 255) * h * 0.9);

      const x = i * (barW + 2);
      const y = h - barH;

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 1);
      ctx.fill();
    }
  }


  // ---------------------------------------------------------------------------
  // Render: Circular (for the full-screen player)
  // ---------------------------------------------------------------------------
  function renderCircular(
    ctx: CanvasRenderingContext2D,
    data: number[],
    w: number,
    h: number
  ) {
    const centerX = w / 2;
    const centerY = h / 2;
    const radius = Math.min(w, h) * 0.3;
    const circBarCount = Math.min(barCount, 80);

    for (let i = 0; i < circBarCount; i++) {
      const angle = (i / circBarCount) * Math.PI * 2 - Math.PI / 2;
      const dataIndex = Math.floor(i * (data.length / circBarCount));
      const value = data[dataIndex] || 0;
      const barLen = Math.max(4, (value / 255) * radius * 0.6);

      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barLen);
      const y2 = centerY + Math.sin(angle) * (radius + barLen);

      const intensity = value / 255;
      const r = Math.floor(139 + (249 - 139) * intensity);
      const g = Math.floor(92 + (115 - 92) * intensity);
      const b = Math.floor(246 + (22 - 246) * intensity);

      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.6 + intensity * 0.4})`;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Glow
      if (intensity > 0.55) {
        ctx.save();
        ctx.shadowColor = EQUALIZER_COLORS.middle;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
      }
    }
  }


  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <canvas
        ref={canvasRef}
        style={{ width, height }}
        className="block"
      />

      {/* Subtle reflection effect below the bars */}
      {variant === 'full' && (
        <div
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(139, 92, 246, 0.08), transparent)',
            transform: 'scaleY(-1)',
            filter: 'blur(2px)',
          }}
        />
      )}
    </motion.div>
  );
}
