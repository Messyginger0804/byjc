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
        // Rewrite for blogs subdomain
        {
          source: "/:path*", // Capture all paths
          has: [
            {
              type: "host",
              value: "blogs.byjc.dev", // Matches "blogs" subdomain
            },
          ],
          destination: "/blogs/:path*", // Route to blogs page with dynamic path
        },
        // Rewrite for software subdomain
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "software.byjc.dev", // Matches "software" subdomain
            },
          ],
          destination: "/software/:path*", // Route to software page with dynamic path
        },
        // Rewrite for about subdomain
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "about.byjc.dev", // Matches "about" subdomain
            },
          ],
          destination: "/about/:path*", // Route to about page with dynamic path
        },
        // Rewrite for portfolio subdomain
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "portfolio.byjc.dev", // Matches "portfolio" subdomain
            },
          ],
          destination: "/portfolio/:path*", // Route to portfolio page with dynamic path
        },
        // Rewrite for jokes subdomain
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "jokes.byjc.dev", // Matches "jokes" subdomain
            },
          ],
          destination: "/jokes/:path*", // Route to jokes page with dynamic path
        },
      ],
    };
  },
};

module.exports = withContentlayer(nextConfig);
