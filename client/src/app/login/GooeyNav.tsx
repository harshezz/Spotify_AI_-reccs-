'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function GooeyNav({
  items,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  initialActiveIndex = 0,
  animationTime = 600,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
}: any) {
  const [isClicked, setIsClicked] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate particles only on the client to prevent SSR hydration mismatches
    const generatedParticles = Array.from({ length: particleCount }).map((_, i) => {
      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5);
      const distanceMax = particleDistances[0];
      const distanceMin = particleDistances[1] || 0;
      const distance = Math.random() * (distanceMax - distanceMin) + distanceMin;
      
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        r: Math.random() * (particleR * 0.15) + (particleR * 0.05), // random size
        delay: Math.random() * (timeVariance / 1000),
        duration: (animationTime / 1000) * (0.8 + Math.random() * 0.4)
      };
    });
    setParticles(generatedParticles);
  }, [particleCount, particleDistances, particleR, timeVariance, animationTime]);

  return (
    <div className="relative inline-flex items-center justify-center w-full h-full">
      {/* SVG gooey filter defined invisibly */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Physics Layer (The White Boiling Aura) */}
      <div style={{ filter: 'url(#gooey)' }} className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
        
        {/* Click Particles that eject out (Bubbles) */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute top-1/2 left-1/2 bg-white rounded-full"
            style={{ width: p.r * 2, height: p.r * 2, marginLeft: -p.r, marginTop: -p.r }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{ 
              x: isClicked ? p.x * 2.5 : 0, 
              y: isClicked ? p.y * 1.8 : 0,
              opacity: isClicked ? 1 : 0,
              scale: isClicked ? 1 : 0 
            }}
            transition={{ 
              duration: p.duration, 
              delay: isClicked ? p.delay : 0,
              type: "spring",
              stiffness: 150,
              damping: 12
            }}
          />
        ))}

        {/* The Core Liquid Blob - Shrunk to hide perfectly behind the button */}
        {items.map((item: any, idx: number) => (
          <div key={`blob-${idx}`} className="w-[180px] h-[30px] bg-white rounded-full shrink-0" />
        ))}
      </div>

      {/* Crisp UI Layer */}
      <div className="relative z-20 flex items-center justify-center pointer-events-auto">
        {items.map((item: any, idx: number) => (
          <motion.div 
            key={idx}
            onClick={() => {
              setIsClicked(true);
              if (item.onClick) item.onClick();
              setTimeout(() => setIsClicked(false), 2000);
            }}
            className="group relative flex items-center justify-center gap-3 w-[260px] h-[56px] rounded-full cursor-pointer overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] mx-auto"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Restored the subtle sleek spinning gradient */}
            <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,rgba(255,255,255,0.3)_0%,#000000_50%,rgba(255,255,255,0.3)_100%)] block opacity-50 group-hover:opacity-100 transition-opacity" />
            
            {/* Solid Dark Core tightly framing the rim */}
            <div className="relative flex items-center justify-center gap-3 w-[calc(100%-2px)] h-[calc(100%-2px)] bg-black backdrop-blur-2xl rounded-full transition-colors group-hover:bg-zinc-900">
              {item.icon}
              <span className="text-base font-bold text-white tracking-wide whitespace-nowrap">{item.label}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
