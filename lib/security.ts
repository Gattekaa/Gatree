import type { LinkType } from "@prisma/client";

import { matchesHostname } from "@/lib/security-policy";

const ALLOWED_PROTOCOLS = ["http:", "https:"];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s+()-]+$/;

export function validateLinkUrl(
  url: string,
  type: LinkType
): { valid: true; sanitized: string } | { valid: false; error: string } {

  if (type === "HEADER" || type === "TEXT") {
    return { valid: true, sanitized: url || "" };
  }

  if (!url || url.trim().length === 0) {
    return { valid: false, error: "URL é obrigatória" };
  }

  const trimmed = url.trim();

  switch (type) {
    case "EMAIL":
      if (!EMAIL_REGEX.test(trimmed)) {
        return { valid: false, error: "Email inválido" };
      }
      return { valid: true, sanitized: trimmed };

    case "PHONE":
    case "WHATSAPP":
      if (!PHONE_REGEX.test(trimmed)) {
        return { valid: false, error: "Número inválido. Use apenas dígitos, +, e espaços." };
      }
      return { valid: true, sanitized: trimmed };

    case "YOUTUBE": {
      const ytUrl = ensureProtocol(trimmed);
      if (!isValidHttpUrl(ytUrl)) {
        return { valid: false, error: "URL inválida" };
      }
      try {
        const parsed = new URL(ytUrl);
        if (!matchesHostname(parsed.hostname, ["youtube.com", "youtu.be"])) {
          return { valid: false, error: "URL deve ser do YouTube" };
        }
      } catch {
        return { valid: false, error: "URL inválida" };
      }
      return { valid: true, sanitized: ytUrl };
    }

    case "SPOTIFY": {
      const spUrl = ensureProtocol(trimmed);
      if (!isValidHttpUrl(spUrl)) {
        return { valid: false, error: "URL inválida" };
      }
      try {
        const parsed = new URL(spUrl);
        if (!matchesHostname(parsed.hostname, ["open.spotify.com"])) {
          return { valid: false, error: "URL deve ser do Spotify" };
        }
      } catch {
        return { valid: false, error: "URL inválida" };
      }
      return { valid: true, sanitized: spUrl };
    }

    case "SOUNDCLOUD": {
      const scUrl = ensureProtocol(trimmed);
      if (!isValidHttpUrl(scUrl)) {
        return { valid: false, error: "URL inválida" };
      }
      try {
        const parsed = new URL(scUrl);
        if (!matchesHostname(parsed.hostname, ["soundcloud.com"])) {
          return { valid: false, error: "URL deve ser do SoundCloud" };
        }
      } catch {
        return { valid: false, error: "URL inválida" };
      }
      return { valid: true, sanitized: scUrl };
    }

    case "MAP": {
      const mapUrl = ensureProtocol(trimmed);
      if (!isValidHttpUrl(mapUrl)) {
        return { valid: false, error: "URL inválida" };
      }
      try {
        const parsed = new URL(mapUrl);
        if (!matchesHostname(parsed.hostname, ["google.com", "google.com.br", "maps.app.goo.gl"])) {
          return { valid: false, error: "URL deve ser do Google Maps" };
        }
      } catch {
        return { valid: false, error: "URL inválida" };
      }
      return { valid: true, sanitized: mapUrl };
    }

    case "IMAGE":
    case "LINK":
    default: {
      const finalUrl = ensureProtocol(trimmed);
      if (!isValidHttpUrl(finalUrl)) {
        return { valid: false, error: "URL inválida. Use http:// ou https://" };
      }
      return { valid: true, sanitized: finalUrl };
    }
  }
}

export function isAllowedRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol) && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

export function sanitizeEmbedUrl(url: string, type: "youtube" | "spotify" | "soundcloud" | "map" | "image"): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol) || parsed.username || parsed.password) return null;

    switch (type) {
      case "youtube": {

        if (matchesHostname(parsed.hostname, ["youtube.com", "youtu.be"])) {
          return url;
        }
        return null;
      }
      case "spotify": {
        if (parsed.hostname === "open.spotify.com") return url;
        return null;
      }
      case "soundcloud": {
        if (matchesHostname(parsed.hostname, ["soundcloud.com"])) return url;
        return null;
      }
      case "map": {
        if (matchesHostname(parsed.hostname, ["google.com", "google.com.br", "maps.app.goo.gl"])) return url;
        return null;
      }
      case "image": {
        if (ALLOWED_PROTOCOLS.includes(parsed.protocol)) return url;
        return null;
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

const CSV_DANGEROUS_CHARS = ["=", "+", "-", "@", "\t", "\r", "\n"];

export function sanitizeCsvValue(value: string): string {
  if (!value) return value;
  if (CSV_DANGEROUS_CHARS.some((char) => value.startsWith(char))) {
    return `'${value}`;
  }
  return value;
}

const IMAGE_MAGIC_BYTES: { type: string; bytes: number[] }[] = [
  { type: "jpeg", bytes: [0xff, 0xd8, 0xff] },
  { type: "png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { type: "gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { type: "webp", bytes: [0x52, 0x49, 0x46, 0x46] },
];

export function validateImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;

  for (const { bytes } of IMAGE_MAGIC_BYTES) {
    const matches = bytes.every((byte, index) => buffer[index] === byte);
    if (matches) {

      if (bytes === IMAGE_MAGIC_BYTES[3].bytes) {
        if (buffer.length < 12) return false;
        const webpSignature = buffer.slice(8, 12).toString("ascii");
        return webpSignature === "WEBP";
      }
      return true;
    }
  }

  return false;
}

function ensureProtocol(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol) && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}
