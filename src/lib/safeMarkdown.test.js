import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { renderSafeMarkdown } from "./safeMarkdown";

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
});
