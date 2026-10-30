import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import QRCode from "qrcode";

const RATE_LIMIT_MAX = 20;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ treeId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { createRateLimiter, getClientIp } = await import("@/lib/rate-limit");
  const limiter = createRateLimiter({ max: RATE_LIMIT_MAX, windowMs: 60_000 });
  const { success } = await limiter.check(`qrcode:${getClientIp(request)}`);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { treeId } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "png";
  const rawSize = parseInt(searchParams.get("size") || "512", 10);
  const size = Math.max(64, Math.min(2048, isNaN(rawSize) ? 512 : rawSize));

  const tree = await db.tree.findUnique({
    where: { id: treeId },
    select: { slug: true, userId: true },
  });

  if (!tree) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (tree.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const treeUrl = `${appUrl}/${tree.slug}`;

  if (format === "svg") {
    const svg = await QRCode.toString(treeUrl, {
      type: "svg",
      width: size,
      errorCorrectionLevel: "H",
      color: { dark: "#f7f8f8", light: "#00000000" },
    });

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="gatree-${tree.slug}-qr.svg"`,
      },
    });
  }

  const dataUrl = await QRCode.toDataURL(treeUrl, {
    width: size,
    errorCorrectionLevel: "H",
    color: { dark: "#f7f8f8", light: "#00000000" },
    margin: 2,
  });

  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="gatree-${tree.slug}-qr.png"`,
    },
  });
}
