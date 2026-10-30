import { z } from "zod";

const RESERVED_SLUGS = new Set([
  "api",
  "s",
  "en",
  "pt-br",
  "dashboard",
  "editor",
  "analytics",
  "settings",
  "shortener",
  "login",
  "register",
  "robots",
  "sitemap",
  "icon",
]);

export const treeSlugSchema = z
  .string()
  .min(2, "Mínimo 2 caracteres")
  .max(30, "Máximo 30 caracteres")
  .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens")
  .refine((slug) => !RESERVED_SLUGS.has(slug), "Endereço reservado");

export function isTreeSlugAvailable(
  existing: { id: string; userId: string } | null,
  userId: string,
  excludeId: string | null,
): boolean {
  return !existing || (existing.id === excludeId && existing.userId === userId);
}
