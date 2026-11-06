import React from 'react';
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

let mockPath = '/';
let mockCompact = false;
vi.mock('next/navigation', () => ({ usePathname: () => mockPath }));
vi.mock('next/dynamic', () => ({ default: () => () => <div data-testid="contact-form" /> }));
vi.mock('@/hooks/useScrollDirection', () => ({ useScrollDirection: () => ({ compact: mockCompact }) }));
vi.mock('@/components/Motion/Magnetic', () => ({ default: ({ children }) => <>{children}</> }));
vi.mock('motion/react', () => ({
  // Motion-only props are dropped so they don't reach the DOM.
  // eslint-disable-next-line no-unused-vars
  m: { div: ({ initial, animate, transition, ...props }) => <div {...props} /> },
}));

import FloatingContactButton from './FloatingContactButton';

afterEach(() => {
  cleanup();
  mockPath = '/';
  mockCompact = false;
});

const label = () => screen.getByText('Get in touch').parentElement;

describe('FloatingContactButton', () => {
  it('renders nothing on /contact', () => {
    mockPath = '/contact';
    const { container } = render(<FloatingContactButton />);
    expect(container.firstChild).toBeNull();
  });

  it('is icon-only away from the top of the home page, expanded at the top of home', () => {
    mockPath = '/blogs';
    const { unmount } = render(<FloatingContactButton />);
    expect(label().className).toContain('max-w-0');
    expect(label().className).toContain('group-hover/cta:max-w-48');
    expect(label().className).toContain('group-focus-visible/cta:max-w-48');
    unmount();

    mockPath = '/';
    render(<FloatingContactButton />);
    expect(label().className).toContain('opacity-100');
    expect(label().className).not.toContain('max-w-0');
  });

  it('opens and closes the dialog, and the toggle buttons expose aria-pressed', () => {
    render(<FloatingContactButton />);
    const fab = screen.getByRole('button', { name: 'Get in touch' });
    expect(fab.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(fab);

    expect(screen.getByRole('dialog', { name: 'Contact JC' })).toBeTruthy();
    expect(fab.getAttribute('aria-expanded')).toBe('true');
    const message = screen.getByRole('button', { name: 'Send message' });
    const book = screen.getByRole('button', { name: 'Book time' });
    expect(message.getAttribute('aria-pressed')).toBe('true');
    expect(book.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByTestId('contact-form')).toBeTruthy();

    fireEvent.click(book);
    expect(book.getAttribute('aria-pressed')).toBe('true');
    expect(message.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByText('Open booking page')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Close contact dialog' }));
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(fab);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
