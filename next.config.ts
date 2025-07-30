import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "images.unsplash.com",
      "download.samplelib.com",
      "cdn.jsdelivr.net",
      "assets.admirelc.uz", // added to allow Next.js Image for assets domain
    ],
    // Avoid generating image widths larger than 2000px (Unsplash limit)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 160, 320, 640, 960, 1200, 1600, 2000],
  },
};

export default nextConfig;
