import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: [
        "projeto-croche-production.up.railway.app",
        "localhost:3000",
        "localhost:3001",
        "localhost:3002",
        "localhost:3003",
        "localhost:3004",
        "localhost:3005",
        ...(process.env.RAILWAY_PUBLIC_DOMAIN
          ? [process.env.RAILWAY_PUBLIC_DOMAIN]
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
