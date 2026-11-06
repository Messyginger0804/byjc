const isDevelopment = process.env.NODE_ENV === "development";

// Next.js 16 nonces require per-request dynamic rendering, disabling static
// generation, ISR, CDN caching, and Partial Prerendering. Build-time SRI does
// not cover route-specific inline JSON-LD either. Keep inline script elements
// compatible with static rendering, but prohibit inline script attributes and
// make every application-owned inline payload pass through serializeJsonLd.
// The Vercel preview toolbar loads from vercel.live; allow it on preview deployments only.
const isVercelPreview = process.env.VERCEL_ENV === "preview";

export const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}${isVercelPreview ? " https://vercel.live" : ""}`,
    "script-src-attr 'none'",
    `style-src 'self' 'unsafe-inline'${isVercelPreview ? " https://vercel.live" : ""}`,
    "img-src 'self' data: blob: https:",
    `font-src 'self' data:${isVercelPreview ? " https://vercel.live https://assets.vercel.com" : ""}`,
    `connect-src 'self' https://api.emailjs.com${isVercelPreview ? " https://vercel.live wss://ws-us3.pusher.com https://*.pusher.com" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    isVercelPreview ? "frame-src https://vercel.live" : "frame-src 'none'",
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
].join("; ");

export function serializeJsonLd(value) {
    return JSON.stringify(value).replaceAll("<", "\\u003c");
}
