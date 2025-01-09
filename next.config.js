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
        // Rewrite for subdomains
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "blogs.byjc.dev", // Matches "blogs" subdomain
            },
          ],
          destination: "/blogs",
        },
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "software.byjc.dev", // Matches "software" subdomain
            },
          ],
          destination: "/software",
        },
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "about.byjc.dev", // Matches "about" subdomain
            },
          ],
          destination: "/about",
        },
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "portfolio.byjc.dev", // Matches "portfolio" subdomain
            },
          ],
          destination: "/portfolio",
        },
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "jokes.byjc.dev", // Matches "jokes" subdomain
            },
          ],
          destination: "/jokes",
        },
      ],
    };
  },
};

module.exports = withContentlayer(nextConfig);
