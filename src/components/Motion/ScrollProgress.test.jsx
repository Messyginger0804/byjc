import React from 'react';
// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

let mockReduce = false;
const progress = { id: 'raw-progress' };
const spring = { id: 'sprung-progress' };
const seenStyle = vi.hoisted(() => ({ current: null }));

vi.mock('motion/react', () => ({
  useScroll: () => ({ scrollYProgress: progress }),
  useSpring: () => spring,
  useReducedMotion: () => mockReduce,
  m: { div: ({ style, ...props }) => { seenStyle.current = style; return <div {...props} />; } },
}));

import ScrollProgress from './ScrollProgress';

afterEach(() => { cleanup(); mockReduce = false; });

describe('ScrollProgress', () => {
  it('drives the bar with the sprung progress by default', () => {
    render(<ScrollProgress />);
    expect(seenStyle.current.scaleX).toBe(spring);
  });

  it('drives the bar directly (no spring smoothing) with reduced motion', () => {
    mockReduce = true;
    render(<ScrollProgress />);
    expect(seenStyle.current.scaleX).toBe(progress);
  });
});
