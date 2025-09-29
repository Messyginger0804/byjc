const { withContentlayer } = require("next-contentlayer");

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: true,
  },
  images: {
    domains: ["framerusercontent.com"],
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
            value: "software.byjc.dev",
          },
        ],
        destination: "https://byjc.dev/software/:path*",
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
            value: "jokes.byjc.dev",
          },
        ],
        destination: "https://byjc.dev/jokes/:path*",
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
  }
};

module.exports = withContentlayer(nextConfig);
