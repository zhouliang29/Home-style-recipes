import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.8.112"],
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  allowedDevOrigins: ["192.168.8.112"],
};

export default nextConfig;
