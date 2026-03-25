'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  image?: string;
  title?: string;
  subtitle?: string;
}

export default function Card({ 
  children, 
  className = '', 
  onClick,
  hover = true,
  image,
  title,
  subtitle,
}: CardProps) {
  const Component = onClick ? motion.button : motion.div;
  
  return (
    <Component
      onClick={onClick}
      whileHover={hover ? { scale: 1.02 } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      className={`rounded-2xl overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ 
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      {image && (
        <div className="relative aspect-square">
          <Image
            src={image}
            alt={title || 'Card image'}
            fill
            className="object-cover"
          />
        </div>
      )}
      {(title || subtitle) && (
        <div className="p-4">
          {title && (
            <h3 className="text-sm font-bold text-white truncate mb-1">{title}</h3>
          )}
          {subtitle && (
            <p className="text-xs truncate" style={{ color: 'var(--fg-muted)' }}>{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </Component>
  );
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="aspect-square animate-pulse" style={{ background: 'var(--bg-hover)' }} />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: 'var(--bg-hover)' }} />
        <div className="h-3 w-1/2 rounded animate-pulse" style={{ background: 'var(--bg-hover)' }} />
      </div>
    </div>
  );
}
