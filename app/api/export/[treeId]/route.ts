import {
  getCount,
  getCountryBreakdown,
  getDeviceBreakdown,
  getReferrers,
  getTimeSeries,
  getUniqueVisitors
} from "@/lib/analytics";
import { getAuthUser } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { sanitizeCsvValue } from "@/lib/security";
import type { Period } from "@/types";
import { NextResponse } from "next/server";

const exportLimiter = createRateLimiter({ max: 10, windowMs: 60_000 });

export async function GET(
  request: Request,
  { params }: { params: Promise<{ treeId: string }> }
) {
  const authResult = await getAuthUser();
  if ("response" in authResult) return authResult.response;
  const { userId } = authResult;

  const { success } = await exportLimiter.check(`export:${getClientIp(request)}`);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { treeId } = await params;
  const { searchParams } = new URL(request.url);
  const exportFormat = searchParams.get("format") || "csv";
  const period = (searchParams.get("period") || "7d") as Period;

  const tree = await db.tree.findUnique({
    where: { id: treeId },
    select: { title: true, slug: true, userId: true, links: { select: { id: true, label: true } } },
  });

  if (!tree) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (tree.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (exportFormat === "csv") {
    const [
      totalViews,
      totalClicks,
      uniqueVisitors,
      timeSeries,
      devices,
      countries,
      referrers,
    ] = await Promise.all([
      getCount("tree_view", treeId, period),
      getCount("link_click", treeId, period),
      getUniqueVisitors("tree_view", treeId, period),
      getTimeSeries("tree_view", treeId, period),
      getDeviceBreakdown("tree_view", treeId, period),
      getCountryBreakdown("tree_view", treeId, period),
      getReferrers("tree_view", treeId, period),
    ]);

    const lines: string[] = [];

    lines.push(`Gatree Analytics Report`);
    lines.push(`Tree: ${tree.title}`);
    lines.push(`Period: ${period}`);
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push("");

    lines.push("=== OVERVIEW ===");
    lines.push("Metric,Current");
    lines.push(`Total Views,${totalViews}`);
    lines.push(`Unique Visitors,${uniqueVisitors}`);
    lines.push(`Total Clicks,${totalClicks}`);
    lines.push("");

    lines.push("=== VIEWS PER DAY ===");
    lines.push("Date,Count");
    for (const day of timeSeries) {
      lines.push(`${day.date},${day.count}`);
    }
    lines.push("");

    lines.push("=== DEVICES ===");
    lines.push("Device,Count,Percentage (%)");
    for (const d of devices) {
      lines.push(`${d.device},${d.count},${d.percentage}`);
    }
    lines.push("");

    lines.push("=== COUNTRIES ===");
    lines.push("Country,Count,Percentage (%)");
    for (const c of countries) {
      lines.push(`${c.country},${c.count},${c.percentage}`);
    }
    lines.push("");

    lines.push("=== REFERRERS ===");
    lines.push("Referrer,Count,Percentage (%)");
    for (const r of referrers) {
      lines.push(`"${sanitizeCsvValue(r.referrer)}",${r.count},${r.percentage}`);
    }

    const csv = lines.join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="gatree-${tree.slug}-analytics-${period}.csv"`,
      },
    });
  }

  return NextResponse.json({ error: "Unsupported format. Use ?format=csv" }, { status: 400 });
}
