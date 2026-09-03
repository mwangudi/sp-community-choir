import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Uploads are capped at 5 MB in the app; server actions default to 1 MB,
    // which silently rejected every real photo. Leave headroom for multipart.
    serverActions: { bodySizeLimit: "6mb" },
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
