import { getAuthUser } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const authResult = await getAuthUser();
  if ("response" in authResult) return authResult.response;
  const { userId } = authResult;

  const trees = await db.tree.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (trees.length === 0) {
    return NextResponse.json({ trees: [], totals: { views: 0, clicks: 0 } });
  }

  const treeIds = trees.map((t) => t.id);

  const treeLinks = await db.link.findMany({
    where: { treeId: { in: treeIds } },
    select: { id: true, treeId: true },
  });

  const linksByTree = new Map<string, string[]>();
  for (const link of treeLinks) {
    const existing = linksByTree.get(link.treeId) ?? [];
    existing.push(link.id);
    linksByTree.set(link.treeId, existing);
  }

  const [viewCounts, clickCounts] = await Promise.all([
    db.analyticsEvent.groupBy({
      by: ["sourceId"],
      where: {
        sourceType: "tree_view",
        sourceId: { in: treeIds },
      },
      _count: { id: true },
    }),
    treeLinks.length > 0
      ? db.analyticsEvent.groupBy({
          by: ["sourceId"],
          where: {
            sourceType: "link_click",
            sourceId: { in: treeLinks.map((l) => l.id) },
          },
          _count: { id: true },
        })
      : Promise.resolve([]),
  ]);

  const viewCountMap = new Map(viewCounts.map((v) => [v.sourceId, v._count.id]));

  const clickCountByTree = new Map<string, number>();
  for (const link of treeLinks) {
    const linkClicks = Array.isArray(clickCounts)
      ? (clickCounts.find((c) => c.sourceId === link.id)?._count.id ?? 0)
      : 0;
    clickCountByTree.set(link.treeId, (clickCountByTree.get(link.treeId) ?? 0) + linkClicks);
  }

  const treesWithCounts = trees.map((tree) => ({
    ...tree,
    views: viewCountMap.get(tree.id) ?? 0,
    clicks: clickCountByTree.get(tree.id) ?? 0,
  }));

  const totalViews = treesWithCounts.reduce((sum, t) => sum + t.views, 0);
  const totalClicks = treesWithCounts.reduce((sum, t) => sum + t.clicks, 0);

  return NextResponse.json({
    trees: treesWithCounts,
    totals: { views: totalViews, clicks: totalClicks },
  });
}
