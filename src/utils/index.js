
import { compareDesc, parseISO } from "date-fns";

export const cssFunc = (...classNames) => classNames.filter(Boolean).join(' ');

export const sortBlogs = (blogs) => {
    return blogs
        .slice()
        .sort((a, b) =>
            compareDesc(
                parseISO(a.publishedAt || a.published_at),
                parseISO(b.publishedAt || b.published_at)
            )
        )
}