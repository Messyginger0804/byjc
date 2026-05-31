import siteMetadata from '@/utils/metaData';

export const baseMetadata = {
    openGraph: {
        siteName: siteMetadata.title,
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
    },
};

export function createPageMetadata({
    title,
    description,
    keywords,
    url,
    type = 'website',
    ogTitle,
    ogImages,
    publishedTime,
    modifiedTime,
    authors,
}) {
    const metadata = {
        title,
        description,
        keywords,
        openGraph: {
            ...baseMetadata.openGraph,
            title: ogTitle || title,
            description,
            url,
            type,
            ...(publishedTime && { publishedTime }),
            ...(modifiedTime && { modifiedTime }),
            ...(ogImages && { images: ogImages }),
            ...(authors && { authors }),
        },
        twitter: {
            ...baseMetadata.twitter,
            title: ogTitle || title,
            description,
            ...(ogImages && { images: ogImages }),
        },
        alternates: {
            canonical: url,
        },
    };

    return metadata;
}

export function createWebSiteJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteMetadata.title,
        url: siteMetadata.siteUrl,
        description: siteMetadata.description,
        author: {
            '@type': 'Person',
            name: siteMetadata.author,
            url: siteMetadata.siteUrl + '/portfolio',
        },
        potentialAction: {
            '@type': 'SearchAction',
            target: siteMetadata.siteUrl + '/blogs?q={search_term_string}',
            'query-input': 'required name=search_term_string',
        },
    };
}

export function createBlogJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Blogs by JC',
        url: `${siteMetadata.siteUrl}/blogs`,
        description: 'Explore insightful blogs, tech tips, and tutorials brought to you by JC.',
        author: {
            '@type': 'Person',
            name: siteMetadata.author,
            url: siteMetadata.siteUrl + '/portfolio',
        },
        publisher: {
            '@type': 'Person',
            name: siteMetadata.author,
        },
    };
}

export function createContactJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact JC Ashley',
        url: `${siteMetadata.siteUrl}/contact`,
        description: `Contact me through the form or email me at ${siteMetadata.email}`,
        author: {
            '@type': 'Person',
            name: siteMetadata.author,
            url: siteMetadata.siteUrl + '/portfolio',
        },
    };
}

export function createJokesJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Daily Jokes | Software by JC',
        url: `${siteMetadata.siteUrl}/jokes`,
        description: "Get your daily dose of laughter with JC's random jokes. A fun way to start your day!",
        author: {
            '@type': 'Person',
            name: siteMetadata.author,
            url: siteMetadata.siteUrl + '/portfolio',
        },
    };
}
