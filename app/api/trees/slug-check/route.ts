import { getAuthUser } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { getClientIp, slugCheckRateLimiter } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authResult = await getAuthUser();
  if ("response" in authResult) return authResult.response;
  const { userId } = authResult;

  const ip = getClientIp(request);
  const { success } = await slugCheckRateLimiter.check(`slug:${ip}`);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const excludeId = searchParams.get("excludeId");

  if (!slug || slug.length < 2) {
    return NextResponse.json({ available: false });
  }

  const existing = await db.tree.findFirst({
    where: {
      slug,

      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true, userId: true },
  });

  const available = !existing || existing.userId === userId;

  return NextResponse.json({ available });
}
