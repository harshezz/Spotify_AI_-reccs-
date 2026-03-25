'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={`animate-pulse ${variantStyles[variant]} ${className}`}
      style={{
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '40px' : '200px'),
        background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-hover) 50%, var(--bg-card) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

export function TrackSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <Skeleton variant="rectangular" width={48} height={48} className="rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="75%" height={14} />
        <Skeleton variant="text" width="50%" height={12} />
      </div>
      <Skeleton variant="text" width={40} height={12} />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <Skeleton variant="rectangular" className="aspect-square mb-4" />
      <Skeleton variant="text" width="75%" height={14} className="mb-2" />
      <Skeleton variant="text" width="50%" height={12} />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" width={80} height={80} />
      <div className="space-y-2">
        <Skeleton variant="text" width={150} height={20} />
        <Skeleton variant="text" width={200} height={14} />
      </div>
    </div>
  );
}
