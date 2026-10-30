const PRIVATE_SECTIONS = new Set([
  "api",
  "dashboard",
  "editor",
  "analytics",
  "settings",
  "shortener",
  "login",
  "register",
]);

export function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(?:en|pt-BR)(?=\/|$)/, "") || "/";
}

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_SECTIONS.has(stripLocale(pathname).split("/")[1]);
}

export function matchesHostname(
  hostname: string,
  domains: readonly string[],
): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return domains.some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  );
}

export function isAllowedHost(
  host: string,
  env: Record<string, string | undefined>,
): boolean {
  let hostname: string;
  try {
    if (!host || /[\s/@?#\\]/.test(host)) return false;
    hostname = new URL(`https://${host}`).hostname
      .toLowerCase()
      .replace(/\.$/, "");
  } catch {
    return false;
  }
  const allowed = new Set<string>();
  for (const entry of [
    env.NEXT_PUBLIC_APP_URL,
    env.VERCEL_URL,
    env.VERCEL_BRANCH_URL,
    env.VERCEL_PROJECT_PRODUCTION_URL,
    ...(env.GATREE_ALLOWED_HOSTS || "").split(","),
  ]) {
    if (!entry?.trim()) continue;
    try {
      allowed.add(
        new URL(
          entry.includes("://") ? entry : `https://${entry.trim()}`,
        ).hostname
          .toLowerCase()
          .replace(/\.$/, ""),
      );
    } catch {
      /* Ignore invalid configured hosts. */
    }
  }
  if (env.NODE_ENV !== "production")
    for (const local of ["localhost", "127.0.0.1", "[::1]"]) allowed.add(local);
  return allowed.has(hostname);
}

export function contentSecurityPolicy(
  nonce: string,
  privatePage: boolean,
  development = false,
): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com${development ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com data:",
    `connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.google.com https://stats.g.doubleclick.net https://nominatim.openstreetmap.org${development ? " ws: wss:" : ""}`,
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://open.spotify.com https://w.soundcloud.com https://www.google.com https://maps.google.com",
    `frame-ancestors ${privatePage ? "'none'" : "'self'"}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com https://github.com",
    "worker-src 'self' blob:",
    ...(!development ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}
