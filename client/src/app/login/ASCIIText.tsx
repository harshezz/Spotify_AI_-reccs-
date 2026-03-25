'use client';

import React, { useEffect, useRef } from 'react';

interface ASCIITextProps {
  text?: string;
  enableWaves?: boolean;
  asciiFontSize?: number;
}

export default function ASCIIText({ 
  text = "RAAG ", 
  enableWaves = true, 
  asciiFontSize = 8 
}: ASCIITextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    let offscreenData: ImageData | null = null;
    
    // Create the offscreen canvas ONCE per mount to avoid hitting WebKit canvas memory limits
    const offscreen = document.createElement('canvas');
    const octx = offscreen.getContext('2d', { willReadFrequently: true });

    const updateOffscreen = () => {
      if (!octx) return;
      
      // Keep offscreen canvas perfectly in sync with display size
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;

      const count = 5;
      const fontSizeByHeight = (canvas.height * 0.9) / count;
      const fontSizeByWidth = (canvas.width / text.length) * 1.8;
      const fontSize = Math.floor(Math.min(fontSizeByHeight, fontSizeByWidth));
      
      octx.font = `italic bold ${fontSize}px "Arial Black", Impact, sans-serif`;
      octx.fillStyle = 'white';
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';

      // Draw vertically stacked texts
      const lineSpacing = fontSize * 0.85; // Slight overlap/tight stacking
      const totalHeight = lineSpacing * (count - 1);
      const startY = (canvas.height - totalHeight) / 2;

      for (let i = 0; i < count; i++) {
        octx.fillText(text, canvas.width / 2, startY + i * lineSpacing);
      }

      if (canvas.width > 0 && canvas.height > 0) {
        offscreenData = octx.getImageData(0, 0, canvas.width, canvas.height);
      }
    };

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = (parent && parent.clientWidth > 0) ? parent.clientWidth : window.innerWidth;
      canvas.height = (parent && parent.clientHeight > 0) ? parent.clientHeight : window.innerHeight;
      updateOffscreen();
    };
    
    window.addEventListener('resize', resize);
    resize();

    const chars = ['W', 'M', '@', '#', '8', '0', 'G', 'Q', 'g', 'N'];

    const draw = () => {
      // Unconditionally keep the loop alive even if image data hasn't processed yet
      animationFrameId = requestAnimationFrame(draw);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!offscreenData) return;

      ctx.font = `bold ${asciiFontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const data = offscreenData.data;
      const step = asciiFontSize;

      const offsetAmplitude = Math.sin(time * 0.5) * 2 + 3; // Animated chromatic spread
      const cyanOffset = -offsetAmplitude;
      const redOffset = offsetAmplitude;

      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const index = (y * canvas.width + x) * 4;
          const alpha = data[index + 3];

          if (alpha > 50) {
            let waveY = y;
            if (enableWaves) {
              waveY += Math.sin(x * 0.005 + time * 2) * 8;
            }

            const charPos = Math.floor((x + y) * 0.1 + time * 5) % chars.length;
            const char = chars[charPos];

            // 1. Cyan layer (left)
            ctx.fillStyle = '#00FFFF';
            ctx.fillText(char, x + cyanOffset, waveY);

            // 2. Red layer (right)
            ctx.fillStyle = '#FF0000';
            ctx.fillText(char, x + redOffset, waveY);

            // 3. White layer (center)
            ctx.fillStyle = 'white';
            ctx.fillText(char, x, waveY);
          }
        }
      }

      time += 0.05;
    };

    // Ensure first frame processes
    animationFrameId = requestAnimationFrame(draw);

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        resize();
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pageshow', handlePageShow);
      cancelAnimationFrame(animationFrameId);
      
      // Purge backing store for maximum compatibility with client-routing cleanup
      offscreen.width = 0;
      offscreen.height = 0;
    };
  }, [text, enableWaves, asciiFontSize]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
