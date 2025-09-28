import siteMetadata from './src/utils/metaData.js';

/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: siteMetadata.siteUrl,
  generateRobotsTxt: true,
};