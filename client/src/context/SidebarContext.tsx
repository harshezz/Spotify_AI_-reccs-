'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  width: number;
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggle: () => {},
  width: 240,
});

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 64;

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const toggle = useCallback(() => setCollapsed(c => !c), []);
  const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, width }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
