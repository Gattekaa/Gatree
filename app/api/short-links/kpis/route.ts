import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const userShortLinks = await db.shortLink.findMany({
    where: { userId },
    select: { id: true, slug: true },
  });

  const shortLinkIds = userShortLinks.map((sl) => sl.id);

  const [totalLinks, totalClicks30d, topLinkResult] = await Promise.all([

    Promise.resolve(userShortLinks.length),

    shortLinkIds.length > 0
      ? db.analyticsEvent.count({
          where: {
            sourceType: "short_link_click",
            sourceId: { in: shortLinkIds },
            createdAt: { gte: thirtyDaysAgo },
          },
        })
      : Promise.resolve(0),

    shortLinkIds.length > 0
      ? db.analyticsEvent.groupBy({
          by: ["sourceId"],
          where: {
            sourceType: "short_link_click",
            sourceId: { in: shortLinkIds },
            createdAt: { gte: thirtyDaysAgo },
          },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 1,
        })
      : Promise.resolve([]),
  ]);

  let topLink: { slug: string; clicks: number } | null = null;
  if (Array.isArray(topLinkResult) && topLinkResult.length > 0) {
    const topEntry = topLinkResult[0];
    const found = userShortLinks.find((sl) => sl.id === topEntry.sourceId);
    if (found) {
      topLink = {
        slug: found.slug,
        clicks: topEntry._count.id,
      };
    }
  }

  return NextResponse.json({
    totalLinks,
    totalClicks30d,
    topLink,
  });
}
