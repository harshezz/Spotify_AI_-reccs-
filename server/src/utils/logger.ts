// ============================================================
// src/utils/logger.ts — Simple Structured Logger
// ============================================================
// Provides color-coded console logging with timestamps.
// In production, you'd swap this for Winston or Pino.
// ============================================================

const COLORS = {
  reset:   '\x1b[0m',
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
} as const;

function timestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`${COLORS.cyan}[INFO]${COLORS.reset} ${timestamp()} — ${message}`, ...args);
  },
  success: (message: string, ...args: unknown[]) => {
    console.log(`${COLORS.green}[OK]${COLORS.reset}   ${timestamp()} — ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`${COLORS.yellow}[WARN]${COLORS.reset} ${timestamp()} — ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`${COLORS.red}[ERR]${COLORS.reset}  ${timestamp()} — ${message}`, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${COLORS.magenta}[DBG]${COLORS.reset}  ${timestamp()} — ${message}`, ...args);
    }
  },
};
