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
        // Explicitly handle the /api/blog-of-the-month route
        {
          source: "/api/blog-of-the-month",
          destination: "/api/blog-of-the-month", // Ensure this route is not rewritten
        },
        // Rewrite for blogs subdomain
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
        // Rewrite for software subdomain
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
        // Rewrite for about subdomain
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
        // Rewrite for portfolio subdomain - handle root
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "portfolio.byjc.dev",
            },
          ],
          destination: "/portfolio",
        },
        // Rewrite for portfolio subdomain - handle subpaths
        {
          source: "/:path+",
          has: [
            {
              type: "host",
              value: "portfolio.byjc.dev",
            },
          ],
          destination: "/portfolio/:path*",
        },
        // Rewrite for jokes subdomain
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
