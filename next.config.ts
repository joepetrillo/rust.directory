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
  allowedDevOrigins: ["localhost", "10.0.0.32"],
};

export default nextConfig;
