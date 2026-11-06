import { afterEach, describe, expect, it, vi } from "vitest";
import { contentSecurityPolicy, serializeJsonLd } from "./contentSecurity";

describe("serializeJsonLd", () => {
    it("cannot be terminated with a stored closing script tag", () => {
        const result = serializeJsonLd({ title: "</script><script>alert(1)</script>" });

        expect(result).not.toContain("<");
        expect(result).toContain("\\u003c/script>");
    });
});

describe("contentSecurityPolicy", () => {
    it("blocks plugins, framing, inline handlers, and unexpected base URLs", () => {
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
    });

    it.each(["production", "development", undefined])("does not mention vercel.live when VERCEL_ENV is %s", async (env) => {
        const policy = await load(env);
        expect(policy).not.toContain("vercel.live");
        expect(policy).toContain("frame-src 'none'");
    });
});
