'use client';

import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion';

const MAX_OVERFLOW = 50;

interface ElasticSliderProps {
  value?: number;
  onChange?: (value: number) => void;
  defaultValue?: number;
  startingValue?: number;
  maxValue?: number;
  className?: string;
  isStepped?: boolean;
  stepSize?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const decay = (value: number, max: number) => {
  if (Math.abs(value) > max) {
    return value > 0 ? max + (value - max) * 0.1 : -max + (value + max) * 0.1;
  }
  return value;
};

const ElasticSlider: React.FC<ElasticSliderProps> = ({
  value: controlledValue,
  onChange,
  defaultValue = 50,
  startingValue = 0,
  maxValue = 100,
  className = '',
  isStepped = false,
  stepSize = 1,
  leftIcon,
  rightIcon,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const x = useMotionValue(0);
  
  const width = useTransform(x, (v) => {
    if (!sliderRef.current) return 0;
    return Math.max(0, v);
  });

  const progress = useTransform(x, (v) => {
    if (!sliderRef.current) return 0;
    const width = sliderRef.current.offsetWidth;
    return Math.max(0, Math.min(1, v / width));
  });

  useMotionValueEvent(progress, "change", (latest) => {
    const newValue = startingValue + latest * (maxValue - startingValue);
    let finalValue = newValue;
    if (isStepped) {
      finalValue = Math.round(newValue / stepSize) * stepSize;
    } else {
      finalValue = Math.round(newValue);
    }
    
    setInternalValue(finalValue);
    if (isDragging && onChange) {
      onChange(finalValue);
    }
  });

  const handleDrag = (_: any, info: any) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const localX = info.point.x - rect.left;
      const overflow = 
        localX < 0 ? localX : localX > rect.width ? localX - rect.width : 0;
      
      const newX = localX < 0 
        ? decay(localX, MAX_OVERFLOW) 
        : localX > rect.width 
          ? rect.width + decay(overflow, MAX_OVERFLOW)
          : localX;

      x.set(newX);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const finalX = Math.max(0, Math.min(rect.width, x.get()));
      animate(x, finalX, {
        type: "spring",
        bounce: 0.5,
        stiffness: 400,
        damping: 30,
      });
      
      const newValue = startingValue + (finalX / rect.width) * (maxValue - startingValue);
      if (onChange) onChange(Math.round(newValue));
    }
  };

  useEffect(() => {
    const val = controlledValue !== undefined ? controlledValue : internalValue;
    if (sliderRef.current && !isDragging) {
      const rect = sliderRef.current.getBoundingClientRect();
      const p = (val - startingValue) / (maxValue - startingValue);
      x.set(p * rect.width);
    }
  }, [controlledValue, startingValue, maxValue, isDragging]);

  return (
    <div className={`flex items-center w-full gap-3 ${className}`}>
      {leftIcon && (
        <div className="flex-shrink-0 cursor-pointer text-white/40 hover:text-white transition-colors" onClick={() => {
          const rect = sliderRef.current?.getBoundingClientRect();
          if (rect) animate(x, 0, { type: "spring", bounce: 0.4 });
          if (onChange) onChange(startingValue);
        }}>
          {leftIcon}
        </div>
      )}

      <div
        ref={sliderRef}
        className="relative flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer touch-none"
        onPointerDown={(e) => {
          const rect = sliderRef.current?.getBoundingClientRect();
          if (rect) {
            const clickX = e.clientX - rect.left;
            animate(x, clickX, { type: "spring", bounce: 0.4 });
            const newValue = startingValue + (clickX / rect.width) * (maxValue - startingValue);
            if (onChange) onChange(Math.max(startingValue, Math.min(maxValue, Math.round(newValue))));
          }
        }}
      >
        <motion.div
          className="absolute h-full bg-white rounded-full"
          style={{ width }}
        />

        <motion.div
          drag="x"
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing z-10"
          style={{ x, left: -8 }}
        />
      </div>

      {rightIcon && (
        <div className="flex-shrink-0 cursor-pointer text-white/40 hover:text-white transition-colors" onClick={() => {
          const rect = sliderRef.current?.getBoundingClientRect();
          if (rect) animate(x, rect.width, { type: "spring", bounce: 0.4 });
          if (onChange) onChange(maxValue);
        }}>
          {rightIcon}
        </div>
      )}
    </div>
  );
};

export default ElasticSlider;
