import { describe, expect, it } from "vitest";
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
