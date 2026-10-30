import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import "server-only";

export async function getAuthUser(): Promise<
  { userId: string } | { response: NextResponse }
> {
  const headersList = await headers();
  const headerUserId = headersList.get("x-user-id");

  if (headerUserId) {
    return { userId: headerUserId };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { userId: session.user.id };
}

export async function requireUser(): Promise<string | { error: string }> {
  const headersList = await headers();
  const headerUserId = headersList.get("x-user-id");

  if (headerUserId) return headerUserId;

  const session = await auth();
  if (!session?.user?.id) return { error: "errors.notAuthenticated" };

  return session.user.id;
}

export function isAuthError(
  result: string | { error: string }
): result is { error: string } {
  return typeof result === "object" && "error" in result;
}
