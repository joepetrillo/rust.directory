import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "cdn.rusthelp.com",
      },
    ],
  },
};

export default nextConfig;
