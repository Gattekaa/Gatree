import { db } from "@/lib/db";
import { isPublicLinkAvailable } from "@/lib/link-access";
import { clickRateLimiter, getClientIp } from "@/lib/rate-limit";
import { isAllowedRedirectUrl } from "@/lib/security";
import { trackLinkClick } from "@/lib/tracking";
import { after, NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ linkId: string }> },
) {
  const { success } = await clickRateLimiter.check(
    "click:" + getClientIp(request),
  );
  if (!success)
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const { linkId } = await params;
  const link = await db.link.findUnique({
    where: { id: linkId },
    select: {
      url: true,
      treeId: true,
      enabled: true,
      scheduledStart: true,
      scheduledEnd: true,
      tree: { select: { status: true } },
    },
  });
  if (!link || !isPublicLinkAvailable(link)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const destination = /^https?:\/\//i.test(link.url)
    ? link.url
    : "https://" + link.url;
  if (!isAllowedRedirectUrl(destination)) {
    return NextResponse.json(
      { error: "URL de destino inválida" },
      { status: 400 },
    );
  }
  after(async () => {
    try {
      await trackLinkClick(linkId, link.treeId, request.headers);
    } catch {
      console.error("Link click tracking failed");
    }
  });
  const response = NextResponse.redirect(destination, 302);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
