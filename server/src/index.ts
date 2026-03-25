// ============================================================
// src/index.ts — Express Server Entry Point
// ============================================================
// Bootstraps the Express server with:
//   - CORS (credentials mode for session cookies)
//   - Session management (server-side, HTTP-only cookies)
//   - Request logging (Morgan)
//   - All route mounts
// ============================================================

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { config } from './config/env';
import { logger } from './utils/logger';

// Route imports
import authRoutes    from './routes/auth';
import spotifyRoutes from './routes/spotify';
import aiRoutes      from './routes/ai';

// ── Initialize Express App ────────────────────────────────────
const app = express();


// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE STACK
// ═══════════════════════════════════════════════════════════════

// 1. CORS — Allow the Next.js frontend to make credentialed requests
app.use(cors({
  origin:      config.frontendUrl,   // e.g., http://localhost:3000
  credentials: true,                 // required for cookies/sessions
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 2. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Request Logging (dev-friendly colored output)
app.use(morgan('dev'));

// 4. Session Management — stores tokens securely server-side
app.use(session({
  secret:            config.sessionSecret,
  resave:            false,
  saveUninitialized: false,
  name:              'vibe.sid',          // custom cookie name
  cookie: {
    httpOnly: true,                        // JavaScript can't access this cookie
    secure:   process.env.NODE_ENV === 'production',  // HTTPS only in prod
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge:   24 * 60 * 60 * 1000,         // 24 hours
  },
}));


// ═══════════════════════════════════════════════════════════════
// ROUTE MOUNTS
// ═══════════════════════════════════════════════════════════════

app.use('/api/auth',    authRoutes);       // OAuth login/callback/refresh/logout
app.use('/api/spotify', spotifyRoutes);    // Spotify API proxy
app.use('/api/ai',      aiRoutes);         // AI playlist generation


// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:    'ok',
    service:   'vibe-music-server',
    timestamp: new Date().toISOString(),
    uptime:    process.uptime(),
  });
});


// ── 404 Handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    error:   'Not Found',
    message: 'The requested endpoint does not exist',
  });
});


// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════

app.listen(config.port, () => {
  logger.success(`🎵 Vibe Music Server running on port ${config.port}`);
  logger.info(`Frontend URL: ${config.frontendUrl}`);
  logger.info(`Spotify Redirect URI: ${config.spotify.redirectUri}`);
  logger.info(`Health check: http://localhost:${config.port}/api/health`);
});

export default app;
