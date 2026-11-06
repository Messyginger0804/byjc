import React from 'react';
// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import ClientStrip from './ClientStrip';

beforeEach(() => {
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} };
});
afterEach(cleanup);

describe('ClientStrip', () => {
  it('renders clients with default heading, no employers, no phone numbers', () => {
    const { container } = render(<ClientStrip />);
    expect(screen.getByText(/built for/)).toBeTruthy();
    expect(screen.getByText(/JLD Counseling/)).toBeTruthy();
    expect(screen.queryByText(/Onix Media/)).toBeNull();
    expect(container.textContent).not.toMatch(/\d{3}[-.\s)]\s?\d{3}[-.]\d{4}/);
  });

  it('supports a custom heading and employers, deduped, opening in new tabs', () => {
    render(<ClientStrip heading="Worked with" includeEmployers />);
    expect(screen.getByText('Worked with')).toBeTruthy();
    expect(screen.getAllByText(/Onix Media/).length).toBe(1);
    expect(screen.getAllByText(/iServiceWeb/).length).toBe(1);
    const link = screen.getByRole('link', { name: /Onix Media/ });
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });
});
