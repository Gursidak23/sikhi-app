/** @type {import('next').NextConfig} */
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig = {
  // Note: i18n is handled manually in App Router
  // The built-in i18n config only works with Pages Router

  // Strict mode for better development practices
  reactStrictMode: true,

  // Static export for Capacitor Android builds
  ...(isCapacitorBuild && { output: 'export' }),

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.sikhividhya.com',
      },
    ],
    // Must be true for static export; also skip in dev
    unoptimized: isCapacitorBuild || process.env.NODE_ENV === 'development',
  },

  // Experimental features
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['@/components', '@/lib'],
  },

  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Bundle analyzer (enable with ANALYZE=true)
  ...(process.env.ANALYZE === 'true' && {
    webpack(config, { isServer }) {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: '../bundle-report.html',
          })
        );
      }
      return config;
    },
  }),

  // Cache headers and redirects — not supported in static export
  ...(!isCapacitorBuild && {
    async headers() {
      return [
        // Sacred Gurbani content should not be cached
        {
          source: '/gurbani/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, must-revalidate',
            },
          ],
        },
        // Cache static assets
        {
          source: '/static/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
      ];
    },
    async redirects() {
      return [];
    },
  }),
};

module.exports = nextConfig;
