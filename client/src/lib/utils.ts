// ============================================================
// src/lib/utils.ts — Shared Utility Functions
// ============================================================

/**
 * Format milliseconds into mm:ss display format
 * e.g. 234000 → "3:54"
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate progress percentage (0-100)
 */
export function getProgressPercent(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min((current / total) * 100, 100);
}

/**
 * Truncate a string with ellipsis if it exceeds maxLength
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

/**
 * Join artist names with commas
 * e.g. [{name: "Drake"}, {name: "21 Savage"}] → "Drake, 21 Savage"
 */
export function formatArtists(artists: { name: string }[]): string {
  return artists.map((a) => a.name).join(', ');
}

/**
 * Get the best-quality image URL from a Spotify images array
 * Falls back to a placeholder gradient if no images exist
 */
export function getBestImage(
  images: { url: string; width?: number | null }[],
  preferredSize: 'large' | 'medium' | 'small' = 'medium'
): string {
  if (!images || images.length === 0) {
    return '/images/placeholder-album.svg';
  }

  // Spotify returns images largest-first
  switch (preferredSize) {
    case 'large':  return images[0]?.url;
    case 'small':  return images[images.length - 1]?.url;
    case 'medium':
    default:       return images[Math.floor(images.length / 2)]?.url || images[0]?.url;
  }
}

/**
 * Conditionally join CSS class names (basic cn helper)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
