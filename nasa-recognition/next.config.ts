import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Disable React Strict Mode during E2E tests to prevent double-invocation issues
  // Note: This does not disable Fast Refresh/HMR - that's controlled separately
  ...(process.env.PLAYWRIGHT_TEST === 'true' && {
    reactStrictMode: false,
  }),
};

export default nextConfig;
