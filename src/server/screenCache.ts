// In-memory stale-while-revalidate cache for fetched screens, matching
// what the real Cars24 app actually does (verified live: first visit to a
// car detail page shows a skeleton loader; revisiting the same page shows
// content instantly with no loader, refreshed silently in the background).
// Keyed by screenId + params so "listing" with category=budget and
// category=premium are cached independently, same as a real per-query cache.
import type { Screen } from '../schema/types';

const cache = new Map<string, Screen>();

export function cacheKeyFor(screenId: string, params?: Record<string, string>): string {
  return `${screenId}:${JSON.stringify(params ?? {})}`;
}

export function getCachedScreen(key: string): Screen | undefined {
  return cache.get(key);
}

export function setCachedScreen(key: string, screen: Screen): void {
  cache.set(key, screen);
}
