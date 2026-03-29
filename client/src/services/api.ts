// ============================================================
// src/services/api.ts — Base API Configuration
// ============================================================
// Configures an Axios instance with:
//   - Base URL pointing to the Express backend
//   - Credentials mode (sends session cookies with every request)
//   - Request/response interceptors for error handling
//
// All service files should import and use this instance
// instead of creating their own Axios instances.
// ============================================================

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';

// ---------------------------------------------------------------------------
// Base URL: Points to our Express backend, NOT directly to Spotify
// ---------------------------------------------------------------------------
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ---------------------------------------------------------------------------
// Create the Axios Instance
// ---------------------------------------------------------------------------
const api: AxiosInstance = axios.create({
  baseURL:         API_BASE_URL,
  withCredentials: true,          // ← critical! sends the session cookie
  timeout:         15000,         // 15-second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Request Interceptor — runs before every outgoing request
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // In development, log all outgoing API calls
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Response Interceptor — handles common error patterns globally
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    // ── 401 Unauthorized — session expired ────────────────────
    if (status === 401) {
      // Try to refresh the token automatically
      try {
        await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Retry the original request after refresh
        if (error.config) {
          return api.request(error.config);
        }
      } catch {
        // Refresh also failed — redirect to login
        /* COMMENTED OUT FOR DIRECT DASHBOARD ACCESS
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        */
        throw error;
      }
    }

    // ── 429 Rate Limited ──────────────────────────────────────
    if (status === 429) {
      console.warn('[API] Rate limited. Please slow down.');
    }

    return Promise.reject(error);
  }
);

export default api;
