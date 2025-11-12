import db from '@/lib/db';
import { apiCache } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

/**
 * Cache helper utilities for API responses
 */

export interface CacheOptions {
  ttlHours?: number; // Time to live in hours (default: 1)
  forceRefresh?: boolean; // Force refresh even if cache exists
}

/**
 * Get cached data by key
 * Returns null if cache doesn't exist or is expired
 */
export async function getCachedData<T>(cacheKey: string): Promise<T | null> {
  try {
    const result = await db
      .select()
      .from(apiCache)
      .where(eq(apiCache.cacheKey, cacheKey))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const cached = result[0];

    // Check if cache is expired
    const now = new Date();
    if (cached.expiresAt < now) {
      // Cache expired, delete it
      await db.delete(apiCache).where(eq(apiCache.cacheKey, cacheKey));
      return null;
    }

    return cached.data as T;
  } catch (error) {
    console.error(`Error getting cache for key ${cacheKey}:`, error);
    return null;
  }
}

/**
 * Set cached data with TTL
 */
export async function setCachedData<T>(
  cacheKey: string,
  data: T,
  ttlHours: number = 1
): Promise<void> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);

    await db
      .insert(apiCache)
      .values({
        cacheKey,
        data: data as any,
        updatedAt: now,
        expiresAt,
        createdAt: now,
      })
      .onConflictDoUpdate({
        target: apiCache.cacheKey,
        set: {
          data: data as any,
          updatedAt: now,
          expiresAt,
        },
      });
  } catch (error) {
    console.error(`Error setting cache for key ${cacheKey}:`, error);
    // Don't throw - caching failures shouldn't break the API
  }
}

/**
 * Invalidate cache by key pattern (supports wildcards)
 */
export async function invalidateCache(pattern: string): Promise<number> {
  try {
    // Simple pattern matching - supports % wildcard
    if (pattern.includes('%')) {
      const result = await db.execute(sql`
        DELETE FROM api_cache
        WHERE cache_key LIKE ${pattern}
      `);
      return Array.isArray(result) ? result.length : (result.rowCount ?? 0);
    } else {
      // Exact match
      const result = await db
        .delete(apiCache)
        .where(eq(apiCache.cacheKey, pattern));
      return 1;
    }
  } catch (error) {
    console.error(`Error invalidating cache for pattern ${pattern}:`, error);
    return 0;
  }
}

/**
 * Clean up expired cache entries
 */
export async function cleanupExpiredCache(): Promise<number> {
  try {
    const result = await db.execute(sql`
      DELETE FROM api_cache
      WHERE expires_at < NOW()
    `);
    return Array.isArray(result) ? result.length : (result.rowCount ?? 0);
  } catch (error) {
    console.error('Error cleaning up expired cache:', error);
    return 0;
  }
}

/**
 * Cache TTL constants (in hours)
 */
export const CACHE_TTL = {
  GITHUB_METRICS: 1, // 1 hour - data changes frequently
  DEVELOPERS: 6, // 6 hours
  ACTIVE_DEVELOPERS_YOY: 12, // 12 hours - expensive query
  DEVELOPER_METRICS: 6, // 6 hours
  DEVELOPER_DEMOGRAPHICS: 12, // 12 hours - expensive query
} as const;

/**
 * Generate cache key for API endpoints
 */
export function generateCacheKey(endpoint: string, params?: Record<string, string | number>): string {
  const parts = [endpoint];
  if (params) {
    const sortedParams = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
    if (sortedParams) {
      parts.push(sortedParams);
    }
  }
  return parts.join(':');
}

