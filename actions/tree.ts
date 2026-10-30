"use server";

import { normalizeSocialUrl } from "@/lib/social-platforms";
import { isAuthError, requireUser } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import type { BackgroundConfig, LinkStyleConfig } from "@/types";
import { revalidatePath } from "next/cache";

export async function createTree(data: { title: string; slug: string }) {
  const userResult = await requireUser();
  if (isAuthError(userResult)) return userResult;
  const userId = userResult;

  const { createTreeSchema } = await import("@/lib/validations");
  const parsed = createTreeSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "errors.invalidData" };
  }

  const existing = await db.tree.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { error: "errors.slugUnavailable" };

  const tree = await db.tree.create({
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      userId: userId,
    },
  });

  revalidatePath("/dashboard");
  return tree;
}

export async function updateTree(
  treeId: string,
  data: {
    title?: string;
    description?: string | null;
    slug?: string;
    status?: "ACTIVE" | "INACTIVE";
  }
) {
  const userResult = await requireUser();
  if (isAuthError(userResult)) return userResult;
  const userId = userResult;

  const tree = await db.tree.findUnique({ where: { id: treeId } });
  if (!tree || tree.userId !== userId) return { error: "errors.notAuthorized" };

  if (data.slug && data.slug !== tree.slug) {
    const existing = await db.tree.findUnique({ where: { slug: data.slug } });
    if (existing) return { error: "errors.slugUnavailable" };
  }

  const updated = await db.tree.update({
    where: { id: treeId },
    data,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/editor/${updated.slug}`);
  return updated;
}

export async function updateTreeAppearance(
  treeId: string,
  data: {
    avatar?: string | null;
    background?: BackgroundConfig | null;
    linkStyle?: LinkStyleConfig | null;
    theme?: string | null;
    fontFamily?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    socialIcons?: Array<{ platform: string; url: string }> | null;
  }
) {
  const userResult = await requireUser();
  if (isAuthError(userResult)) return userResult;
  const userId = userResult;

  const tree = await db.tree.findUnique({ where: { id: treeId } });
  if (!tree || tree.userId !== userId) return { error: "errors.notAuthorized" };

  
  const { z } = await import("zod");

  const socialIconSchema = z.object({
    platform: z.string().max(50),
    url: z.string().max(500),
  }).refine((icon) => normalizeSocialUrl(icon.platform, icon.url) !== null, "URL inválida")
    .transform((icon) => ({ ...icon, url: normalizeSocialUrl(icon.platform, icon.url)! }));

  const appearanceSchema = z.object({
    avatar: z.string().url().nullable().optional(),
    background: z.record(z.string(), z.unknown()).nullable().optional(),
    linkStyle: z.record(z.string(), z.unknown()).nullable().optional(),
    theme: z.string().max(100).nullable().optional(),
    fontFamily: z.string().max(100).nullable().optional(),
    seoTitle: z.string().max(60).nullable().optional(),
    seoDescription: z.string().max(160).nullable().optional(),
    socialIcons: z.array(socialIconSchema).max(20).nullable().optional(),
  });

  const parsed = appearanceSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "errors.invalidData" };
  }

  const updateData: Record<string, unknown> = {};
  if (data.avatar !== undefined) updateData.avatar = data.avatar;
  if (data.background !== undefined) updateData.background = data.background ?? undefined;
  if (data.linkStyle !== undefined) updateData.linkStyle = data.linkStyle ?? undefined;
  if (data.theme !== undefined) updateData.theme = data.theme;
  if (data.fontFamily !== undefined) updateData.fontFamily = data.fontFamily;
  if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
  if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;
  if (data.socialIcons !== undefined) updateData.socialIcons = parsed.data.socialIcons ?? undefined;

  const updated = await db.tree.update({
    where: { id: treeId },
    
    data: updateData,
  });

  revalidatePath(`/editor/${updated.slug}`);
  revalidatePath(`/${updated.slug}`);
  return updated;
}

export async function deleteTree(treeId: string) {
  const userResult = await requireUser();
  if (isAuthError(userResult)) return userResult;
  const userId = userResult;

  const tree = await db.tree.findUnique({ where: { id: treeId } });
  if (!tree || tree.userId !== userId) return { error: "errors.notAuthorized" };

  await db.tree.delete({ where: { id: treeId } });

  revalidatePath("/dashboard");
}

export async function checkSlugAvailability(slug: string): Promise<boolean> {
  if (!slug || slug.length < 2) return false;

  const userResult = await requireUser();
  if (isAuthError(userResult)) return false;

  const existing = await db.tree.findUnique({ where: { slug } });
  return !existing;
}
