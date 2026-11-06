import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { renderSafeMarkdown, safeMarkdownUrl } from "./safeMarkdown";

async function render(markdown) {
    return renderToStaticMarkup(await renderSafeMarkdown(markdown));
}

describe("safe Markdown rendering", () => {
    it("drops script tags and their executable markup", async () => {
        const html = await render("Before<script>alert('xss')</script>After");

        expect(html).not.toContain("<script");
        expect(html).not.toContain("alert('xss')");
    });

    it("renders MDX expressions as inert text", async () => {
        const html = await render("{globalThis.__pwned = true}");

        expect(html).toContain("globalThis.__pwned = true");
        expect(globalThis.__pwned).toBeUndefined();
    });

    it("drops raw HTML with inline event handlers", async () => {
        const html = await render('<img src="x" onerror="alert(1)">');

        expect(html).not.toContain("onerror");
        expect(html).not.toContain("<img");
    });

    it("removes javascript URLs from links and images", async () => {
        const html = await render("[click](javascript:alert(1))\n\n![image](javascript:alert(2))");

        expect(html).not.toMatch(/(?:href|src)="javascript:/i);
        expect(html).not.toContain("javascript:");
    });

    it("keeps ordinary GFM and highlighted code content", async () => {
        const html = await render("# Heading\n\n```js\nconst safe = true;\n```\n\n| A | B |\n| - | - |\n| 1 | 2 |");

        expect(html).toContain('id="heading"');
        expect(html.replace(/<[^>]+>/g, "")).toContain("const safe = true;");
        expect(html).toContain("<table>");
    });

    it("preserves GFM footnote references and definitions", async () => {
        const html = await render("Text[^1]\n\n[^1]: The note.");

        expect(html).toContain("<sup>");
        expect(html).toContain('href="#user-content-fn-1"');
        expect(html).toContain('id="user-content-fn-1"');
        expect(html).toContain("The note.");
    });

    it("rejects protocol-relative links and images but keeps relative, https and mailto links", async () => {
        const html = await render("[a](//evil.test/x) [b](/local) [c](https://ok.test/) [d](mailto:a@b.test)\n\n![i](//evil.test/i.png)");

        expect(html).not.toContain("evil.test");
        expect(html).toContain('href="/local"');
        expect(html).toContain('href="https://ok.test/"');
        expect(html).toContain('href="mailto:a@b.test"');
    });
});

describe("safeMarkdownUrl", () => {
    it("allows mailto for links but not for image sources", () => {
        expect(safeMarkdownUrl("mailto:a@b.test", "href")).toBe("mailto:a@b.test");
        expect(safeMarkdownUrl("mailto:a@b.test", "src")).toBeNull();
    });

    it("rejects protocol-relative, backslash and scripting URLs", () => {
        expect(safeMarkdownUrl("//evil.test", "href")).toBeNull();
        expect(safeMarkdownUrl("\\\\evil.test", "src")).toBeNull();
        expect(safeMarkdownUrl(" java\tscript:alert(1)", "href")).toBeNull();
        expect(safeMarkdownUrl("/relative", "src")).toBe("/relative");
    });
});
