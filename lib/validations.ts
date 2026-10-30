import { z } from "zod";

export const createTreeSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(100, "Máximo 100 caracteres"),
  slug: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(30, "Máximo 30 caracteres")
    .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens"),
});

export type CreateTreeInput = z.infer<typeof createTreeSchema>;

export const createLinkSchema = z.object({
  label: z.string().min(1, "Label é obrigatório").max(100, "Máximo 100 caracteres"),
  url: z.string().min(1, "URL é obrigatória").url("URL inválida"),
  icon: z.string().nullable().optional(),
  type: z.enum(["LINK", "YOUTUBE", "HEADER"]).default("LINK"),
});

export const createHeaderSchema = z.object({
  label: z.string().min(1, "Título é obrigatório").max(100, "Máximo 100 caracteres"),
  url: z.literal("#").default("#"),
  icon: z.string().nullable().optional(),
  type: z.literal("HEADER").default("HEADER"),
});

export const linkFormSchema = z.object({
  type: z.enum(["LINK", "YOUTUBE", "SPOTIFY", "SOUNDCLOUD", "HEADER", "TEXT", "IMAGE", "MAP", "EMAIL", "PHONE", "WHATSAPP"]),
  label: z.string().max(100, "Máximo 100 caracteres"),
  url: z.string(),
  icon: z.string().nullable().optional(),
  thumbnail: z.string().optional(),
  scheduledStart: z.string().optional(),
  scheduledEnd: z.string().optional(),
}).superRefine((data, ctx) => {

  if (["LINK", "EMAIL", "PHONE", "WHATSAPP", "HEADER", "TEXT"].includes(data.type) && !data.label) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Obrigatório",
      path: ["label"],
    });
  }

  if (!["HEADER", "TEXT"].includes(data.type) && !data.url) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "URL é obrigatória",
      path: ["url"],
    });
  }

  if (data.scheduledStart && data.scheduledEnd) {
    const start = new Date(data.scheduledStart);
    const end = new Date(data.scheduledEnd);
    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Data de fim deve ser posterior à data de início",
        path: ["scheduledEnd"],
      });
    }
  }
});

export type LinkFormInput = z.infer<typeof linkFormSchema>;

const SAFE_URL_PROTOCOLS = ["http:", "https:"];

function ensureProtocol(url: string): string {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

const safeHttpUrl = z.string().transform(ensureProtocol).pipe(
  z.string().url("URL inválida").refine((url) => {
    try {
      return SAFE_URL_PROTOCOLS.includes(new URL(url).protocol);
    } catch {
      return false;
    }
  }, "Protocolo não permitido. Use http:// ou https://")
);

const emailValue = z.string().email("Email inválido");

const phoneValue = z.string().regex(/^[\d\s+()-]+$/, "Número inválido");

const youtubeUrl = safeHttpUrl.pipe(
  z.string().refine((url) => {
    const host = new URL(url).hostname;
    return host.includes("youtube.com") || host.includes("youtu.be");
  }, "URL deve ser do YouTube")
);

const spotifyUrl = safeHttpUrl.pipe(
  z.string().refine((url) => new URL(url).hostname.includes("spotify.com"), "URL deve ser do Spotify")
);

const soundcloudUrl = safeHttpUrl.pipe(
  z.string().refine((url) => new URL(url).hostname.includes("soundcloud.com"), "URL deve ser do SoundCloud")
);

const mapUrl = z.string().min(1, "Localização é obrigatória");

export const serverLinkSchema = z.object({
  label: z.string().max(100, "Máximo 100 caracteres"),
  url: z.string(),
  icon: z.string().nullable().optional(),
  type: z.enum(["LINK", "YOUTUBE", "SPOTIFY", "SOUNDCLOUD", "HEADER", "TEXT", "IMAGE", "MAP", "EMAIL", "PHONE", "WHATSAPP"]),
}).superRefine((data, ctx) => {

  if (data.type === "HEADER" || data.type === "TEXT") return;

  if (!data.url || data.url.trim().length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "URL é obrigatória", path: ["url"] });
    return;
  }

  const url = data.url.trim();
  let parseResult: { success: boolean; error?: { issues: { message: string }[] } };

  switch (data.type) {
    case "EMAIL":
      parseResult = emailValue.safeParse(url);
      break;
    case "PHONE":
    case "WHATSAPP":
      parseResult = phoneValue.safeParse(url);
      break;
    case "YOUTUBE":
      parseResult = youtubeUrl.safeParse(url);
      break;
    case "SPOTIFY":
      parseResult = spotifyUrl.safeParse(url);
      break;
    case "SOUNDCLOUD":
      parseResult = soundcloudUrl.safeParse(url);
      break;
    case "MAP":
      parseResult = mapUrl.safeParse(url);
      break;
    case "LINK":
    case "IMAGE":
    default:
      parseResult = safeHttpUrl.safeParse(url);
      break;
  }

  if (!parseResult.success) {
    const message = parseResult.error?.issues[0]?.message || "URL inválida";
    ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: ["url"] });
  }
});

export type ServerLinkInput = z.infer<typeof serverLinkSchema>;

export const seoSchema = z.object({
  seoTitle: z.string().max(60, "Máximo 60 caracteres"),
  seoDescription: z.string().max(160, "Máximo 160 caracteres"),
});

export type SeoInput = z.infer<typeof seoSchema>;

const PLATFORM_DOMAINS = ["gatree.app", "www.gatree.app"];

export const createShortLinkSchema = z.object({
  url: z
    .string()
    .min(1, "URL é obrigatória")
    .max(2048, "URL deve ter no máximo 2048 caracteres")
    .url("URL inválida")
    .refine((url) => {
      try {
        const { protocol, hostname } = new URL(url);
        if (!["http:", "https:"].includes(protocol)) return false;
        if (PLATFORM_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`))) return false;
        return true;
      } catch {
        return false;
      }
    }, "URL inválida ou não permitida"),
  customSlug: z
    .string()
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, "Apenas letras minúsculas, números e hífens (não inicia/termina com hífen)")
    .min(3, "Mínimo 3 caracteres")
    .max(50, "Máximo 50 caracteres")
    .optional(),
  title: z.string().max(100, "Máximo 100 caracteres").optional(),
  description: z.string().max(300, "Máximo 300 caracteres").optional(),
  password: z.string().min(4, "Mínimo 4 caracteres").max(128, "Máximo 128 caracteres").optional(),
  expiresAt: z.string().datetime().optional(),
});

export type CreateShortLinkInput = z.infer<typeof createShortLinkSchema>;

export const updateShortLinkSchema = z.object({
  url: z
    .string()
    .min(1, "URL é obrigatória")
    .max(2048, "URL deve ter no máximo 2048 caracteres")
    .url("URL inválida")
    .refine((url) => {
      try {
        const { protocol, hostname } = new URL(url);
        if (!["http:", "https:"].includes(protocol)) return false;
        if (PLATFORM_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`))) return false;
        return true;
      } catch {
        return false;
      }
    }, "URL inválida ou não permitida")
    .optional(),
  title: z.string().max(100, "Máximo 100 caracteres").optional(),
  description: z.string().max(300, "Máximo 300 caracteres").optional(),
  password: z.string().min(4, "Mínimo 4 caracteres").max(128, "Máximo 128 caracteres").nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export type UpdateShortLinkInput = z.infer<typeof updateShortLinkSchema>;

export const shortLinkPasswordSchema = z.object({
  password: z.string().min(1, "Senha é obrigatória"),
});

export type ShortLinkPasswordInput = z.infer<typeof shortLinkPasswordSchema>;
