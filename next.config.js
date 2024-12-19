/** @type {import('next').NextConfig} */


const { withContentlayer } = require("next-contentlayer")
const nextConfig = {
    compiler: {
        removeConsole: true,
        // removeConsole: false,
    }
}

// export default withContentlayer({ nextConfig })
module.exports = withContentlayer({ ...nextConfig })
