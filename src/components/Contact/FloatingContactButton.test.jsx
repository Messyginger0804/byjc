import React from 'react';
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

let mockPath = '/';
let mockCompact = false;
vi.mock('next/navigation', () => ({ usePathname: () => mockPath }));
const dynamicOptions = vi.hoisted(() => ({ current: null }));
vi.mock('next/dynamic', () => ({
  default: (_loader, options) => {
    dynamicOptions.current = options;
    return () => <div data-testid="contact-form" />;
  },
}));
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

    mockCompact = true;
    cleanup();
    render(<FloatingContactButton />);
    expect(label().className).toContain('max-w-0');
    expect(label().className).toContain('opacity-0');
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

  it('renders a skeleton placeholder while the contact form chunk loads', () => {
    const { container } = render(<>{dynamicOptions.current.loading()}</>);
    expect(container.querySelectorAll('.animate-pulse > div')).toHaveLength(5);
  });

  it('"Send a message instead" switches back to the form', () => {
    render(<FloatingContactButton />);
    fireEvent.click(screen.getByRole('button', { name: 'Get in touch' }));
    fireEvent.click(screen.getByRole('button', { name: 'Book time' }));
    expect(screen.queryByTestId('contact-form')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Send a message instead' }));
    expect(screen.getByTestId('contact-form')).toBeTruthy();
  });

  it('focuses the close button, wraps Tab focus inside the dialog, and restores focus on close', () => {
    render(<FloatingContactButton />);
    const fab = screen.getByRole('button', { name: 'Get in touch' });
    fab.focus();
    fireEvent.click(fab);
    const close = screen.getByRole('button', { name: 'Close contact dialog' });
    expect(document.activeElement).toBe(close);

    const dialog = screen.getByRole('dialog');
    const focusable = Array.from(dialog.querySelectorAll('a[href], button:not([disabled])'));
    focusable[focusable.length - 1].focus();
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    act(() => { window.dispatchEvent(tab); });
    expect(tab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(focusable[0]);
    expect(screen.getByRole('dialog')).toBeTruthy();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(document.activeElement).toBe(fab);
  });

  it('closes when the backdrop is clicked but not when the dialog body is clicked', () => {
    render(<FloatingContactButton />);
    fireEvent.click(screen.getByRole('button', { name: 'Get in touch' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(dialog.parentElement);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps the dialog open on /contact once opened, and locks then restores body scroll', () => {
    document.body.style.overflow = 'scroll';
    render(<FloatingContactButton />);
    fireEvent.click(screen.getByRole('button', { name: 'Get in touch' }));
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(document.body.style.overflow).toBe('scroll');
    document.body.style.overflow = '';
  });
});
