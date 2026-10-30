import { getAuthUser } from "@/lib/auth-utils";
import { treeSlugSchema, isTreeSlugAvailable } from "@/lib/tree-slug";
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

  if (!treeSlugSchema.safeParse(slug).success) {
    return NextResponse.json({ available: false });
  }

  const existing = await db.tree.findFirst({
    where: { slug: slug! },
    select: { id: true, userId: true },
  });

  const available = isTreeSlugAvailable(existing, userId, excludeId);

  return NextResponse.json({ available });
}
