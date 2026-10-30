import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  isValidLocale,
  type Locale,
} from "@/lib/i18n/config";
import {
  contentSecurityPolicy,
  isAllowedHost,
  isPrivatePath,
  stripLocale,
} from "@/lib/security-policy";
import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

export function proxy(request: NextRequest) {
  if (!isAllowedHost(request.headers.get("host") || "", process.env)) {
    return new NextResponse("Invalid host", { status: 400 });
  }

  const { pathname } = request.nextUrl;
  const privatePage = isPrivatePath(pathname);
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = contentSecurityPolicy(
    nonce,
    privatePage,
    process.env.NODE_ENV === "development",
  );
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-user-id");
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  function finish(response: NextResponse) {
    response.headers.set("Content-Security-Policy", csp);
    response.headers.set(
      "X-Frame-Options",
      privatePage ? "DENY" : "SAMEORIGIN",
    );
    if (
      stripLocale(pathname) === "/login" &&
      request.nextUrl.searchParams.has("signedOut")
    ) {
      for (const cookie of SESSION_COOKIES) response.cookies.delete(cookie);
    }
    return response;
  }

  if (shouldSkip(pathname))
    return finish(NextResponse.next({ request: { headers: requestHeaders } }));

  const first = pathname.split("/")[1];
  const pathnameLocale = isValidLocale(first) ? first : null;
  const locale = pathnameLocale || detectLocale(request);
  requestHeaders.set("x-locale", locale);

  const withoutLocale = stripLocale(pathname);
  const protectedRoute = [
    "dashboard",
    "editor",
    "analytics",
    "settings",
    "shortener",
  ].includes(withoutLocale.split("/")[1]);
  if (
    protectedRoute &&
    !SESSION_COOKIES.some((cookie) => request.cookies.has(cookie))
  ) {
    const login = request.nextUrl.clone();
    login.pathname = locale === DEFAULT_LOCALE ? "/login" : `/${locale}/login`;
    login.search = "";
    login.searchParams.set("callbackUrl", pathname);
    return finish(NextResponse.redirect(login));
  }

  if (pathnameLocale)
    return finish(NextResponse.next({ request: { headers: requestHeaders } }));
  const destination = request.nextUrl.clone();
  destination.pathname = `/${locale}${pathname}`;
  if (locale !== DEFAULT_LOCALE)
    return finish(NextResponse.redirect(destination));
  return finish(
    NextResponse.rewrite(destination, { request: { headers: requestHeaders } }),
  );
}

export function detectLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale;
  return /(?:^|,)\s*en(?:-|;|,|$)/i.test(
    request.headers.get("accept-language") || "",
  )
    ? "en"
    : DEFAULT_LOCALE;
}

function shouldSkip(path: string) {
  return (
    /^\/(?:api|_next|s)(?:\/|$)/.test(path) ||
    /\.(?:ico|png|jpg|jpeg|gif|svg|webp|avif|woff2?|ttf|otf|css|js|map|json|xml|txt|webmanifest)$/.test(
      path,
    )
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2|ttf|otf|css|js|map|json|xml|txt|webmanifest)$).*)",
  ],
};
