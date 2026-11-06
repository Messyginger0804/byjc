import React from 'react';
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Footer from './Index';

beforeEach(() => {
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} };
  window.scrollTo = vi.fn();
});
afterEach(cleanup);

describe('Footer', () => {
  it('links to DFWSC in a new tab with an accessible label', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: /Visit DFWSC/ });
    expect(link.getAttribute('href')).toBe('https://dfwsc.com');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(link.textContent).toContain('(opens in a new tab)');
  });

  it('scrolls to top smoothly, or instantly with reduced motion', () => {
    render(<Footer />);
    fireEvent.click(screen.getByRole('button', { name: /Back to top/ }));
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'smooth' });
    window.matchMedia = () => ({ matches: true });
    fireEvent.click(screen.getByRole('button', { name: /Back to top/ }));
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'auto' });
  });
});
