import { db } from "@/lib/db";
import { getClientIp, passwordRateLimiter } from "@/lib/rate-limit";
import { isAllowedRedirectUrl } from "@/lib/security";
import { trackShortLinkClick } from "@/lib/short-link-analytics";
import bcrypt from "bcrypt";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const shortLink = await db.shortLink.findUnique({
    where: { slug },
  });

  if (!shortLink) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (shortLink.expiresAt && new Date() > shortLink.expiresAt) {
    return NextResponse.redirect(new URL(`/s/${slug}/expired`, request.url));
  }

  if (shortLink.passwordHash) {
    return NextResponse.redirect(new URL(`/s/${slug}/password`, request.url));
  }

  const headersList = await headers();
  trackShortLinkClick(shortLink.id, headersList).catch(() => {});

  
  
  if (!isAllowedRedirectUrl(shortLink.url)) {
    return new NextResponse("Invalid redirect URL", { status: 400 });
  }

  return NextResponse.redirect(shortLink.url, 307);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const ip = getClientIp(request);
  const rateLimitKey = `password:${ip}:${slug}`;
  const { success: withinLimit } = await passwordRateLimiter.check(rateLimitKey);

  if (!withinLimit) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde 15 minutos e tente novamente." },
      { status: 429 }
    );
  }

  const shortLink = await db.shortLink.findUnique({
    where: { slug },
  });

  if (!shortLink || !shortLink.passwordHash) {
    return NextResponse.json(
      { error: "Link não encontrado" },
      { status: 404 }
    );
  }

  if (shortLink.expiresAt && new Date() > shortLink.expiresAt) {
    return NextResponse.json(
      { error: "Este link expirou" },
      { status: 410 }
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido" },
      { status: 400 }
    );
  }

  const { password } = body;
  if (!password) {
    return NextResponse.json(
      { error: "Senha é obrigatória" },
      { status: 400 }
    );
  }

  const isValid = await bcrypt.compare(password, shortLink.passwordHash);
  if (!isValid) {
    return NextResponse.json(
      { error: "Senha incorreta" },
      { status: 401 }
    );
  }

  const headersList = await headers();
  trackShortLinkClick(shortLink.id, headersList).catch(() => {});

  
  if (!isAllowedRedirectUrl(shortLink.url)) {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  return NextResponse.json({ redirectUrl: shortLink.url });
}
