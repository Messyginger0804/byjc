export const DEFAULT_BLOG_IMAGE = '/blog-images/fadedcomputer.jpg';
export const DEFAULT_BLOG_TAG = 'General';

export function getBlogImage(blog) {
    const image = blog?.image_url || blog?.image?.filePath?.replace('../public', '');
    return typeof image === 'string' && image.trim() ? image.trim() : DEFAULT_BLOG_IMAGE;
}

export function getPrimaryBlogTag(blog) {
    const tag = Array.isArray(blog?.tags)
        ? blog.tags.find((value) => typeof value === 'string' && value.trim())
        : blog?.tags;

    return typeof tag === 'string' && tag.trim() ? tag.trim() : DEFAULT_BLOG_TAG;
}
