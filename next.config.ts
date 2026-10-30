import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly disable browser source maps in production to prevent
  // reverse engineering of application logic
  productionBrowserSourceMaps: false,

  allowedDevOrigins: ["ae17-45-227-57-34.ngrok-free.app"],
  images: {
    qualities: [75, 95],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "pub-3c3ccbdbe8fc4c549da6395dafe46d03.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
    ],
  },
  async headers() {
    return [
      // Global baseline security headers applied to every route
      {
        source: "/(.*)",
        headers: [
          // HSTS: force HTTPS for 2 years, include subdomains
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },

      // Dashboard / auth / API — block framing (sensitive pages)
      {
        source:
          "/(dashboard|editor|analytics|settings|login|register|api)/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },

      // Public tree pages — allow same-origin framing for editor preview + partial CSP
      {
        source: "/:slug",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "frame-src 'self' https://www.youtube.com https://open.spotify.com https://w.soundcloud.com https://www.google.com https://maps.google.com",
              "img-src 'self' data: https: blob:",
              "style-src 'self' 'unsafe-inline'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
