import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        ...(process.env.VERCEL_URL ? [process.env.VERCEL_URL] : []),
        ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? [process.env.VERCEL_PROJECT_PRODUCTION_URL]
          : []),
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
