const siteUrl = process.env.NODE_ENV === 'production'
    ? (process.env.NEXT_PUBLIC_PROD_URL || 'https://www.byjc.dev')
    : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

export default siteUrl;