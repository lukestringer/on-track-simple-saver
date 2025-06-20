import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    eslint: {
    // Warning: This bypasses linting errors during builds.
    //TODO remove after fixing linting issues
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
