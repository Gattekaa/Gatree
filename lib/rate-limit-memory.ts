export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}
export interface RateLimiterOptions {
  max: number;
  windowMs: number;
}
export interface RateLimiter {
  check(key: string): Promise<RateLimitResult>;
}

export function createMemoryRateLimiter(
  { max, windowMs }: RateLimiterOptions,
  now = Date.now,
): RateLimiter {
  const store = new Map<string, number[]>();
  let checks = 0;
  return {
    async check(key) {
      const timestamp = now();
      const cutoff = timestamp - windowMs;
      if (++checks % 100 === 0)
        for (const [id, hits] of store) {
          const current = hits.filter((hit) => hit > cutoff);
          if (current.length) store.set(id, current);
          else store.delete(id);
        }
      const hits = (store.get(key) || []).filter((hit) => hit > cutoff);
      const success = hits.length < max;
      if (success) hits.push(timestamp);
      store.set(key, hits);
      return {
        success,
        remaining: Math.max(0, max - hits.length),
        resetAt: (hits[0] ?? timestamp) + windowMs,
      };
    },
  };
}
