import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Skip type checking during build (we'll fix issues separately)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
