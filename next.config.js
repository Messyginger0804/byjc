import bundleAnalyzer from '@next/bundle-analyzer';
import { contentSecurityPolicy } from './src/lib/contentSecurity.js';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = withBundleAnalyzer({
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  compiler: {
    removeConsole: { exclude: ['error', 'warn'] },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "resume.byjc.dev",
          },
        ],
        destination: "https://byjc.dev/resume/:path*",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          // Preview-only: keep Vercel's injected toolbar (vercel.live feedback.js sets a third-party
          // cookie) out of automated audits. Production is unaffected.
          ...(process.env.VERCEL_ENV === "preview" ? [{ key: "x-vercel-skip-toolbar", value: "1" }] : []),
        ],
      },
      {
        source: "/resume",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
      },
      {
        source: "/resume.pdf",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" }
        ]
      }
    ];
  },
});

export default nextConfig;
