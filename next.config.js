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
        // Rewrite for "blogs.byjc.dev"
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "blogs.byjc.dev", // Matches this specific subdomain
            },
          ],
          destination: "/blogs", // Route the user to the blogs page
        },
        // Rewrite for "software.byjc.dev"
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "software.byjc.dev",
            },
          ],
          destination: "/software", // Route the user to the software page
        },
        // Rewrite for "about.byjc.dev"
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "about.byjc.dev",
            },
          ],
          destination: "/about", // Route the user to the about page
        },
        // Rewrite for "portfolio.byjc.dev"
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "portfolio.byjc.dev",
            },
          ],
          destination: "/portfolio", // Route the user to the portfolio page
        },
        // Rewrite for "jokes.byjc.dev"
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "jokes.byjc.dev",
            },
          ],
          destination: "/jokes", // Route the user to the jokes page
        },
      ],
    };
  },
};

module.exports = withContentlayer(nextConfig);
