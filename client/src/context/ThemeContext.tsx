// ============================================================
// src/context/ThemeContext.tsx — Theme Provider
// ============================================================
// Manages light/dark mode and accent color across the app.
// Persists preference to localStorage (and Supabase when
// user is authenticated).
// ============================================================

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'dark'; // Forced dark theme
export type AccentColor = 'mono' | 'silver' | 'zinc';

interface ThemeContextValue {
  mode: ThemeMode;
  accent: AccentColor;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  accentHex: string;
}

export const ACCENT_COLORS: Record<AccentColor, { hex: string; name: string }> = {
  mono:   { hex: '#FFFFFF', name: 'Monochrome' },
  silver: { hex: '#D1D5DB', name: 'Silver' },
  zinc:   { hex: '#A1A1AA', name: 'Zinc' },
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode] = useState<ThemeMode>('dark');
  const [accent, setAccentState] = useState<AccentColor>('mono');

  // Load from localStorage on mount
  useEffect(() => {
    const savedAccent = localStorage.getItem('vibe-theme-accent') as AccentColor | null;
    if (savedAccent && Object.keys(ACCENT_COLORS).includes(savedAccent)) {
      setAccentState(savedAccent);
    }
  }, []);

  // Apply mode to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', 'dark');
    root.classList.add('dark');
    root.classList.remove('light');
    localStorage.setItem('vibe-theme-mode', 'dark');
  }, []);

  // Apply accent color as CSS variable
  useEffect(() => {
    const hex = ACCENT_COLORS[accent].hex;
    document.documentElement.style.setProperty('--accent', hex);
    document.documentElement.style.setProperty('--accent-alpha', 'rgba(255, 255, 255, 0.1)');
    localStorage.setItem('vibe-theme-accent', accent);
  }, [accent]);

  // no-op for toggle mode since it's strictly dark
  const toggleMode = useCallback(() => {}, []);
  const setMode = useCallback((_m: ThemeMode) => {}, []);
  const setAccent = useCallback((a: AccentColor) => setAccentState(a), []);

  return (
    <ThemeContext.Provider value={{
      mode,
      accent,
      toggleMode,
      setMode,
      setAccent,
      accentHex: ACCENT_COLORS[accent].hex,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
