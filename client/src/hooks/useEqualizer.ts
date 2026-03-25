// ============================================================
// src/hooks/useEqualizer.ts — Real-Time Audio Equalizer Hook
// ============================================================
// This hook provides real-time frequency analysis data for the
// canvas-based equalizer visualization.
//
// STRATEGY:
// Since the Spotify Web Playback SDK doesn't expose raw audio
// nodes that can be connected to the Web Audio API, we use
// a dual approach:
//
//   1. PRIMARY: If a <audio> element is available (e.g., playing
//      a 30-second preview URL), we route it through an
//      AnalyserNode for real-time FFT data.
//
//   2. FALLBACK: If no audio node is available (SDK-only playback),
//      we generate convincing simulated frequency data that
//      syncs with the playback state (playing/paused) and
//      reacts to tempo changes.
//
// The hook returns a Uint8Array of frequency data and a ref
// for the canvas to consume.
// ============================================================

import { useEffect, useRef, useCallback, useState } from 'react';
import { EQUALIZER } from '@/lib/constants';

interface UseEqualizerOptions {
  barCount?:     number;    // Number of frequency bars (default: 64)
  fftSize?:      number;    // FFT size for analyzer (default: 256)
  smoothing?:    number;    // Smoothing constant 0-1 (default: 0.8)
  isPlaying:     boolean;   // Whether audio is currently playing
  audioElement?: HTMLAudioElement | null;  // Optional: real <audio> element
}

interface UseEqualizerReturn {
  frequencyData:   number[];
  canvasRef:       React.RefObject<HTMLCanvasElement | null>;
  isRealAudio:     boolean;       // true = real FFT data, false = simulated
}

export function useEqualizer({
  barCount  = EQUALIZER.BAR_COUNT,
  fftSize   = EQUALIZER.FFT_SIZE,
  smoothing = EQUALIZER.SMOOTHING,
  isPlaying,
  audioElement,
}: UseEqualizerOptions): UseEqualizerReturn {

  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const animFrameRef    = useRef<number>(0);
  const analyserRef     = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef       = useRef<MediaElementAudioSourceNode | null>(null);

  const [frequencyData, setFrequencyData] = useState<number[]>(
    Array.from(new Uint8Array(barCount))
  );
  const [isRealAudio, setIsRealAudio] = useState(false);

  // ---------------------------------------------------------------------------
  // Setup Web Audio API connection (when a real audio element is provided)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!audioElement) {
      setIsRealAudio(false);
      return;
    }

    try {
      // Create AudioContext (reuse if already exists)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;

      // Create AnalyserNode for frequency analysis
      const analyser = ctx.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothing;
      analyserRef.current = analyser;

      // Connect the audio element to the analyser
      // Only create source once per audio element
      if (!sourceRef.current) {
        const source = ctx.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        sourceRef.current = source;
      }

      setIsRealAudio(true);
    } catch (err) {
      console.warn('[Equalizer] Web Audio API setup failed, using simulation:', err);
      setIsRealAudio(false);
    }

    // Cleanup
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [audioElement, fftSize, smoothing]);


  // ---------------------------------------------------------------------------
  // Generate simulated frequency data (when real audio isn't available)
  // ---------------------------------------------------------------------------
  const generateSimulatedData = useCallback(
    (timestamp: number): Uint8Array => {
      const data = new Uint8Array(barCount);

      if (!isPlaying) {
        // When paused, bars settle to minimal height with gentle wave
        for (let i = 0; i < barCount; i++) {
          data[i] = Math.sin(i * 0.3 + timestamp * 0.001) * 8 + 10;
        }
        return data;
      }

      // When playing, generate convincing music-like frequency distribution
      const time = timestamp * 0.002;

      for (let i = 0; i < barCount; i++) {
        const normalizedPos = i / barCount;

        // Bass frequencies (left side) — heavier, more energy
        const bassEnergy = Math.max(0, 1 - normalizedPos * 3) *
          (Math.sin(time * 2.1) * 0.3 + 0.7);

        // Mid frequencies — moderate energy with more variation
        const midEnergy = Math.exp(-Math.pow(normalizedPos - 0.35, 2) * 12) *
          (Math.sin(time * 3.7 + normalizedPos * 5) * 0.4 + 0.6);

        // Treble frequencies (right side) — lighter, sparkly
        const trebleEnergy = Math.max(0, normalizedPos - 0.5) * 2 *
          (Math.sin(time * 5.3 + normalizedPos * 8) * 0.5 + 0.5) * 0.6;

        // Combine all frequency bands
        const combined = bassEnergy + midEnergy + trebleEnergy;

        // Add some randomness for realism
        const noise = Math.random() * 0.15;

        // Scale to 0-255 range
        data[i] = Math.min(255, Math.max(
          EQUALIZER.MIN_BAR_HEIGHT,
          Math.floor((combined + noise) * 180)
        ));
      }

      return data;
    },
    [barCount, isPlaying]
  );


  // ---------------------------------------------------------------------------
  // Animation Loop — continuously renders frequency data to canvas
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (timestamp: number) => {
      const { width, height } = canvas;

      // Clear the canvas
      ctx.clearRect(0, 0, width, height);

      let data: number[];

      if (isRealAudio && analyserRef.current) {
        // ── Real Audio Mode: Read actual FFT data ────────────
        const rawData = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(rawData);
        data = Array.from(rawData);
      } else {
        // ── Simulation Mode: Generate realistic-looking data ─
        data = Array.from(generateSimulatedData(timestamp));
      }

      setFrequencyData(data);

      // ── Draw the bars ──────────────────────────────────────
      const barWidth = (width - (barCount - 1) * EQUALIZER.BAR_GAP) / barCount;
      const maxHeight = height;

      // Create gradient once per frame
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, '#8B5CF6');    // violet (bottom)
      gradient.addColorStop(0.5, '#EC4899');  // pink (middle)
      gradient.addColorStop(1, '#F97316');    // orange (top)

      for (let i = 0; i < barCount; i++) {
        const value = data[i] || 0;
        const barHeight = Math.max(
          EQUALIZER.MIN_BAR_HEIGHT,
          (value / 255) * maxHeight
        );

        const x = i * (barWidth + EQUALIZER.BAR_GAP);
        const y = height - barHeight;

        // Draw bar with rounded top corners
        ctx.fillStyle = gradient;
        ctx.beginPath();
        const radius = Math.min(barWidth / 2, 3);
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, height);
        ctx.lineTo(x, height);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();

        // Add subtle glow effect for taller bars
        if (barHeight > maxHeight * 0.6) {
          ctx.shadowColor = '#EC4899';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    // Start the animation loop
    animFrameRef.current = requestAnimationFrame(render);

    // Cleanup on unmount
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [barCount, isPlaying, isRealAudio, generateSimulatedData]);


  return {
    frequencyData,
    canvasRef,
    isRealAudio,
  };
}
