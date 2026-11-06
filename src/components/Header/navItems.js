// Shared nav definition. Hrefs are built by callers as `${baseUrl}${path}` (baseUrl = siteMetadata.siteUrl).
export const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Blog', path: '/blogs' },
  { label: 'Portfolio', path: '/portfolio' },
];

export function isActivePath(pathname, path) {
  if (!pathname) return false;
  return path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);
}
