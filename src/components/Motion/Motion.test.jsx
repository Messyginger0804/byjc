import React from 'react';
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LazyMotion, domAnimation } from 'motion/react';
import { Magnetic, Reveal, ScrollProgress, Stagger, StaggerItem, TiltCard } from './index';

const stubEnv = ({ fine = true, reduced = false } = {}) => {
  window.matchMedia = (q) => ({
    matches: q.includes('prefers-reduced-motion') ? reduced : fine,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
};

beforeEach(() => {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.ResizeObserver = window.IntersectionObserver;
  stubEnv();
});
afterEach(cleanup);

const wrap = (ui) => <LazyMotion features={domAnimation}>{ui}</LazyMotion>;

describe('Reveal / Stagger', () => {
  it('Reveal renders children in the requested tag and defaults to div', () => {
    const { container } = render(wrap(<><Reveal as="section" className="c">hi</Reveal><Reveal>yo</Reveal></>));
    expect(container.querySelector('section.c').textContent).toBe('hi');
    expect(screen.getByText('yo').tagName).toBe('DIV');
  });

  it('marks hidden-initial elements with data-motion-hidden for the no-JS / failure overrides', () => {
    const { container } = render(
      wrap(
        <>
          <Reveal>r</Reveal>
          <Stagger><StaggerItem>i</StaggerItem></Stagger>
        </>,
      ),
    );
    expect(container.querySelectorAll('[data-motion-hidden]').length).toBe(3);
  });

  it('Stagger and StaggerItem render nested children', () => {
    const { container } = render(
      wrap(
        <Stagger as="ul" stagger={0.1} delay={0.2}>
          <StaggerItem as="li" y={10}>a</StaggerItem>
          <StaggerItem>b</StaggerItem>
        </Stagger>,
      ),
    );
    expect(container.querySelector('ul li').textContent).toBe('a');
    expect(screen.getByText('b')).toBeTruthy();
  });
});

describe('Magnetic', () => {
  it('is a plain wrapper with reduced motion', () => {
    stubEnv({ reduced: true });
    const { container } = render(wrap(<Magnetic className="k"><b>x</b></Magnetic>));
    expect(container.firstChild.className).toContain('inline-block k');
    fireEvent.pointerMove(container.firstChild);
    expect(screen.getByText('x')).toBeTruthy();
  });

  it('is a plain wrapper on coarse pointers, without className', () => {
    stubEnv({ fine: false });
    const { container } = render(wrap(<Magnetic>x</Magnetic>));
    expect(container.firstChild.className.trim()).toBe('inline-block');
  });

  it('handles pointer move/leave when enabled', () => {
    const { container } = render(wrap(<Magnetic strength={0.5}>x</Magnetic>));
    const el = container.firstChild;
    el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 });
    fireEvent.pointerMove(el, { clientX: 80, clientY: 20 });
    fireEvent.pointerLeave(el);
    expect(screen.getByText('x')).toBeTruthy();
  });
});

describe('TiltCard', () => {
  it('keeps the same DOM shape when disabled', () => {
    stubEnv({ reduced: true });
    const { container } = render(wrap(<TiltCard className="card">kid</TiltCard>));
    expect(container.firstChild.className).toBe('card');
    expect(container.firstChild.firstChild.style.transform).toBe('');
    expect(container.querySelector('span[aria-hidden]')).toBeTruthy();
  });

  it('adds glare and handles pointer events when enabled', () => {
    const { container } = render(wrap(<TiltCard max={10}>kid</TiltCard>));
    expect(container.querySelector('span[aria-hidden="true"]')).toBeTruthy();
    const card = screen.getByText('kid');
    card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 });
    fireEvent.pointerMove(card, { clientX: 50, clientY: 50 });
    fireEvent.pointerLeave(card);
    expect(card).toBeTruthy();
  });

  it('works without className when enabled', () => {
    render(wrap(<TiltCard>kid</TiltCard>));
    expect(screen.getByText('kid').className).toContain('relative');
  });
});

describe('ScrollProgress', () => {
  it('renders a decorative bar with extra classes', () => {
    const { container } = render(wrap(<ScrollProgress className="h-1" />));
    const bar = container.firstChild;
    expect(bar.getAttribute('aria-hidden')).toBe('true');
    expect(bar.className).toContain('h-1');
  });
  it('renders with default className', () => {
    const { container } = render(wrap(<ScrollProgress />));
    expect(container.firstChild).toBeTruthy();
  });
});

describe('fallbacks and reduced motion', () => {
  it('ScrollProgress renders with reduced motion (unsprung progress)', () => {
    stubEnv({ reduced: true });
    const { container } = render(wrap(<ScrollProgress />));
    expect(container.firstChild.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('MotionProvider', () => {
  it('loads the real feature bundle without flagging <html> on success', async () => {
    vi.resetModules();
    let loader;
    vi.doMock('motion/react', async (orig) => ({
      ...(await orig()),
      LazyMotion: ({ features, children }) => {
        loader = features;
        return children;
      },
    }));
    const { default: Provider } = await import('./MotionProvider');
    render(<Provider>ok</Provider>);
    const features = await loader();
    expect(features).toBeTruthy();
    expect(features).not.toEqual({});
    expect(document.documentElement.classList.contains('motion-failed')).toBe(false);
    vi.doUnmock('motion/react');
  });

  it('flags <html> so hidden content is revealed when the feature chunk fails', async () => {
    vi.resetModules();
    vi.doMock('./features', () => {
      throw new Error('chunk failed');
    });
    const { LazyMotion: LM } = await import('motion/react');
    let loader;
    vi.doMock('motion/react', async (orig) => ({
      ...(await orig()),
      LazyMotion: ({ features, children }) => {
        loader = features;
        return children;
      },
    }));
    const { default: Provider } = await import('./MotionProvider');
    expect(LM).toBeTruthy();
    render(<Provider>x</Provider>);
    const result = await loader();
    expect(result).toEqual({});
    expect(document.documentElement.classList.contains('motion-failed')).toBe(true);
    document.documentElement.classList.remove('motion-failed');
    vi.doUnmock('./features');
    vi.doUnmock('motion/react');
  });
});
