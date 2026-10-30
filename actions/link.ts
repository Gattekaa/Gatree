"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { serverLinkSchema } from "@/lib/validations";
import type { LinkType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createLink(
  treeId: string,
  data: {
    label: string;
    url: string;
    icon?: string;
    type?: LinkType;
    bgColor?: string;
    textColor?: string;
    thumbnail?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
  }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "errors.notAuthenticated" };

  const tree = await db.tree.findUnique({ where: { id: treeId } });
  if (!tree || tree.userId !== session.user.id) return { error: "errors.notAuthorized" };

  const parsed = serverLinkSchema.safeParse({
    label: data.label,
    url: data.url,
    icon: data.icon,
    type: data.type || "LINK",
  });
  if (!parsed.success) {
    return { error: "errors.invalidData" };
  }

  if (data.scheduledStart && data.scheduledEnd) {
    const start = new Date(data.scheduledStart);
    const end = new Date(data.scheduledEnd);
    if (end <= start) {
      return { error: "errors.endDateAfterStart" };
    }
  }

  const maxPosition = await db.link.aggregate({
    where: { treeId },
    _max: { position: true },
  });
  const nextPosition = (maxPosition._max.position ?? -1) + 1;

  const link = await db.link.create({
    data: {
      treeId,
      label: parsed.data.label,
      url: parsed.data.url,
      icon: parsed.data.icon || null,
      type: parsed.data.type,
      position: nextPosition,
      bgColor: data.bgColor || null,
      textColor: data.textColor || null,
      thumbnail: data.thumbnail || null,
      scheduledStart: data.scheduledStart ? new Date(data.scheduledStart) : null,
      scheduledEnd: data.scheduledEnd ? new Date(data.scheduledEnd) : null,
    },
  });

  revalidatePath(`/editor/${tree.slug}`);
  revalidatePath(`/${tree.slug}`);
  return link;
}

export async function updateLink(
  linkId: string,
  data: {
    label?: string;
    url?: string;
    icon?: string | null;
    type?: LinkType;
    enabled?: boolean;
    bgColor?: string | null;
    textColor?: string | null;
    thumbnail?: string | null;
    scheduledStart?: string | null;
    scheduledEnd?: string | null;
  }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "errors.notAuthenticated" };

  const link = await db.link.findUnique({
    where: { id: linkId },
    include: { tree: true },
  });
  if (!link || link.tree.userId !== session.user.id) return { error: "errors.notAuthorized" };

  if (data.url !== undefined || data.type !== undefined) {
    const parsed = serverLinkSchema.safeParse({
      label: data.label ?? link.label,
      url: data.url ?? link.url,
      icon: data.icon !== undefined ? data.icon : link.icon,
      type: data.type ?? link.type,
    });
    if (!parsed.success) {
      return { error: "errors.invalidData" };
    }

    if (data.url !== undefined) data.url = parsed.data.url;
  }

  const effectiveStart = data.scheduledStart !== undefined ? data.scheduledStart : (link.scheduledStart ? link.scheduledStart.toISOString() : null);
  const effectiveEnd = data.scheduledEnd !== undefined ? data.scheduledEnd : (link.scheduledEnd ? link.scheduledEnd.toISOString() : null);
  if (effectiveStart && effectiveEnd) {
    const start = new Date(effectiveStart);
    const end = new Date(effectiveEnd);
    if (end <= start) {
      return { error: "errors.endDateAfterStart" };
    }
  }

  const prismaData: Record<string, unknown> = { ...data };
  if (data.scheduledStart !== undefined) {
    prismaData.scheduledStart = data.scheduledStart ? new Date(data.scheduledStart) : null;
  }
  if (data.scheduledEnd !== undefined) {
    prismaData.scheduledEnd = data.scheduledEnd ? new Date(data.scheduledEnd) : null;
  }

  const updated = await db.link.update({
    where: { id: linkId },
    data: prismaData,
  });

  revalidatePath(`/editor/${link.tree.slug}`);
  revalidatePath(`/${link.tree.slug}`);
  return updated;
}

export async function deleteLink(linkId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "errors.notAuthenticated" };

  const link = await db.link.findUnique({
    where: { id: linkId },
    include: { tree: true },
  });
  if (!link || link.tree.userId !== session.user.id) return { error: "errors.notAuthorized" };

  await db.link.delete({ where: { id: linkId } });

  revalidatePath(`/editor/${link.tree.slug}`);
  revalidatePath(`/${link.tree.slug}`);
}

export async function reorderLinks(treeId: string, orderedIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) return { error: "errors.notAuthenticated" };

  const tree = await db.tree.findUnique({ where: { id: treeId } });
  if (!tree || tree.userId !== session.user.id) return { error: "errors.notAuthorized" };

  const existingLinks = await db.link.findMany({
    where: { treeId, id: { in: orderedIds } },
    select: { id: true },
  });
  if (existingLinks.length !== orderedIds.length) {
    return { error: "errors.invalidIds" };
  }

  if (new Set(orderedIds).size !== orderedIds.length) {
    return { error: "errors.duplicateIds" };
  }

  await db.$transaction(
    orderedIds.map((id, index) =>
      db.link.update({
        where: { id },
        data: { position: index },
      })
    )
  );

  revalidatePath(`/editor/${tree.slug}`);
  revalidatePath(`/${tree.slug}`);
}

export async function toggleLink(linkId: string, enabled: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { error: "errors.notAuthenticated" };

  const link = await db.link.findUnique({
    where: { id: linkId },
    include: { tree: true },
  });
  if (!link || link.tree.userId !== session.user.id) return { error: "errors.notAuthorized" };

  const updated = await db.link.update({
    where: { id: linkId },
    data: { enabled },
  });

  revalidatePath(`/editor/${link.tree.slug}`);
  revalidatePath(`/${link.tree.slug}`);
  return updated;
}

export async function toggleLinkPriority(linkId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "errors.notAuthenticated" };

  const link = await db.link.findUnique({
    where: { id: linkId },
    include: { tree: true },
  });
  if (!link || link.tree.userId !== session.user.id) return { error: "errors.notAuthorized" };

  if (link.priority) {

    await db.link.update({
      where: { id: linkId },
      data: { priority: false },
    });
  } else {

    await db.link.updateMany({
      where: { treeId: link.treeId, priority: true },
      data: { priority: false },
    });
    await db.link.update({
      where: { id: linkId },
      data: { priority: true },
    });
  }

  revalidatePath(`/editor/${link.tree.slug}`);
  revalidatePath(`/${link.tree.slug}`);
}

export async function setPriorityLink(linkId: string, priority: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { error: "errors.notAuthenticated" };

  const link = await db.link.findUnique({
    where: { id: linkId },
    include: { tree: true },
  });
  if (!link || link.tree.userId !== session.user.id) return { error: "errors.notAuthorized" };

  if (priority) {
    await db.link.updateMany({
      where: { treeId: link.treeId, priority: true },
      data: { priority: false },
    });
  }

  const updated = await db.link.update({
    where: { id: linkId },
    data: { priority },
  });

  revalidatePath(`/editor/${link.tree.slug}`);
  revalidatePath(`/${link.tree.slug}`);
  return updated;
}
