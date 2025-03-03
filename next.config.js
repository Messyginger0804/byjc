const { withContentlayer } = require("next-contentlayer");

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: true,
  },
  images: {
    domains: ["framerusercontent.com"],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: "/api/:path*",
        },
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "blogs.byjc.dev",
            },
          ],
          destination: "/blogs/:path*",
        },
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "software.byjc.dev",
            },
          ],
          destination: "/software/:path*",
        },
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "about.byjc.dev",
            },
          ],
          destination: "/about/:path*",
        },
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "portfolio.byjc.dev",
            },
          ],
          destination: "/portfolio/:path*",
        },
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "jokes.byjc.dev",
            },
          ],
          destination: "/jokes/:path*",
        },
      ],
    };
  },
};

module.exports = withContentlayer(nextConfig);