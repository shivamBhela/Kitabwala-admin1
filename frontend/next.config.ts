import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "kitabwalah.com",
      },
    ],
  },
  typedRoutes: false,
};

export default nextConfig;
