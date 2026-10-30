import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  isValidLocale,
  type Locale
} from "@/lib/i18n/config";
import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkip(pathname)) {
    if (pathname.startsWith("/api/")) {
      const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
      });
      if (token?.id) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-user-id", token.id as string);
        return NextResponse.next({ request: { headers: requestHeaders } });
      }
    }
    return NextResponse.next();
  }

  const pathnameLocale = getLocaleFromPath(pathname);

  if (pathnameLocale) {
    const authResponse = handleAuthAndProceed(request, pathnameLocale);
    if (authResponse.status >= 300 && authResponse.status < 400) {
      return authResponse;
    }
    const response = NextResponse.next();
    response.headers.set("x-locale", pathnameLocale);
    return response;
  }

  const detectedLocale = detectLocale(request);

  if (detectedLocale !== DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = `/${detectedLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = `/${DEFAULT_LOCALE}${pathname}`;

  const authResponse = handleAuthAndProceed(request, DEFAULT_LOCALE);

  if (authResponse.status >= 300 && authResponse.status < 400) {
    return authResponse;
  }

  const response = NextResponse.rewrite(rewriteUrl);
  response.headers.set("x-locale", DEFAULT_LOCALE);
  return response;
}

export function detectLocale(request: NextRequest): Locale {

  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale;

  const acceptLang = request.headers.get("accept-language") || "";
  if (acceptLang.match(/en/i)) return "en";

  return DEFAULT_LOCALE;
}

function shouldSkip(pathname: string): boolean {

  if (pathname.startsWith("/api/")) return true;

  if (pathname.startsWith("/_next/")) return true;

  if (pathname.startsWith("/s/")) return true;

  const staticExtensions = [
    ".ico",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".webp",
    ".avif",
    ".woff",
    ".woff2",
    ".ttf",
    ".otf",
    ".css",
    ".js",
    ".map",
    ".json",
    ".xml",
    ".txt",
    ".webmanifest",
  ];
  if (staticExtensions.some((ext) => pathname.endsWith(ext))) return true;

  return false;
}

function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split("/");

  const firstSegment = segments[1];

  if (firstSegment && isValidLocale(firstSegment)) {
    return firstSegment;
  }

  return null;
}

function handleAuthAndProceed(
  request: NextRequest,
  locale: Locale
): NextResponse {
  const { pathname } = request.nextUrl;

  const pathWithoutLocale =
    locale !== DEFAULT_LOCALE
      ? pathname.replace(`/${locale}`, "") || "/"
      : pathname;

  const hostname = request.headers.get("host") || "";
  const primaryDomains = [
    "localhost:3000",
    "gatree.app",
    "www.gatree.app",
    "xqr1v1j7-3000.brs.devtunnels.ms",
  ];
  const isCustomDomain = !primaryDomains.some((d) => hostname.includes(d));

  if (isCustomDomain && pathWithoutLocale === "/") {
  }

  const sessionCookie =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token") ||
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  const isAuthenticated = !!sessionCookie;

  const protectedPaths = ["/dashboard", "/editor", "/analytics", "/settings"];
  const isProtectedRoute = protectedPaths.some((path) =>
    pathWithoutLocale.startsWith(path)
  );

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathWithoutLocale === "/login" && isAuthenticated) {
    const signedOut = request.nextUrl.searchParams.get("signedOut");
    if (signedOut) {
      const response = NextResponse.next();
      response.cookies.delete("authjs.session-token");
      response.cookies.delete("__Secure-authjs.session-token");
      response.cookies.delete("next-auth.session-token");
      response.cookies.delete("__Secure-next-auth.session-token");
      return response;
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [

    "/((?!api/|_next/|s/|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2|ttf|otf|css|js|map|json|xml|txt|webmanifest)$).*)",
  ],
};
