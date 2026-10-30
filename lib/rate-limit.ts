import { createHash } from "node:crypto";
import { isIP } from "node:net";
import {
  createMemoryRateLimiter,
  type RateLimiter,
  type RateLimiterOptions,
} from "@/lib/rate-limit-memory";

type Options = RateLimiterOptions & { namespace: string };

export function createRateLimiter(options: Options): RateLimiter {
  if (process.env.NODE_ENV !== "production")
    return createMemoryRateLimiter(options);
  return {
    async check(key) {
      try {
        const { db } = await import("@/lib/db");
        const bucket = createHash("sha256")
          .update(`${options.namespace}:${key}`)
          .digest("hex");
        const results = await db.$queryRaw<
          Array<{ success: boolean; remaining: number; reset_at: bigint }>
        >`
        SELECT * FROM gatree_security.check_rate_limit(${bucket}::text, ${options.max}::integer, ${options.windowMs}::integer)
      `;
        const result = results[0];
        if (!result) throw new Error("Missing rate limit decision");
        return {
          success: result.success,
          remaining: result.remaining,
          resetAt: Number(result.reset_at),
        };
      } catch {
        // Never allow unlimited password attempts or uploads during a backend outage.
        console.error(
          "[rate-limit] Shared storage unavailable; request denied",
        );
        return { success: false, remaining: 0, resetAt: Date.now() + 60_000 };
      }
    },
  };
}

export const clickRateLimiter = createRateLimiter({
  namespace: "click",
  max: 60,
  windowMs: 60_000,
});
export const slugCheckRateLimiter = createRateLimiter({
  namespace: "slug",
  max: 30,
  windowMs: 60_000,
});
export const uploadRateLimiter = createRateLimiter({
  namespace: "upload",
  max: 10,
  windowMs: 60_000,
});
export const pageViewRateLimiter = createRateLimiter({
  namespace: "view",
  max: 120,
  windowMs: 60_000,
});
export const passwordRateLimiter = createRateLimiter({
  namespace: "password",
  max: 5,
  windowMs: 15 * 60_000,
});

export function getClientIp(request: Request): string {
  // Vercel supplies this header; untrusted alternate provider headers are ignored.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return ip && isIP(ip) ? ip : "unknown";
}
