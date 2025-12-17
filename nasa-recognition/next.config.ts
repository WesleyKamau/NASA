import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Disable Fast Refresh during E2E tests to prevent timeouts
  ...(process.env.PLAYWRIGHT_TEST === 'true' && {
    reactStrictMode: false,
  }),
};

export default nextConfig;
