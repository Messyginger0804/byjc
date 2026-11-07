import React from 'react';
// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/Motion', () => {
  const Pass = ({ as: As = 'div', children, className }) => <As className={className}>{children}</As>;
  return { Reveal: Pass, Stagger: Pass, StaggerItem: Pass, Magnetic: Pass };
});
// eslint-disable-next-line @next/next/no-img-element
vi.mock('next/image', () => ({ default: ({ alt }) => <img alt={alt} /> }));
vi.mock('./ServicesBento', () => ({ default: () => <div data-testid="bento" /> }));

import Story from './Story';
import Stack from './Stack';
import Hire from './Hire';
import SayHi from './SayHi';
import OffTheClock from './OffTheClock';
import Testimonials from './Testimonials';

beforeEach(() => {
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} };
});
afterEach(cleanup);

describe('home sections', () => {
  it('Story renders its labelled beats and links to the full story', () => {
    render(<Story />);
    expect(screen.getByRole('heading', { level: 2, name: /service floor/ })).toBeTruthy();
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(6);
    expect(screen.getByRole('link', { name: /full story/ }).getAttribute('href')).toBe('/about');
  });

  it('Stack renders each tool group', () => {
    render(<Stack />);
    for (const g of ['Frontend', 'Backend', 'DevOps', 'AI', 'Testing', 'Tools']) {
      expect(screen.getByRole('heading', { level: 3, name: g })).toBeTruthy();
    }
    expect(screen.getByText('React')).toBeTruthy();
    expect(screen.getByText('Cloudflare')).toBeTruthy();
  });

  it('Hire attributes every stat to the role it came from', () => {
    render(<Hire />);
    expect(screen.getByRole('heading', { level: 2, name: /DFW Software Consulting/ })).toBeTruthy();
    const stats = screen.getAllByRole('definition');
    expect(stats.length).toBe(3);
    const text = stats.map((s) => s.textContent).join('|');
    expect(text).toMatch(/hosting costs.*At DFW Software Consulting/);
    expect(text).toMatch(/Lighthouse.*At Onix Media/);
    expect(text).toMatch(/interns.*At iServiceWeb/);
    expect(screen.getByTestId('bento')).toBeTruthy();
  });

  it('SayHi renders contact channels', () => {
    render(<SayHi />);
    expect(screen.getByRole('link', { name: /LinkedIn/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /GitHub/ })).toBeTruthy();
  });

  it('OffTheClock and Testimonials render a labelled section', () => {
    const { container } = render(<><OffTheClock /><Testimonials /></>);
    expect(container.querySelectorAll('section[aria-labelledby]').length).toBe(2);
  });
});
