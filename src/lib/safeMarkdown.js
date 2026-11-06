import { MarkdownAsync } from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

const allowedElements = [
    "a", "blockquote", "br", "code", "del", "em", "h1", "h2", "h3", "h4", "h5", "h6",
    "figcaption", "figure", "hr", "img", "input", "li", "ol", "p", "pre", "span", "strong",
    "table", "tbody", "td", "th", "thead", "tr", "ul",
];

const codeOptions = { theme: "github-dark", grid: false };

export function safeMarkdownUrl(url, key) {
    const value = url.trim();
    const compact = value.replace(/[\u0000-\u0020]/g, "");
    const scheme = compact.match(/^([a-z][a-z\d+.-]*):/i)?.[1]?.toLowerCase();

    if (!scheme) {
        return compact.startsWith("//") || compact.startsWith("\\\\") ? null : value;
    }

    const allowedSchemes = key === "src" ? ["http", "https"] : ["http", "https", "mailto"];
    return allowedSchemes.includes(scheme) ? value : null;
}

export function renderSafeMarkdown(source, components) {
    return MarkdownAsync({
        allowedElements,
        children: source,
        components,
        rehypePlugins: [
            rehypeSanitize,
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "append" }],
            [rehypePrettyCode, codeOptions],
        ],
        remarkPlugins: [remarkGfm],
        skipHtml: true,
        urlTransform: safeMarkdownUrl,
    });
}
