import { afterEach, describe, expect, it, vi } from "vitest";
import { serializeJsonLd } from "./contentSecurity";

describe("serializeJsonLd", () => {
    it("cannot be terminated with a stored closing script tag", () => {
        const result = serializeJsonLd({ title: "</script><script>alert(1)</script>" });

        expect(result).not.toContain("<");
        expect(result).toContain("\\u003c/script>");
    });
});

describe("contentSecurityPolicy", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    it("blocks plugins, framing, inline handlers, and unexpected base URLs", async () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("VERCEL_ENV", "production");
        vi.resetModules();
        const { contentSecurityPolicy } = await import("./contentSecurity");
        expect(contentSecurityPolicy).toContain("upgrade-insecure-requests");
        expect(contentSecurityPolicy).not.toContain("unsafe-eval");
        expect(contentSecurityPolicy).toContain("object-src 'none'");
        expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
        expect(contentSecurityPolicy).toContain("frame-src 'none'");
        expect(contentSecurityPolicy).toContain("script-src-attr 'none'");
        expect(contentSecurityPolicy).toContain("base-uri 'self'");
    });
});

describe("contentSecurityPolicy on Vercel previews", () => {
    const load = async (vercelEnv) => {
        vi.resetModules();
        vi.stubEnv("NODE_ENV", "production");
        if (vercelEnv === undefined) vi.stubEnv("VERCEL_ENV", "");
        else vi.stubEnv("VERCEL_ENV", vercelEnv);
        return (await import("./contentSecurity")).contentSecurityPolicy;
    };

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    it("allows vercel.live only for preview deployments", async () => {
        const policy = await load("preview");
        expect(policy).toContain("script-src 'self' 'unsafe-inline' https://vercel.live");
        expect(policy).toContain("frame-src https://vercel.live");
        expect(policy).toContain("frame-ancestors 'none'");
        expect(policy).toContain("upgrade-insecure-requests");
        expect(policy).not.toContain("unsafe-eval");
    });

    it.each(["production", "development", undefined])("does not mention vercel.live when VERCEL_ENV is %s", async (env) => {
        const policy = await load(env);
        expect(policy).not.toContain("vercel.live");
        expect(policy).toContain("frame-src 'none'");
    });
});
