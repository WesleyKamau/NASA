import type { NextConfig } from "next";

// Enable bundle analyzer via `ANALYZE=true` env
 
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Image optimization: serve modern formats at appropriate sizes
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Disable React Strict Mode during E2E tests to prevent double-invocation issues
  // Note: This does not disable Fast Refresh/HMR - that's controlled separately
  ...(process.env.PLAYWRIGHT_TEST === 'true' && {
    reactStrictMode: false,
  }),
};

export default withBundleAnalyzer(nextConfig);
