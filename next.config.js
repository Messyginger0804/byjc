const { withContentlayer } = require("next-contentlayer");

/** @type {import('next').NextConfig} */
const nextConfig = {
    compiler: {
        removeConsole: true,
    },
    images: {
        domains: ["framerusercontent.com"],
    },
};

module.exports = withContentlayer({ ...nextConfig });
