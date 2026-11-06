import React from 'react';
// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

let mockPath = '/';
vi.mock('next/navigation', () => ({ usePathname: () => mockPath }));
vi.mock('next/link', () => ({ default: ({ children, ...props }) => <a {...props}>{children}</a> }));
vi.mock('motion/react', () => ({
  m: { span: ({ layoutId, ...props }) => <span data-testid="pill" data-layout={layoutId} {...props} /> },
}));

import NavLinks from './NavLinks';

afterEach(cleanup);

describe('NavLinks', () => {
  it('marks the current route and renders the pill only there', () => {
    mockPath = '/blogs/some-post';
    render(<NavLinks baseUrl="https://x.dev" />);
    const blog = screen.getByRole('link', { name: 'Blog' });
    expect(blog.getAttribute('aria-current')).toBe('page');
    expect(blog.getAttribute('href')).toBe('https://x.dev/blogs');
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('aria-current')).toBeNull();
    expect(screen.getAllByTestId('pill')).toHaveLength(1);
  });

  it('defaults baseUrl and handles an unknown route', () => {
    mockPath = '/nope';
    render(<NavLinks />);
    expect(screen.getByRole('link', { name: 'About' }).getAttribute('href')).toBe('/about');
    expect(screen.queryByTestId('pill')).toBeNull();
  });
});
