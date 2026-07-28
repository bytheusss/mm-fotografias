import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "azgbacvirqxppqjbepjq.supabase.co",
      },
    ],
  },
};

export default nextConfig;
