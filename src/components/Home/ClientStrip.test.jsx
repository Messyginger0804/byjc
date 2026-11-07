import React from 'react';
// @vitest-environment jsdom
import { cleanup, createEvent, fireEvent, render, screen } from '@testing-library/react';
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
    expect(screen.getAllByRole('link', { name: /Onix Media/ }).length).toBe(1);
    expect(screen.getAllByText(/Onix Media/).length).toBe(1);
    expect(screen.queryByRole('img', { name: 'Onix Media' })).toBeNull();
    expect(screen.getAllByText(/iServiceWeb/).length).toBe(1);
    const link = screen.getByRole('link', { name: /Onix Media/ });
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(link.textContent).toMatch(/^Onix Media \(opens in a new tab\)/);
  });

  it('shows Craft Digital first as a logo employer tile, followed by clients', () => {
    render(<ClientStrip includeEmployers />);
    const links = screen.getAllByRole('link');
    expect(links[0].getAttribute('href')).toBe('https://www.craftdigital.ai');
    expect(links[0].textContent).not.toMatch(/Employer/);
    expect(links[0].getAttribute('target')).toBe('_blank');
    expect(links[0].getAttribute('rel')).toContain('noopener');
    expect(screen.getByRole('link', { name: /Craft Digital/ }).getAttribute('href')).toBe('https://www.craftdigital.ai');
  });

  it('lists Property Link NYC as a client with a new-tab link and no contact details', () => {
    const { container } = render(<ClientStrip includeEmployers />);
    const link = screen.getByRole('link', { name: /Property Link NYC/ });
    expect(link.getAttribute('href')).toBe('https://www.propertylinknyc.com');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(container.textContent).not.toMatch(/\d{3}[-.\s)]\s?\d{3}[-.]\d{4}/);
  });
});

// jsdom's pointer events drop pointerType/clientX, so set them on the event explicitly.
const move = (el, pointerType, clientX, clientY) => {
  const ev = createEvent.pointerMove(el);
  Object.defineProperties(ev, { pointerType: { value: pointerType }, clientX: { value: clientX }, clientY: { value: clientY } });
  fireEvent(el, ev);
};

describe('ClientStrip tile interactions', () => {
  it('keeps one tile shape: glow/fx layers and a decorative arrow, pointer moves set spotlight vars', () => {
    const { container } = render(<ClientStrip includeEmployers />);
    const link = screen.getAllByRole('link')[0];
    expect(link.querySelector('.brand-glow')).toBeTruthy();
    expect(link.querySelector('.brand-arrow').getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelectorAll('a.brand-tile').length).toBe(screen.getAllByRole('link').length);
    link.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 });
    move(link, 'mouse', 80, 20);
    expect(link.style.getPropertyValue('--mx')).toBe('80px');
    move(link, 'touch', 10, 10);
    expect(link.style.getPropertyValue('--mx')).toBe('80px');
    fireEvent.pointerLeave(link);
  });
});
