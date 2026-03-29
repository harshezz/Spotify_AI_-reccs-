// ============================================================
// src/hooks/useAuth.ts — Authentication State Hook
// ============================================================
// Provides a simple interface to check auth status and user data.
// Calls /api/auth/session on mount to restore session state.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { spotifyService } from '@/services/spotifyService';

interface AuthUser {
  id:          string;
  displayName: string;
  email:       string;
  imageUrl:    string | null;
  product:     string;
}

interface UseAuthReturn {
  user:           AuthUser | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  error:           string | null;
  login:           () => void;
  logout:          () => Promise<void>;
  refreshSession:  () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // ── Check current session on mount ──────────────────────────
  // ── MOCK session check for development ───────────────────────
  const MOCK_USER: AuthUser = {
    id: 'mock-user-id',
    displayName: 'Protocol.Guest',
    email: 'guest@vibe.ai',
    imageUrl: null,
    product: 'premium'
  };

  const checkSession = useCallback(async () => {
    setLoading(true);
    // Directly set user to mock to bypass login
    setUser(MOCK_USER);
    setLoading(false);
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // ── Login: Redirect to Spotify auth via backend ─────────────
  const login = useCallback(() => {
    spotifyService.login();
  }, []);

  // ── Logout: Destroy session on backend ──────────────────────
  const logout = useCallback(async () => {
    try {
      await spotifyService.logout();
      setUser(null);
    } catch (err) {
      console.error('[Auth] Logout failed:', err);
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    refreshSession: checkSession,
  };
}
