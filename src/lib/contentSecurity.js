const isDevelopment = process.env.NODE_ENV === "development";

// Next.js 16 nonces require per-request dynamic rendering, disabling static
// generation, ISR, CDN caching, and Partial Prerendering. Build-time SRI does
// not cover route-specific inline JSON-LD either. Keep inline script elements
// compatible with static rendering, but prohibit inline script attributes and
// make every application-owned inline payload pass through serializeJsonLd.
export const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.emailjs.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
].join("; ");

export function serializeJsonLd(value) {
    return JSON.stringify(value).replaceAll("<", "\\u003c");
}
