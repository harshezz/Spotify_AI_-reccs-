'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

function IconHome({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12.97 2.59a1.5 1.5 0 00-1.94 0l-7.5 6.363A1.5 1.5 0 003 10.097V19.5A1.5 1.5 0 004.5 21h4.75a.75.75 0 00.75-.75v-4.5a2 2 0 014 0v4.5c0 .414.336.75.75.75h4.75a1.5 1.5 0 001.5-1.5v-9.403a1.5 1.5 0 00-.53-1.144l-7.5-6.363z"/></svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-5a2 2 0 00-4 0v5H5a1 1 0 01-1-1V10.5z"/></svg>
  );
}

function IconBrowse({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth={active ? 0 : 1.7} className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>
  );
}

function IconLibrary({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3 3h4v18H3V3zm7 0h4v18h-4V3zm7 0h4v18h-4V3z"/></svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="w-6 h-6" strokeLinecap="round"><path d="M4 4v16M10 4v16M16 4v16"/></svg>
  );
}

function IconSparkle({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.7} className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/></svg>
  );
}

function IconUser({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth={active ? 0 : 1.7} className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { label: 'Home', path: '/dashboard', Icon: IconHome },
  { label: 'Browse', path: '/browse', Icon: IconBrowse },
  { label: 'Library', path: '/library', Icon: IconLibrary },
  { label: 'AI', path: '/ai', Icon: IconSparkle },
  { label: 'Profile', path: '/profile', Icon: IconUser },
];

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { accentHex } = useTheme();
  const { isAuthenticated } = useAuth();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {NAV_ITEMS.map(item => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all min-w-[60px]"
              style={{
                background: active ? `${accentHex}14` : 'transparent',
                color: active ? accentHex : 'var(--fg-muted)',
              }}
            >
              <item.Icon active={active} />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
