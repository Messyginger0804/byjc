import React from 'react';
// @vitest-environment jsdom
import { act, cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// eslint-disable-next-line no-unused-vars, @next/next/no-img-element
vi.mock('next/image', () => ({ default: ({ fill, unoptimized, alt = '', ...props }) => <img alt={alt} {...props} /> }));
vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }) => <>{children}</>,
  // eslint-disable-next-line no-unused-vars
  m: { div: ({ initial, animate, transition, ...props }) => <div {...props} /> },
}));

import JokeSection from './JokeSection';

const JOKE = { setup: 'Why did the dev quit?', punchline: 'No arrays.', isOneLiner: false };
const KEY = 'jc-joke-state';

let reduced;
const mockFetch = (impl) => { global.fetch = vi.fn(impl); };
const okJoke = (joke) => async () => ({ ok: true, json: async () => joke });
const tick = (ms) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
const typed = (text) => text.length * 50 + 100;

beforeEach(() => {
  reduced = false;
  vi.useFakeTimers();
  localStorage.clear();
  window.matchMedia = (q) => ({ matches: q.includes('reduced-motion') ? reduced : false, addEventListener() {}, removeEventListener() {} });
  mockFetch(okJoke(JOKE));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('JokeSection states', () => {
  it('shows the thinking state first and lets the visitor skip the wait by clicking the avatar', async () => {
    render(<JokeSection />);
    expect(screen.getByText('Click me to tell you a joke...')).toBeTruthy();
    expect(global.fetch).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Tell me a joke' }));
    await tick(JOKE.setup.length * 50 + 100);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Click me to tell you a joke...')).toBeNull();
    expect(screen.getByRole('button', { name: 'See Punchline!' })).toBeTruthy();
    expect(screen.getByAltText("JC's reaction").getAttribute('src')).toBe('/assets/mes/intro.png');
  });

  it('hides the avatar button when the thinking image fails to load', () => {
    render(<JokeSection />);
    fireEvent.error(screen.getByAltText('JC thinking'));
    expect(screen.queryByRole('button', { name: 'Tell me a joke' })).toBeNull();
    expect(screen.getByText('Click me to tell you a joke...')).toBeTruthy();
  });

  it('drops the avatar when the reaction image fails to load', async () => {
    render(<JokeSection />);
    await tick(2000 + typed(JOKE.setup));
    fireEvent.error(screen.getByAltText("JC's reaction"));
    expect(screen.queryByAltText("JC's reaction")).toBeNull();
    expect(screen.getByRole('button', { name: 'See Punchline!' })).toBeTruthy();
  });

  it('falls back to a friendly message when the API responds with an error status', async () => {
    mockFetch(async () => ({ ok: false, json: async () => ({}) }));
    render(<JokeSection />);
    await tick(2000);
    expect(screen.getByText(/No jokes found/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Get Another Joke' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'See Punchline!' })).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('falls back when the request rejects, and recovers with Get Another Joke', async () => {
    mockFetch(async () => { throw new Error('offline'); });
    render(<JokeSection />);
    await tick(2000);
    expect(screen.getByText(/No jokes found/)).toBeTruthy();

    mockFetch(okJoke(JOKE));
    fireEvent.click(screen.getByRole('button', { name: 'Get Another Joke' }));
    expect(screen.getByText('Click me to tell you a joke...')).toBeTruthy();
    await tick(2000 + typed(JOKE.setup));
    expect(screen.getByRole('button', { name: 'See Punchline!' })).toBeTruthy();
  });

  it('treats a null API body as no joke', async () => {
    mockFetch(okJoke(null));
    render(<JokeSection />);
    await tick(2000);
    expect(screen.getByText(/No jokes found/)).toBeTruthy();
  });

  it('ignores corrupt cached state and fetches a fresh joke', async () => {
    localStorage.setItem(KEY, '{not json');
    render(<JokeSection />);
    await tick(2000);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('still works when localStorage writes and removals throw', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('denied'); });
    render(<JokeSection />);
    await tick(2000 + typed(JOKE.setup));
    fireEvent.click(screen.getByRole('button', { name: 'See Punchline!' }));
    await tick(typed(JOKE.punchline));
    fireEvent.click(screen.getByRole('button', { name: 'Get Another Joke!' }));
    expect(screen.getByText('Click me to tell you a joke...')).toBeTruthy();
  });

  it('types out a cached joke whose punchline is still hidden, and persists the reveal', async () => {
    localStorage.setItem(KEY, JSON.stringify(JOKE));
    render(<JokeSection />);
    await tick(2000 + typed(JOKE.setup));
    expect(global.fetch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'See Punchline!' }));
    await tick(typed(JOKE.punchline));
    expect(JSON.parse(localStorage.getItem(KEY)).punchlineShown).toBe(true);
    expect(screen.getByAltText("JC's reaction").getAttribute('src')).toBe('/assets/mes/lol.png');
  });

  it('with reduced motion, shows text instantly with no typing delay', async () => {
    reduced = true;
    localStorage.setItem(KEY, JSON.stringify(JOKE));
    render(<JokeSection />);
    await tick(2000);
    expect(screen.getByRole('status').textContent).toBe(JOKE.setup);
    fireEvent.click(screen.getByRole('button', { name: 'See Punchline!' }));
    expect(screen.getByRole('status').textContent).toContain(JOKE.punchline);
  });

  it('with reduced motion, a fetched joke is shown without typing', async () => {
    reduced = true;
    render(<JokeSection />);
    await tick(2000);
    expect(screen.getByRole('status').textContent).toBe(JOKE.setup);
  });

  it('offers only "Get Another Joke!" for a one-liner', async () => {
    mockFetch(okJoke({ setup: 'I used to be a banker.', isOneLiner: true }));
    render(<JokeSection />);
    await tick(2000 + typed('I used to be a banker.'));
    expect(screen.queryByRole('button', { name: 'See Punchline!' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Get Another Joke!' })).toBeTruthy();
  });

  it('handles revealing a joke that has no punchline text', async () => {
    mockFetch(okJoke({ setup: 'Just a setup', isOneLiner: false }));
    render(<JokeSection />);
    await tick(2000 + typed('Just a setup'));
    fireEvent.click(screen.getByRole('button', { name: 'See Punchline!' }));
    expect(screen.getByAltText("JC's reaction").getAttribute('src')).toBe('/assets/mes/lol.png');
    expect(screen.getByRole('button', { name: 'Get Another Joke!' })).toBeTruthy();
  });

  it('Get Another Joke clears the cache, shows thinking, then loads a new joke', async () => {
    localStorage.setItem(KEY, JSON.stringify({ ...JOKE, punchlineShown: true }));
    render(<JokeSection />);
    await tick(2000);
    const next = { setup: 'Second joke', punchline: 'Second punch', isOneLiner: false };
    mockFetch(okJoke(next));

    fireEvent.click(screen.getByRole('button', { name: 'Get Another Joke!' }));
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(screen.getByText('Click me to tell you a joke...')).toBeTruthy();

    await tick(2000 + typed(next.setup));
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status').textContent).toBe(next.setup);
    expect(screen.queryByRole('button', { name: 'Get Another Joke!' })).toBeNull();
  });

  it('cancels an in-flight typewriter when asking for another joke mid-typing', async () => {
    render(<JokeSection />);
    await tick(2000 + 100);
    // Setup is only partially typed; the only visible action is the fallback button.
    fireEvent.click(screen.getByRole('button', { name: 'Get Another Joke' }));
    await tick(2000 + typed(JOKE.setup));
    expect(screen.getByRole('status').textContent).toBe(JOKE.setup);
  });

  it('does not update state when unmounted while the fetch is in flight', async () => {
    let resolve;
    mockFetch(() => new Promise((r) => { resolve = r; }));
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = render(<JokeSection />);
    await tick(2000);
    unmount();
    await act(async () => { resolve({ ok: true, json: async () => JOKE }); });
    await tick(1000);
    expect(errors).not.toHaveBeenCalled();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('does not continue after unmount while still on the initial thinking delay', async () => {
    const { unmount } = render(<JokeSection />);
    unmount();
    await tick(3000);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('restores a cached, fully revealed joke that has no punchline text', async () => {
    localStorage.setItem(KEY, JSON.stringify({ setup: 'Only setup', isOneLiner: true, punchlineShown: true }));
    render(<JokeSection />);
    await tick(2000);
    expect(screen.getByRole('status').textContent).toBe('Only setup');
    expect(screen.getByRole('button', { name: 'Get Another Joke!' })).toBeTruthy();
  });

  it('can ask for another joke while the punchline is still being typed', async () => {
    render(<JokeSection />);
    await tick(2000 + typed(JOKE.setup));
    fireEvent.click(screen.getByRole('button', { name: 'See Punchline!' }));
    await tick(120);
    const next = { setup: 'Next', punchline: 'Next punch', isOneLiner: false };
    mockFetch(okJoke(next));
    fireEvent.click(screen.getByRole('button', { name: 'Get Another Joke!' }));
    await tick(2000 + typed(next.setup));
    // The abandoned punchline must not leak into the new joke.
    expect(screen.getByRole('status').textContent).toBe(next.setup);
    expect(screen.getByRole('button', { name: 'See Punchline!' })).toBeTruthy();
  });

  it('does not update state when unmounted while a requested new joke is in flight', async () => {
    render(<JokeSection />);
    await tick(2000 + typed(JOKE.setup));
    fireEvent.click(screen.getByRole('button', { name: 'See Punchline!' }));
    await tick(typed(JOKE.punchline));
    let resolve;
    mockFetch(() => new Promise((r) => { resolve = r; }));
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = { unmount: () => cleanup() };
    fireEvent.click(screen.getByRole('button', { name: 'Get Another Joke!' }));
    await tick(2000);
    unmount();
    await act(async () => { resolve({ ok: true, json: async () => JOKE }); });
    await tick(1000);
    expect(errors).not.toHaveBeenCalled();
  });

  it('does not update state when unmounted while a click-to-skip fetch is in flight', async () => {
    let resolve;
    mockFetch(() => new Promise((r) => { resolve = r; }));
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = render(<JokeSection />);
    fireEvent.click(screen.getByRole('button', { name: 'Tell me a joke' }));
    unmount();
    await act(async () => { resolve({ ok: true, json: async () => JOKE }); });
    await tick(1000);
    expect(errors).not.toHaveBeenCalled();
  });
});
