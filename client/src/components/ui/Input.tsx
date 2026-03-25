'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  icon,
  rightIcon,
  className = '',
  ...props
}: InputProps) {
  const { accentHex } = useTheme();

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium" style={{ color: 'var(--fg-secondary)' }}>
          {label}
        </label>
      )}
      <div 
        className="flex items-center rounded-xl px-4 transition-all focus-within:ring-2"
        style={{ 
          background: 'var(--bg-card)',
          border: `1px solid ${error ? '#ef4444' : 'var(--border)'}`,
          ringColor: error ? '#ef4444' : accentHex,
        }}
      >
        {icon && (
          <span className="mr-3" style={{ color: 'var(--fg-muted)' }}>
            {icon}
          </span>
        )}
        <input
          className="flex-1 py-3 bg-transparent outline-none text-white placeholder-white/30"
          style={{ color: 'var(--fg)' }}
          {...props}
        />
        {rightIcon && (
          <span className="ml-3" style={{ color: 'var(--fg-muted)' }}>
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
