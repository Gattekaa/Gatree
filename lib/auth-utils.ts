import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import "server-only";

export async function getAuthUser(): Promise<
  { userId: string } | { response: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { userId: session.user.id };
}

export async function requireUser(): Promise<string | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "errors.notAuthenticated" };

  return session.user.id;
}

export function isAuthError(
  result: string | { error: string }
): result is { error: string } {
  return typeof result === "object" && "error" in result;
}
