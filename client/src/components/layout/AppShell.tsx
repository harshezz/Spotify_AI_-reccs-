'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import { useSidebar } from '@/context/SidebarContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { width } = useSidebar();
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <Sidebar />
      <MobileNav />
      <main
        className="min-h-screen pb-24 lg:pb-0"
        style={{
          marginLeft: isDesktop ? width : 0,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {children}
      </main>
    </div>
  );
}
