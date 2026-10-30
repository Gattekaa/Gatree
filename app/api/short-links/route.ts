import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const perPage = 20;

  const where = {
    userId: session.user.id,
    ...(search
      ? {
          OR: [
            { slug: { contains: search, mode: "insensitive" as const } },
            { url: { contains: search, mode: "insensitive" as const } },
            { title: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [links, total] = await Promise.all([
    db.shortLink.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.shortLink.count({ where }),
  ]);

  const linkIds = links.map((l) => l.id);
  const clickCounts =
    linkIds.length > 0
      ? await db.analyticsEvent.groupBy({
          by: ["sourceId"],
          where: {
            sourceType: "short_link_click",
            sourceId: { in: linkIds },
          },
          _count: { id: true },
        })
      : [];

  const clickCountMap = new Map(clickCounts.map((c) => [c.sourceId, c._count.id]));

  const data = links.map((link) => ({
    ...link,
    clickCount: clickCountMap.get(link.id) ?? 0,
  }));

  return NextResponse.json({
    data,
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  });
}
