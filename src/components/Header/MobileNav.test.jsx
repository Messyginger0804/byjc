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

    it('wraps focus with Tab from the last control and Shift+Tab from the first, without closing', () => {
        render(<MobileNav />);
        const toggle = screen.getByRole('button', { name: 'Hamburger Menu' });
        fireEvent.click(toggle);
        const dialog = screen.getByRole('dialog', { name: 'Site menu' });
        const focusable = Array.from(dialog.querySelectorAll('a[href], button:not([disabled])'));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        expect(first).not.toBe(last);

        last.focus();
        const forward = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        act(() => { window.dispatchEvent(forward); });
        expect(forward.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(first);

        const backward = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
        act(() => { window.dispatchEvent(backward); });
        expect(backward.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(last);
        expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });

    it('closes when the route changes while open', () => {
        const { rerender } = render(<MobileNav />);
        const toggle = screen.getByRole('button', { name: 'Hamburger Menu' });
        fireEvent.click(toggle);
        expect(toggle.getAttribute('aria-expanded')).toBe('true');
        mockPath = '/about';
        rerender(<MobileNav />);
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
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

    it('lists Work with me as an external link to DFWSC in the open menu', () => {
        render(<MobileNav />);
        fireEvent.click(screen.getByRole('button', { name: 'Hamburger Menu' }));
        const link = screen.getByRole('link', { name: /Work with me/ });
        expect(link.getAttribute('href')).toBe('https://dfwsc.com');
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.textContent).toContain('opens in a new tab');
    });
});
