import React from 'react';
// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

vi.mock('next/link', () => ({
    default: ({ children, ...props }) => <a {...props}>{children}</a>,
}));
vi.mock('./ThemeToggle', () => ({ default: () => <button type="button">Theme</button> }));

import MobileNav from './MobileNav';

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
});
