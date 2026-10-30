import { db } from "@/lib/db";
import { clickRateLimiter, getClientIp } from "@/lib/rate-limit";
import { resolveSocialDestination, socialClickId } from "@/lib/social-clicks";
import { trackLinkClick } from "@/lib/tracking";
import { after, NextResponse } from "next/server";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ treeId: string; platform: string }>;
  },
) {
  const { success } = await clickRateLimiter.check(
    "click:" + getClientIp(request),
  );
  if (!success)
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const { treeId, platform } = await params;
  const tree = await db.tree.findUnique({
    where: { id: treeId },
    select: { status: true, socialIcons: true },
  });
  const destination =
    tree?.status === "ACTIVE"
      ? resolveSocialDestination(tree.socialIcons, platform)
      : null;
  if (!destination)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  after(async () => {
    try {
      await trackLinkClick(
        socialClickId(treeId, platform),
        treeId,
        request.headers,
      );
    } catch {
      console.error("Social click tracking failed");
    }
  });
  const response = NextResponse.redirect(destination, 302);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
