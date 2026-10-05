/**
 * Utility functions for TET Assist
 */

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return '--';
  return `${score}/150`;
}

export function formatPercentage(pct: number | null | undefined): string {
  if (pct === null || pct === undefined) return '0%';
  return `${Math.round(pct)}%`;
}

export function formatDaysRemaining(days: number | null | undefined): string {
  if (days === null || days === undefined) return '--';
  return `${days} Days`;
}
