import React from 'react';
// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

let mockPath = '/';
vi.mock('next/navigation', () => ({ usePathname: () => mockPath }));
vi.mock('next/link', () => ({
    default: ({ children, onClick, ...props }) => (
        <a {...props} onClick={(e) => { e.preventDefault(); onClick?.(e); }}>{children}</a>
    ),
}));
vi.mock('./ThemeToggle', () => ({ default: () => <button type="button">Theme</button> }));
vi.mock('../Socials/Index', () => ({ default: () => <ul><li>Socials</li></ul> }));

import MobileNav from './MobileNav';

afterEach(() => {
    cleanup();
    mockPath = '/';
    document.body.style.overflow = '';
});

describe('MobileNav', () => {
    it('does not render focusable navigation content while closed', () => {
        render(<MobileNav />);

        expect(screen.getByRole('button', { name: 'Hamburger Menu' }).getAttribute('aria-expanded')).toBe('false');
        expect(screen.queryByRole('navigation')).toBeNull();
    });

    it('exposes an accessible navigation landmark when opened', async () => {
        const { container } = render(<MobileNav />);
        fireEvent.click(screen.getByRole('button', { name: 'Hamburger Menu' }));

        expect(screen.getByRole('navigation')).toBeTruthy();
        // jsdom has no canvas implementation, so color contrast belongs in browser CI.
        expect((await axe(container, { rules: { 'color-contrast': { enabled: false } } })).violations).toEqual([]);
    });

    it('has no axe violations in the portaled open overlay', async () => {
        render(<MobileNav />);
        fireEvent.click(screen.getByRole('button', { name: 'Hamburger Menu' }));
        const dialog = screen.getByRole('dialog', { name: 'Site menu' });
        expect(dialog.parentElement).toBe(document.body);
        const results = await axe(document.body, { rules: { 'color-contrast': { enabled: false } } });
        expect(results.violations).toEqual([]);
    });

    it('locks body scroll when open and restores it on close', () => {
        document.body.style.overflow = 'auto';
        render(<MobileNav />);
        const toggle = screen.getByRole('button', { name: 'Hamburger Menu' });
        fireEvent.click(toggle);
        expect(toggle.getAttribute('aria-expanded')).toBe('true');
        expect(document.body.style.overflow).toBe('hidden');
        fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));
        expect(document.body.style.overflow).toBe('auto');
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });

    it('closes on Escape and returns focus to the toggle', () => {
        render(<MobileNav />);
        const toggle = screen.getByRole('button', { name: 'Hamburger Menu' });
        fireEvent.click(toggle);
        act(() => {
            fireEvent.keyDown(window, { key: 'Escape' });
        });
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
        expect(document.body.style.overflow).toBe('');
        expect(document.activeElement).toBe(toggle);
    });

    it('routes non-Escape keys to the focus trap without closing', () => {
        render(<MobileNav />);
        const toggle = screen.getByRole('button', { name: 'Hamburger Menu' });
        fireEvent.click(toggle);
        fireEvent.keyDown(window, { key: 'Tab' });
        expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });

    it('closes when a link is clicked, uses baseUrl, and focuses the first link on open', () => {
        mockPath = '/about';
        render(<MobileNav baseUrl="https://x.dev" />);
        const toggle = screen.getByRole('button', { name: 'Hamburger Menu' });
        fireEvent.click(toggle);
        expect(document.activeElement.textContent).toBe('Home');
        expect(screen.getByRole('link', { name: 'About' }).getAttribute('aria-current')).toBe('page');
        expect(screen.getByRole('link', { name: 'Home' }).getAttribute('aria-current')).toBeNull();
        const blog = screen.getByRole('link', { name: 'Blog' });
        expect(blog.getAttribute('href')).toBe('https://x.dev/blogs');
        fireEvent.click(blog);
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });

    it('toggle button closes an open menu', () => {
        render(<MobileNav />);
        const toggle = screen.getByRole('button', { name: 'Hamburger Menu' });
        fireEvent.click(toggle);
        fireEvent.click(toggle);
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });
});
