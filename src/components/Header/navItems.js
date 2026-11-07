// Shared nav definition. Hrefs are built by callers as `${baseUrl}${path}` (baseUrl = siteMetadata.siteUrl).
export const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Blog', path: '/blogs' },
  { label: 'Portfolio', path: '/portfolio' },
];

// Hiring goes to the consultancy; external, so it is kept apart from the in-site paths above.
export const externalNavItem = { label: 'Work with me', href: 'https://dfwsc.com' };

export function isActivePath(pathname, path) {
  if (!pathname) return false;
  return path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);
}
