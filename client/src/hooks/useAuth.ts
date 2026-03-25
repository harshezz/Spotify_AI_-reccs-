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
  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const session = await spotifyService.getSession();

      if (session.authenticated && session.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('[Auth] Session check failed:', err);
      setUser(null);
      setError('Failed to verify session');
    } finally {
      setLoading(false);
    }
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
