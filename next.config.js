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
            {
                source: '/',
                has: [
                    { type: 'host', value: 'linkedin.byjc.dev' }
                ],
                destination: 'https://www.linkedin.com/in/your-profile/',
                permanent: true,
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/',
                has: [
                    { type: 'host', value: 'blogs.byjc.dev' }
                ],
                destination: '/blogs',
            },
            {
                source: '/',
                has: [
                    { type: 'host', value: 'software.byjc.dev' }
                ],
                destination: '/software',
            },
            {
                source: '/',
                has: [
                    { type: 'host', value: 'about.byjc.dev' }
                ],
                destination: '/about',
            },
            {
                source: '/',
                has: [
                    { type: 'host', value: 'portfolio.byjc.dev' }
                ],
                destination: '/portfolio',
            },
            {
                source: '/',
                has: [
                    { type: 'host', value: 'jokes.byjc.dev' }
                ],
                destination: '/jokes',
            },
        ];
    },
};

module.exports = withContentlayer({ ...nextConfig });
