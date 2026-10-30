import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  const shortLink = await db.shortLink.findUnique({
    where: { slug },
  });

  if (!shortLink) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (shortLink.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const clickCount = await db.analyticsEvent.count({
    where: {
      sourceType: "short_link_click",
      sourceId: shortLink.id,
    },
  });

  return NextResponse.json({ ...shortLink, clickCount });
}
