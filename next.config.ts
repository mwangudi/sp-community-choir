import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The droplet has no headroom to run a build, so ship a self-contained
  // server and let it only run node server.js.
  output: "standalone",
  experimental: {
    // Uploads are capped at 5 MB in the app; server actions default to 1 MB,
    // which silently rejected every real photo. Leave headroom for multipart.
    serverActions: { bodySizeLimit: "6mb" },
  },
  // No need to tell every visitor which framework serves the site.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Served over HTTPS only; browsers then refuse a downgrade.
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Nothing here is meant to be framed by other sites (the admin least of all).
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
