'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTheme, ACCENT_COLORS, AccentColor } from '@/context/ThemeContext';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/hooks/useAuth';

function IconHome({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12.97 2.59a1.5 1.5 0 00-1.94 0l-7.5 6.363A1.5 1.5 0 003 10.097V19.5A1.5 1.5 0 004.5 21h4.75a.75.75 0 00.75-.75v-4.5a2 2 0 014 0v4.5c0 .414.336.75.75.75h4.75a1.5 1.5 0 001.5-1.5v-9.403a1.5 1.5 0 00-.53-1.144l-7.5-6.363z"/></svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-5a2 2 0 00-4 0v5H5a1 1 0 01-1-1V10.5z"/></svg>
  );
}

function IconBrowse({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={active ? 'currentColor' : 'currentColor'} strokeWidth={active ? 0 : 1.7} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>
  );
}

function IconLibrary({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3 3h4v18H3V3zm7 0h4v18h-4V3zm7 0h4v18h-4V3z"/></svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="w-5 h-5" strokeLinecap="round"><path d="M4 4v16M10 4v16M16 4v16"/></svg>
  );
}

function IconSparkle({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.7} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/></svg>
  );
}

function IconUser({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={active ? 'currentColor' : 'currentColor'} strokeWidth={active ? 0 : 1.7} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function IconSun() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>;
}

function IconMoon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>;
}

function IconMusic() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
}

const NAV = [
  { label: 'Home',      path: '/dashboard', Icon: IconHome },
  { label: 'Browse',    path: '/browse',   Icon: IconBrowse },
  { label: 'Library',   path: '/library',  Icon: IconLibrary },
  { label: 'AI Create', path: '/ai',       Icon: IconSparkle },
];

const SECONDARY_NAV = [
  { label: 'Profile', path: '/profile', Icon: IconUser },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { mode, toggleMode, accent, setAccent, accentHex } = useTheme();
  const { collapsed, toggle, width } = useSidebar();
  const { user, isAuthenticated } = useAuth();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-50 flex flex-col select-none hidden lg:flex border-r border-white/5"
      style={{
        width,
        background: 'rgba(5, 5, 10, 0.4)',
        backdropFilter: 'blur(30px) saturate(150%)',
        WebkitBackdropFilter: 'blur(30px) saturate(150%)',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}
    >
      <div className="flex items-center h-[56px] px-4 shrink-0" style={{ justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && (
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accentHex}, ${accentHex}99)` }}
            >
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <span className="font-bold text-[15px] tracking-tight text-white">Vibe</span>
          </button>
        )}
        <button 
          onClick={toggle} 
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 hover:bg-[var(--bg-hover)] transition-colors" 
          style={{ color: 'var(--fg-muted)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round">
            {collapsed
              ? <path d="M9 5l7 7-7 7"/>
              : <path d="M15 19l-7-7 7-7"/>
            }
          </svg>
        </button>
      </div>

      {!collapsed && (
        <p className="px-5 mt-4 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--fg-muted)' }}>
          Discover
        </p>
      )}

      <nav className="px-3 space-y-1">
        {NAV.map(item => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="w-full flex items-center rounded-xl relative overflow-hidden transition-all duration-200"
              style={{
                padding: collapsed ? '10px 0' : '9px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? 0 : 12,
                background: active ? `${accentHex}14` : 'transparent',
                color: active ? accentHex : 'var(--fg-muted)',
              }}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                  style={{ height: 20, background: accentHex }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <item.Icon active={active} />
              {!collapsed && (
                <span className="text-[13px] font-medium whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mt-6 px-3 flex-1 overflow-y-auto min-h-0">
          {isAuthenticated && (
            <>
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--fg-muted)' }}>
                Account
              </p>
              <div className="space-y-0.5">
                {SECONDARY_NAV.map(item => {
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => router.push(item.path)}
                      className="w-full flex items-center rounded-lg transition-colors"
                      style={{
                        padding: '9px 12px',
                        gap: 12,
                        background: active ? `${accentHex}14` : 'transparent',
                        color: active ? accentHex : 'var(--fg-muted)',
                      }}
                    >
                      <item.Icon active={active} />
                      <span className="text-[13px] font-medium whitespace-nowrap">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
          
          <div className="mt-6">
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--fg-muted)' }}>
              Quick Links
            </p>
            <div className="space-y-0.5">
              <button 
                onClick={() => router.push('/privacy')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] truncate transition-colors hover:bg-[var(--bg-hover)]" 
                style={{ color: 'var(--fg-secondary)' }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Privacy Policy
              </button>
              <button 
                onClick={() => router.push('/terms')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] truncate transition-colors hover:bg-[var(--bg-hover)]" 
                style={{ color: 'var(--fg-secondary)' }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
                </svg>
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto px-3 pb-4 pt-3 space-y-2 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        {!collapsed && (
          <div className="flex items-center justify-center gap-2.5 py-2">
            {(Object.keys(ACCENT_COLORS) as AccentColor[]).map(key => (
              <button
                key={key}
                onClick={() => setAccent(key)}
                className="transition-all duration-200"
                title={ACCENT_COLORS[key].name}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: accent === key ? 18 : 14,
                    height: accent === key ? 18 : 14,
                    background: ACCENT_COLORS[key].hex,
                    opacity: accent === key ? 1 : 0.45,
                    boxShadow: accent === key ? `0 0 10px ${ACCENT_COLORS[key].hex}50` : 'none',
                    border: accent === key ? '2px solid rgba(255,255,255,0.6)' : '2px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                />
              </button>
            ))}
          </div>
        )}

        <button
          onClick={toggleMode}
          className="w-full flex items-center rounded-xl transition-colors hover:bg-[var(--bg-hover)]"
          style={{
            padding: collapsed ? '10px 0' : '9px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : 12,
            color: 'var(--fg-muted)',
          }}
          title={mode === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          {mode === 'dark' ? <IconSun /> : <IconMoon />}
          {!collapsed && <span className="text-[13px] font-medium">{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {isAuthenticated && (
          <button
            onClick={() => router.push('/profile')}
            className="w-full flex items-center rounded-xl transition-colors hover:bg-[var(--bg-hover)]"
            style={{
              padding: collapsed ? '10px 0' : '8px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: collapsed ? 0 : 10,
              color: 'var(--fg-secondary)',
            }}
          >
            {user?.imageUrl ? (
              <Image 
                src={user.imageUrl} 
                alt="Profile" 
                width={32} 
                height={32} 
                className="rounded-full object-cover"
              />
            ) : (
              <div
                className="rounded-full flex items-center justify-center font-bold shrink-0"
                style={{
                  width: collapsed ? 28 : 32,
                  height: collapsed ? 28 : 32,
                  fontSize: collapsed ? 11 : 13,
                  background: `linear-gradient(135deg, ${accentHex}30, ${accentHex}10)`,
                  color: accentHex,
                  transition: 'all 0.25s ease',
                }}
              >
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            )}
            {!collapsed && (
              <div className="text-left min-w-0">
                <p className="text-[13px] font-semibold truncate leading-tight text-white">{user?.displayName || 'User'}</p>
                <p className="text-[10px] truncate leading-tight" style={{ color: 'var(--fg-muted)' }}>
                  {user?.product === 'premium' ? 'Premium' : 'Free'} Account
                </p>
              </div>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
