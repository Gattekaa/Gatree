"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/short-link-utils";
import type { CreateShortLinkInput, UpdateShortLinkInput } from "@/lib/validations";
import { createShortLinkSchema, updateShortLinkSchema } from "@/lib/validations";
import type { ShortLink } from "@prisma/client";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

export async function createShortLink(
  data: CreateShortLinkInput,
): Promise<ShortLink | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "errors.notAuthenticated" };

  const parsed = createShortLinkSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "errors.invalidData" };
  }

  const { url, customSlug, title, description, password, expiresAt } =
    parsed.data;

  const linkCount = await db.shortLink.count({
    where: { userId: session.user.id },
  });
  if (linkCount >= 100) {
    return { error: "errors.limitReached" };
  }

  let slug: string;
  if (customSlug) {

    const existing = await db.shortLink.findUnique({
      where: { slug: customSlug },
    });
    if (existing) {
      return { error: "errors.slugInUse" };
    }
    slug = customSlug;
  } else {

    slug = await generateSlug(async (candidate) => {
      const found = await db.shortLink.findUnique({
        where: { slug: candidate },
      });
      return !!found;
    });
  }

  let passwordHash: string | null = null;
  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }

  let expiresAtDate: Date | null = null;
  if (expiresAt) {
    expiresAtDate = new Date(expiresAt);
    const minExpiration = new Date(Date.now() + 5 * 60 * 1000);
    if (expiresAtDate < minExpiration) {
      return { error: "errors.expirationFuture" };
    }
  }

  const shortLink = await db.shortLink.create({
    data: {
      slug,
      url,
      title: title || null,
      description: description || null,
      passwordHash,
      expiresAt: expiresAtDate,
      userId: session.user.id,
    },
  });

  revalidatePath("/shortener");

  return shortLink;
}

export async function updateShortLink(
  id: string,
  data: UpdateShortLinkInput,
): Promise<ShortLink | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "errors.notAuthenticated" };

  const existing = await db.shortLink.findUnique({ where: { id } });
  if (!existing) return { error: "errors.notFound" };
  if (existing.userId !== session.user.id) return { error: "errors.notAuthorized" };

  const parsed = updateShortLinkSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "errors.invalidData" };
  }

  const { url, title, description, password, expiresAt } = parsed.data;

  const updateData: Record<string, unknown> = {};

  if (url !== undefined) {
    updateData.url = url;
  }

  if (title !== undefined) {
    updateData.title = title || null;
  }

  if (description !== undefined) {
    updateData.description = description || null;
  }

  if (password !== undefined) {
    if (password === null) {
      updateData.passwordHash = null;
    } else {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }
  }

  if (expiresAt !== undefined) {
    if (expiresAt === null) {
      updateData.expiresAt = null;
    } else {
      const expiresAtDate = new Date(expiresAt);
      const minExpiration = new Date(Date.now() + 1 * 60 * 1000);
      if (expiresAtDate < minExpiration) {
        return { error: "errors.expirationFutureMin" };
      }
      updateData.expiresAt = expiresAtDate;
    }
  }

  const updatedLink = await db.shortLink.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/shortener");

  return updatedLink;
}

export async function deleteShortLink(id: string): Promise<void | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "errors.notAuthenticated" };

  const shortLink = await db.shortLink.findUnique({
    where: { id },
  });

  if (!shortLink || shortLink.userId !== session.user.id) {
    return { error: "errors.notAuthorized" };
  }

  await db.shortLink.delete({
    where: { id },
  });

  revalidatePath("/shortener");
}
