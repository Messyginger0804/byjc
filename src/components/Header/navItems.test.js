import { describe, expect, it } from 'vitest';
import { externalNavItem, isActivePath, navItems } from './navItems';

describe('isActivePath', () => {
  it('handles missing pathname', () => {
    expect(isActivePath(undefined, '/')).toBe(false);
    expect(isActivePath('', '/about')).toBe(false);
  });
  it('matches home only exactly', () => {
    expect(isActivePath('/', '/')).toBe(true);
    expect(isActivePath('/about', '/')).toBe(false);
  });
  it('matches exact and nested paths but not prefix lookalikes', () => {
    expect(isActivePath('/blogs', '/blogs')).toBe(true);
    expect(isActivePath('/blogs/my-post', '/blogs')).toBe(true);
    expect(isActivePath('/blogsy', '/blogs')).toBe(false);
  });
  it('exposes unique nav paths', () => {
    expect(new Set(navItems.map((n) => n.path)).size).toBe(navItems.length);
  });
  it('keeps the hire link external and out of the in-site paths', () => {
    expect(externalNavItem.href).toBe('https://dfwsc.com');
    expect(navItems.some((n) => n.path === externalNavItem.href)).toBe(false);
  });
});
