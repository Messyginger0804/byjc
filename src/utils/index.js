
import { compareDesc, parseISO } from "date-fns";

export const cssFunc = (...classNames) => classNames.filter(Boolean).join(' ');

const toComparableDate = (value) => {
    if (!value) return new Date(0);
    if (value instanceof Date) return value;
    if (typeof value === 'string') return parseISO(value);

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date(0) : date;
};

export const sortBlogs = (blogs) => {
    return blogs
        .slice()
        .sort((a, b) =>
            compareDesc(
                toComparableDate(a.publishedAt || a.published_at),
                toComparableDate(b.publishedAt || b.published_at)
            )
        )
}
