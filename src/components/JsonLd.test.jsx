import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import JsonLd from "./JsonLd";

describe("JsonLd", () => {
    it("cannot be terminated by category or other user-controlled values", () => {
        const category = '</script><script id="category-xss">alert(1)</script>';
        const userValue = '</script><img src=x onerror="alert(2)">';

        const html = renderToStaticMarkup(
            <JsonLd data={{ name: category, description: userValue }} />,
        );

        expect(html.match(/<script/g)).toHaveLength(1);
        expect(html).not.toContain('<script id="category-xss">');
        expect(html).not.toContain("<img");
        expect(html).toContain("\\u003c/script>");
        expect(html).toContain("\\u003cimg");
    });
});
