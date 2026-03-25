'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const { accentHex } = useTheme();

  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2',
  };

  const variantStyles = {
    primary: {
      background: accentHex,
      color: 'white',
      hover: `hover:brightness-110 active:scale-[0.98]`,
    },
    secondary: {
      background: 'var(--bg-card)',
      color: 'var(--fg)',
      border: '1px solid var(--border)',
      hover: `hover:bg-[var(--bg-hover)] active:scale-[0.98]`,
    },
    ghost: {
      background: 'transparent',
      color: 'var(--fg-secondary)',
      hover: `hover:bg-[var(--bg-hover)]`,
    },
    danger: {
      background: '#ef444420',
      color: '#ef4444',
      border: '1px solid #ef444430',
      hover: `hover:bg-[#ef444430] active:scale-[0.98]`,
    },
  };

  const style = variantStyles[variant];

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`${baseStyles} ${sizeStyles[size]} ${className}`}
      style={{
        background: style.background,
        color: style.color,
        border: style.border,
        ...style,
      }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <motion.div
          className="w-4 h-4 rounded-full border-2 border-transparent border-t-current"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {children}
    </motion.button>
  );
}
