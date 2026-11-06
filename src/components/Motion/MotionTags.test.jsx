import React from 'react';
// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// A plain `m` (no Proxy) that only knows div and section, to exercise the unknown-tag fallback.
vi.mock('motion/react', () => {
  const make = (Tag) => function Mock({ children, className }) { return <Tag className={className}>{children}</Tag>; };
  return { m: { div: make('div'), section: make('section') } };
});

import { Reveal, Stagger, StaggerItem } from './index';

afterEach(cleanup);

describe('motion wrappers with an unsupported tag', () => {
  it('Reveal renders a supported tag as requested', () => {
    render(<Reveal as="section">s</Reveal>);
    expect(screen.getByText('s').tagName).toBe('SECTION');
  });

  it('Reveal falls back to div for an unsupported tag', () => {
    render(<Reveal as="marquee">x</Reveal>);
    expect(screen.getByText('x').tagName).toBe('DIV');
  });

  it('Stagger and StaggerItem fall back to div for unsupported tags', () => {
    render(<Stagger as="marquee"><StaggerItem as="marquee">kid</StaggerItem></Stagger>);
    expect(screen.getByText('kid').tagName).toBe('DIV');
    expect(screen.getByText('kid').parentElement.tagName).toBe('DIV');
  });
});
