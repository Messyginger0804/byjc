import { createElement } from "react";
import { serializeJsonLd } from "../lib/contentSecurity.js";

export default function JsonLd({ data }) {
    return createElement("script", {
        type: "application/ld+json",
        dangerouslySetInnerHTML: { __html: serializeJsonLd(data) },
    });
}
