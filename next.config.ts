import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // No legitimate reason for this site to be framed by another
          // origin — blocks clickjacking (fake overlay tricking a logged-in
          // user into clicking a real buy/checkout button underneath).
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none';" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  images: {
    // Admins can point a product/game image at any https URL.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    // Generated placeholder art (public/games, public/products) is SVG.
    // Safe to allow here since these are build-time assets we generate
    // ourselves, never user-uploaded content.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
