/**
 * Supabase Architecture Layer for TET Assist
 * 
 * Note: Server-side client is intentionally kept separate in './server'
 * so that importing types or client utilities never leaks server-only
 * Next.js headers/cookies modules into client components.
 */

export * from './client';
export * from './types';
