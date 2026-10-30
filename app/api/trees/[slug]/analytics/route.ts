import {
    getCityBreakdown,
    getCountryBreakdown,
    getDeviceBreakdown,
    getPeriodRange,
    getReferrers,
    getRegionBreakdown,
    getTimeSeries
} from "@/lib/analytics";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateInsights } from "@/lib/insights";
import type { AnalyticsOverview, LinkClickData, Period } from "@/types";
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
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") || "7d") as Period;
  const metric = searchParams.get("metric");

  const tree = await db.tree.findUnique({
    where: { slug },
    select: { id: true, userId: true, createdAt: true },
  });

  if (!tree) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (tree.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const treeId = tree.id;
  const treeCreatedAt = tree.createdAt;

  async function buildOverview(): Promise<AnalyticsOverview> {
    const { current, previous } = getPeriodRange(period);

    const [
      viewsCurrent,
      viewsPrevious,
      uniqueCurrent,
      uniquePrevious,
      topLinks,
    ] = await Promise.all([
      db.analyticsEvent.count({
        where: {
          sourceType: "tree_view",
          sourceId: treeId,
          createdAt: { gte: current.start, lte: current.end },
        },
      }),
      db.analyticsEvent.count({
        where: {
          sourceType: "tree_view",
          sourceId: treeId,
          createdAt: { gte: previous.start, lte: previous.end },
        },
      }),
      db.analyticsEvent.groupBy({
        by: ["country", "device", "browser"],
        where: {
          sourceType: "tree_view",
          sourceId: treeId,
          createdAt: { gte: current.start, lte: current.end },
        },
      }),
      db.analyticsEvent.groupBy({
        by: ["country", "device", "browser"],
        where: {
          sourceType: "tree_view",
          sourceId: treeId,
          createdAt: { gte: previous.start, lte: previous.end },
        },
      }),

      db.analyticsEvent.groupBy({
        by: ["sourceId"],
        where: {
          sourceType: "link_click",
          createdAt: { gte: current.start, lte: current.end },

        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 1,
      }),
    ]);

    const treeLinks = await db.link.findMany({
      where: { treeId: treeId },
      select: { id: true },
    });
    const linkIds = treeLinks.map((l) => l.id);

    const [clicksCurrent, clicksPrevious] = await Promise.all([
      db.analyticsEvent.count({
        where: {
          sourceType: "link_click",
          sourceId: { in: linkIds },
          createdAt: { gte: current.start, lte: current.end },
        },
      }),
      db.analyticsEvent.count({
        where: {
          sourceType: "link_click",
          sourceId: { in: linkIds },
          createdAt: { gte: previous.start, lte: previous.end },
        },
      }),
    ]);

    const topLinkClicks = await db.analyticsEvent.groupBy({
      by: ["sourceId"],
      where: {
        sourceType: "link_click",
        sourceId: { in: linkIds },
        createdAt: { gte: current.start, lte: current.end },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    });

    let topLink: { label: string; clicks: number } | null = null;
    if (topLinkClicks.length > 0) {
      const linkData = await db.link.findUnique({
        where: { id: topLinkClicks[0].sourceId },
        select: { label: true },
      });
      if (linkData) {
        topLink = { label: linkData.label, clicks: topLinkClicks[0]._count.id };
      }
    }

    const avgCTR = viewsCurrent > 0 ? (clicksCurrent / viewsCurrent) * 100 : 0;
    const avgCTRPrevious = viewsPrevious > 0 ? (clicksPrevious / viewsPrevious) * 100 : 0;

    return {
      totalViews: viewsCurrent,
      totalViewsPrevious: viewsPrevious,
      uniqueVisitors: uniqueCurrent.length,
      uniqueVisitorsPrevious: uniquePrevious.length,
      totalClicks: clicksCurrent,
      totalClicksPrevious: clicksPrevious,
      avgCTR: Math.round(avgCTR * 10) / 10,
      avgCTRPrevious: Math.round(avgCTRPrevious * 10) / 10,
      topLink,
    };
  }

  async function buildClicksByLink(): Promise<LinkClickData[]> {
    const { current, previous } = getPeriodRange(period);

    const treeLinks = await db.link.findMany({
      where: { treeId: treeId },
      select: { id: true, label: true, icon: true },
    });
    const linkIds = treeLinks.map((l) => l.id);
    const linksMap = new Map(treeLinks.map((l) => [l.id, l]));

    const [currentClicks, previousClicks, totalViews] = await Promise.all([
      db.analyticsEvent.groupBy({
        by: ["sourceId"],
        where: {
          sourceType: "link_click",
          sourceId: { in: linkIds },
          createdAt: { gte: current.start, lte: current.end },
        },
        _count: { id: true },
      }),
      db.analyticsEvent.groupBy({
        by: ["sourceId"],
        where: {
          sourceType: "link_click",
          sourceId: { in: linkIds },
          createdAt: { gte: previous.start, lte: previous.end },
        },
        _count: { id: true },
      }),
      db.analyticsEvent.count({
        where: {
          sourceType: "tree_view",
          sourceId: treeId,
          createdAt: { gte: current.start, lte: current.end },
        },
      }),
    ]);

    const previousMap = new Map(previousClicks.map((c) => [c.sourceId, c._count.id]));

    return currentClicks
      .map((c) => {
        const link = linksMap.get(c.sourceId);
        return {
          linkId: c.sourceId,
          label: link?.label || "Link removido",
          icon: link?.icon || null,
          clicks: c._count.id,
          clicksPrevious: previousMap.get(c.sourceId) || 0,
          ctr: totalViews > 0 ? Math.round((c._count.id / totalViews) * 1000) / 10 : 0,
        };
      })
      .sort((a, b) => b.clicks - a.clicks);
  }

  if (metric) {
    switch (metric) {
      case "overview":
        return NextResponse.json(await buildOverview());
      case "views":
        return NextResponse.json(await getTimeSeries("tree_view", treeId, period));
      case "clicks":
        return NextResponse.json(await buildClicksByLink());
      case "devices":
        return NextResponse.json(await getDeviceBreakdown("tree_view", treeId, period));
      case "countries":
        return NextResponse.json(await getCountryBreakdown("tree_view", treeId, period));
      case "regions":
        return NextResponse.json(await getRegionBreakdown("tree_view", treeId, period));
      case "cities":
        return NextResponse.json(await getCityBreakdown("tree_view", treeId, period));
      case "referrers":
        return NextResponse.json(await getReferrers("tree_view", treeId, period));
      case "insights": {
        const overview = await buildOverview();
        const clicksByLink = await buildClicksByLink();
        const daysSinceCreation = Math.floor(
          (Date.now() - treeCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        const hasEnoughData = daysSinceCreation >= 7 && overview.totalViews > 0;
        return NextResponse.json({
          insights: generateInsights(overview, clicksByLink, hasEnoughData),
          hasEnoughData,
        });
      }
      default:
        return NextResponse.json({ error: "Invalid metric" }, { status: 400 });
    }
  }

  const [overview, timeSeries, clicksByLink, devices, countries, regions, cities, referrers] =
    await Promise.all([
      buildOverview(),
      getTimeSeries("tree_view", treeId, period),
      buildClicksByLink(),
      getDeviceBreakdown("tree_view", treeId, period),
      getCountryBreakdown("tree_view", treeId, period),
      getRegionBreakdown("tree_view", treeId, period),
      getCityBreakdown("tree_view", treeId, period),
      getReferrers("tree_view", treeId, period),
    ]);

  const daysSinceCreation = Math.floor(
    (Date.now() - treeCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  const hasEnoughData = daysSinceCreation >= 7 && overview.totalViews > 0;
  const insights = generateInsights(overview, clicksByLink, hasEnoughData);

  return NextResponse.json({
    overview,
    timeSeries,
    clicksByLink,
    devices,
    countries,
    regions,
    cities,
    referrers,
    insights,
    hasEnoughData,
  });
}
