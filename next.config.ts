import type { NextConfig } from "next";

// Enables access to Cloudflare bindings (D1, Durable Objects) during `next dev`.
// Only loaded in development so it never runs during `next build`.
if (process.env.NODE_ENV === "development") {
  void import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) =>
    initOpenNextCloudflareForDev(),
  );
}

/**
 * Content Security Policy.
 * - OpenStreetMap tile servers are allowed for the Leaflet map layers.
 * - `wss:` is required for the realtime location WebSocket.
 * - `unsafe-inline` style is required by Leaflet's inline positioning styles.
 */
// Next.js App Router requires inline bootstrap scripts — strict script-src breaks hydration (white screen).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://lh3.googleusercontent.com https://*.googleusercontent.com https://images.unsplash.com https://i.ytimg.com https://img.youtube.com",
  "font-src 'self'",
  "connect-src 'self' wss: https://*.tile.openstreetmap.org",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    // Geolocation is only granted to this origin (required for sharing).
    value: "geolocation=(self), camera=(), microphone=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    // Lint runs as a dedicated CI step (`npm run lint`).
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
