'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import { useSidebar } from '@/context/SidebarContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { width } = useSidebar();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <Sidebar />
      <MobileNav />
      <main
        className="min-h-screen pb-20 lg:pb-0"
        style={{
          marginLeft: width,
          transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {children}
      </main>
    </div>
  );
}
