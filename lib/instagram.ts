import { z } from "zod";
import { normalizeSocialUrl } from "@/lib/social-platforms";

export const MAX_INSTAGRAM_POSTS = 6;

export function normalizeInstagramPostUrl(value: string): string | null {
  const normalized = normalizeSocialUrl("instagram", value);
  if (!normalized) return null;
  const match = new URL(normalized).pathname.match(
    /^\/(?:[A-Za-z0-9._]{1,30}\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]{1,80})\/?$/,
  );
  if (!match) return null;
  const kind = match[1] === "reels" ? "reel" : match[1];
  return `https://www.instagram.com/${kind}/${match[2]}/`;
}

export function instagramEmbedUrl(post: string): string | null {
  const normalized = normalizeInstagramPostUrl(post);
  return normalized ? `${normalized}embed/` : null;
}

export const instagramDisplaySchema = z
  .object({
    mode: z.literal("posts"),
    posts: z
      .array(
        z
          .string()
          .max(500)
          .transform((value, ctx) => {
            const normalized = normalizeInstagramPostUrl(value);
            if (!normalized) {
              ctx.addIssue({
                code: "custom",
                message: "Use o link de uma publicação ou Reel do Instagram",
              });
              return z.NEVER;
            }
            return normalized;
          }),
      )
      .min(1)
      .max(MAX_INSTAGRAM_POSTS),
  })
  .strict()
  .refine(
    (value) => new Set(value.posts).size === value.posts.length,
    "Publicações repetidas",
  );

export type InstagramDisplayConfig = z.infer<typeof instagramDisplaySchema>;

export function getInstagramDisplay(
  value: unknown,
): InstagramDisplayConfig | null {
  const result = instagramDisplaySchema.safeParse(value);
  return result.success ? result.data : null;
}

export function readInstagramEmbedHeight(value: unknown): number | null {
  try {
    const message = typeof value === "string" ? JSON.parse(value) : value;
    if (
      !message ||
      message.type !== "MEASURE" ||
      typeof message.details?.height !== "number" ||
      !Number.isFinite(message.details.height)
    )
      return null;
    return Math.max(320, Math.min(1600, Math.ceil(message.details.height)));
  } catch {
    return null;
  }
}
