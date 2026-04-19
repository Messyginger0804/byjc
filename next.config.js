import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = withBundleAnalyzer({
  compiler: {
    removeConsole: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['react-material-ui-carousel', 'framer-motion'],
  experimental: {
    optimizePackageImports: ['react-material-ui-carousel', 'framer-motion', '@lottiefiles/dotlottie-react'],
  },
  async redirects() {
    return [
      // Redirect portfolio subdomain to main site
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "portfolio.byjc.dev",
          },
        ],
        destination: "https://byjc.dev/portfolio/:path*",
        permanent: false,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "blogs.byjc.dev",
          },
        ],
        destination: "https://byjc.dev/blogs/:path*",
        permanent: false,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "about.byjc.dev",
          },
        ],
        destination: "https://byjc.dev/about/:path*",
        permanent: false,
      },
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
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "jokes.byjc.dev",
          },
        ],
        destination: "https://chromewebstore.google.com/detail/fplggjklhidneilngfdodbbpkapamcld?utm_source=item-share-cb",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "software.byjc.dev",
          },
        ],
        destination: "https://byjc.dev/:path*",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
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
