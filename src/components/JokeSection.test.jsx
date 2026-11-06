import React from 'react';
// @vitest-environment jsdom
import { act, cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Stand-in for next/image: drop its framework-only props and render a plain img.
// eslint-disable-next-line no-unused-vars, @next/next/no-img-element
vi.mock('next/image', () => ({ default: ({ fill, unoptimized, alt = '', ...props }) => <img alt={alt} {...props} /> }));
vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }) => <>{children}</>,
  // eslint-disable-next-line no-unused-vars
  m: { div: ({ initial, animate, transition, ...props }) => <div {...props} /> },
}));

import JokeSection from './JokeSection';

const JOKE = { setup: 'Why did the dev quit?', punchline: 'No arrays.', isOneLiner: false };

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  global.fetch = vi.fn(async () => ({ ok: true, json: async () => JOKE }));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const status = () => screen.getByRole('status');

describe('JokeSection', () => {
  it('fetches a joke, types it out, and announces only the final text in the live region', async () => {
    render(<JokeSection />);
    expect(status().textContent).toBe('');

    await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
    expect(global.fetch).toHaveBeenCalledWith('/api/jokes/random');

    // Mid-typing: nothing announced yet.
    await act(async () => { await vi.advanceTimersByTimeAsync(200); });
    expect(status().textContent).toBe('');

    await act(async () => { await vi.advanceTimersByTimeAsync(JOKE.setup.length * 50 + 100); });
    expect(status().textContent).toBe(JOKE.setup);

    fireEvent.click(screen.getByRole('button', { name: 'See Punchline!' }));
    await act(async () => { await vi.advanceTimersByTimeAsync(JOKE.punchline.length * 50 + 100); });
    expect(status().textContent).toContain(JOKE.punchline);
  });

  it('clears every timer on unmount, mid-typing', async () => {
    const { unmount } = render(<JokeSection />);
    await act(async () => { await vi.advanceTimersByTimeAsync(2300); });
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(5000);
    expect(errors).not.toHaveBeenCalled();
  });

  it('restores a cached joke whose punchline was already shown, without fetching', async () => {
    localStorage.setItem('jc-joke-state', JSON.stringify({ ...JOKE, punchlineShown: true }));
    render(<JokeSection />);
    await act(async () => { await vi.advanceTimersByTimeAsync(2000); });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(status().textContent).toContain(JOKE.setup);
    expect(status().textContent).toContain(JOKE.punchline);
    expect(screen.getByRole('button', { name: 'Get Another Joke!' })).toBeTruthy();
  });
});
