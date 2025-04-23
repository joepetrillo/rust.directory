import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "cdn.rusthelp.com",
      },
      {
        hostname: "avatars.steamstatic.com",
      },
    ],
  },
};

export default nextConfig;
