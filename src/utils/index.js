
import { compareDesc } from "date-fns";

export const cssFunc = (...classNames) => classNames.filter(Boolean).join(' ');

export const sortBlogs = (blogs) => {
    return blogs
        .slice()
        .sort((a, b) =>
            compareDesc(
                new Date(a.publishedAt || a.published_at),
                new Date(b.publishedAt || b.published_at)
            )
        )
}
