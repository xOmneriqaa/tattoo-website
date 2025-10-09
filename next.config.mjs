/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Increase cache TTL for better performance (1 year for immutable assets)
    minimumCacheTTL: 31536000,
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Optimize package imports for better tree shaking
  experimental: {
    optimizePackageImports: ['three'],
  },
}

// Only apply bundle analyzer in production when explicitly enabled
// This avoids webpack/turbopack conflicts during development
let config = nextConfig;

if (process.env.ANALYZE === 'true') {
  const bundleAnalyzer = (await import('@next/bundle-analyzer')).default;
  const withBundleAnalyzer = bundleAnalyzer({
    enabled: true,
    openAnalyzer: true,
  });
  config = withBundleAnalyzer(nextConfig);
}

export default config;
