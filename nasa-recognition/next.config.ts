import type { NextConfig } from "next";

// Enable bundle analyzer via `ANALYZE=true` env
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  /* config options here */
  
  // Disable React Strict Mode during E2E tests to prevent double-invocation issues
  // Note: This does not disable Fast Refresh/HMR - that's controlled separately
  ...(process.env.PLAYWRIGHT_TEST === 'true' && {
    reactStrictMode: false,
  }),
};

export default withBundleAnalyzer(nextConfig);
