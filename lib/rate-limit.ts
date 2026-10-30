

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

interface RateLimiterOptions {

  max: number;

  windowMs: number;
}

interface RateLimiter {
  check(key: string): Promise<RateLimitResult>;
}

interface MemoryEntry {
  timestamps: number[];
}

const memoryStore = new Map<string, MemoryEntry>();

if (typeof globalThis !== "undefined") {
  const globalWithCleanup = globalThis as unknown as { __rateLimitCleanup?: NodeJS.Timeout };
  if (!globalWithCleanup.__rateLimitCleanup) {
    globalWithCleanup.__rateLimitCleanup = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of memoryStore.entries()) {

        entry.timestamps = entry.timestamps.filter((t) => now - t < 300_000);
        if (entry.timestamps.length === 0) {
          memoryStore.delete(key);
        }
      }
    }, 60_000);

    if (globalWithCleanup.__rateLimitCleanup.unref) {
      globalWithCleanup.__rateLimitCleanup.unref();
    }
  }
}

function createMemoryRateLimiter(options: RateLimiterOptions): RateLimiter {
  const { max, windowMs } = options;

  return {
    async check(key: string): Promise<RateLimitResult> {
      const now = Date.now();
      const windowStart = now - windowMs;

      let entry = memoryStore.get(key);
      if (!entry) {
        entry = { timestamps: [] };
        memoryStore.set(key, entry);
      }

      entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

      if (entry.timestamps.length >= max) {
        const oldestInWindow = entry.timestamps[0];
        return {
          success: false,
          remaining: 0,
          resetAt: oldestInWindow + windowMs,
        };
      }

      entry.timestamps.push(now);

      return {
        success: true,
        remaining: max - entry.timestamps.length,
        resetAt: now + windowMs,
      };
    },
  };
}

function createUpstashRateLimiter(options: RateLimiterOptions): RateLimiter {

  let limiterInstance: unknown = null;

  return {
    async check(key: string): Promise<RateLimitResult> {
      try {
        if (!limiterInstance) {
          const { Ratelimit } = await import("@upstash/ratelimit");
          const { Redis } = await import("@upstash/redis");

          limiterInstance = new Ratelimit({
            redis: Redis.fromEnv(),
            limiter: Ratelimit.slidingWindow(
              options.max,
              `${Math.round(options.windowMs / 1000)}s`
            ),
            analytics: true,
          });
        }

        const result = await (limiterInstance as { limit: (key: string) => Promise<{ success: boolean; remaining: number; reset: number }> }).limit(key);

        return {
          success: result.success,
          remaining: result.remaining,
          resetAt: result.reset,
        };
      } catch (error) {

        console.error("[rate-limit] Upstash error, failing open:", error);
        return { success: true, remaining: options.max, resetAt: Date.now() + options.windowMs };
      }
    },
  };
}

const useUpstash =
  process.env.NODE_ENV === "production" &&
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
  if (useUpstash) {
    return createUpstashRateLimiter(options);
  }
  return createMemoryRateLimiter(options);
}

export const clickRateLimiter = createRateLimiter({ max: 60, windowMs: 60_000 });

export const slugCheckRateLimiter = createRateLimiter({ max: 30, windowMs: 60_000 });

export const uploadRateLimiter = createRateLimiter({ max: 10, windowMs: 60_000 });

export const pageViewRateLimiter = createRateLimiter({ max: 120, windowMs: 60_000 });

export const passwordRateLimiter = createRateLimiter({ max: 5, windowMs: 15 * 60_000 });

export function getClientIp(request: Request): string {
  const headers = new Headers(request.headers);
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}
