// ============================================================
// src/middleware/rateLimit.ts — Rate Limiting Middleware
// ============================================================
// Prevents API abuse. Different limits for auth vs. data routes.
// ============================================================

import rateLimit from 'express-rate-limit';

// ---------------------------------------------------------------------------
// Auth routes — stricter limit (prevent brute-force)
// ---------------------------------------------------------------------------
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15-minute window
  max: 1000,                  // drastically increased margin for dev/testing
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------------------------------------------------------------------------
// General API routes — more generous limit
// ---------------------------------------------------------------------------
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,    // 1-minute window
  max: 100,                    // max 100 requests per minute
  message: {
    error: 'Rate limit exceeded',
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------------------------------------------------------------------------
// AI generation — expensive operation, tight limit
// ---------------------------------------------------------------------------
export const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,    // 5-minute window
  max: 10,                     // max 10 AI generations per 5 minutes
  message: {
    error: 'AI generation rate limit reached',
    message: 'Please wait before generating another AI playlist.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
