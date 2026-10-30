"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface SessionInfo {
  id: string;
  device: string | null;
  ip: string | null;
  location: string | null;
  lastActive: Date;
  createdAt: Date;
  isCurrent: boolean;
}

export async function getActiveSessions(): Promise<SessionInfo[] | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "errors.notAuthenticated" };

  const currentSessionId = (session as { sessionId?: string }).sessionId;

  const sessions = await db.session.findMany({
    where: {
      userId: session.user.id,
      expires: { gt: new Date() },
    },
    orderBy: { lastActive: "desc" },
    select: {
      id: true,
      device: true,
      ip: true,
      location: true,
      lastActive: true,
      createdAt: true,
    },
  });

  return sessions.map((s) => ({
    ...s,
    isCurrent: s.id === currentSessionId,
  }));
}

export async function revokeSession(sessionId: string): Promise<void | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "errors.notAuthenticated" };

  const target = await db.session.findUnique({
    where: { id: sessionId },
    select: { userId: true },
  });

  if (!target || target.userId !== session.user.id) {
    return { error: "errors.notFound" };
  }

  await db.session.delete({ where: { id: sessionId } });
  revalidatePath("/settings");
}

export async function revokeAllOtherSessions(): Promise<void | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "errors.notAuthenticated" };

  const currentSessionId = (session as { sessionId?: string }).sessionId;

  await db.session.deleteMany({
    where: {
      userId: session.user.id,
      id: { not: currentSessionId || "" },
    },
  });

  revalidatePath("/settings");
}
