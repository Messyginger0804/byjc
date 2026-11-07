import { getBlogImage, getPrimaryBlogTag } from '@/lib/blogPresentation'

export function getBlogCardData(blog) {
    return {
        imgSrc: getBlogImage(blog),
        primaryTag: getPrimaryBlogTag(blog),
        blogUrl: `/blogs/${blog.slug}`,
        publishedAt: blog.publishedAt || blog.published_at,
    };
}
