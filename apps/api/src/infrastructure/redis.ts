import { Redis } from 'ioredis';
import type { AppConfig } from '../shared/config.js';

/** Optional Redis. Returns null in dev when REDIS_URL is unset (rate-limit falls back to memory). */
export function createRedis(config: AppConfig): Redis | null {
  if (!config.REDIS_URL) return null;
  return new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });
}
