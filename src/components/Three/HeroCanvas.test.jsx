import React, { useEffect } from 'react';
// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sceneLoaded = vi.fn();
const sceneHandles = vi.hoisted(() => ({ fail: null, crash: false }));
vi.mock('./HeroScene', () => {
  sceneLoaded();
  return {
    default: function Scene({ profile, onReady, onFail }) {
      if (sceneHandles.crash) throw new Error('webgl exploded');
      useEffect(() => { onReady?.(); }, [onReady]);
      sceneHandles.fail = onFail;
      return <div data-testid="scene" data-detail={profile.detail} />;
    },
  };
});

import HeroCanvas from './HeroCanvas';

const reducedListeners = new Set();
const setEnv = ({ reduced = false, coarse = false, webgl = true } = {}) => {
  reducedListeners.clear();
  window.matchMedia = (q) => ({
    matches: q.includes('reduced-motion') ? reduced : q.includes('pointer: coarse') ? coarse : false,
    addEventListener: (_t, fn) => { if (q.includes('reduced-motion')) reducedListeners.add(fn); },
    removeEventListener: (_t, fn) => reducedListeners.delete(fn),
  });
  HTMLCanvasElement.prototype.getContext = () => (webgl ? { getExtension: () => null } : null);
};

beforeEach(() => {
  sceneLoaded.mockClear();
  sceneHandles.crash = false;
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  delete window.requestIdleCallback;
  delete window.cancelIdleCallback;
});

describe('HeroCanvas', () => {
  it('renders an aria-hidden fallback immediately', () => {
    setEnv({ reduced: true });
    const { container } = render(<HeroCanvas className="extra" />);
    const root = container.firstChild;
    expect(root.getAttribute('aria-hidden')).toBe('true');
    expect(root.className).toContain('extra');
    expect(root.children).toHaveLength(1);
  });

  it('stays on the fallback with reduced motion', async () => {
    setEnv({ reduced: true });
    const { queryByTestId } = render(<HeroCanvas />);
    await act(async () => { vi.advanceTimersByTime(5000); });
    expect(queryByTestId('scene')).toBeNull();
    expect(sceneLoaded).not.toHaveBeenCalled();
  });

  it('stays on the fallback without WebGL2', async () => {
    setEnv({ webgl: false });
    const { queryByTestId } = render(<HeroCanvas />);
    await act(async () => { vi.advanceTimersByTime(5000); });
    expect(queryByTestId('scene')).toBeNull();
  });

  it('upgrades via setTimeout when requestIdleCallback is missing', async () => {
    setEnv();
    const { getByTestId, container } = render(<HeroCanvas />);
    await act(async () => { await vi.advanceTimersByTimeAsync(1300); });
    const scene = getByTestId('scene');
    expect(scene.getAttribute('data-detail')).toBe('48');
    expect(container.firstChild.children).toHaveLength(2);
  });

  it('waits for the first interaction on coarse pointers, then uses requestIdleCallback', async () => {
    setEnv({ coarse: true });
    window.requestIdleCallback = vi.fn((cb) => setTimeout(cb, 0));
    window.cancelIdleCallback = vi.fn();
    const { queryByTestId, getByTestId } = render(<HeroCanvas variant="compact" />);
    await act(async () => { await vi.advanceTimersByTimeAsync(10000); });
    expect(window.requestIdleCallback).not.toHaveBeenCalled();
    expect(queryByTestId('scene')).toBeNull();
    expect(sceneLoaded).not.toHaveBeenCalled();
    await act(async () => { window.dispatchEvent(new Event('touchstart')); });
    await act(async () => { await vi.advanceTimersByTimeAsync(10); });
    expect(window.requestIdleCallback).toHaveBeenCalledTimes(1);
    expect(getByTestId('scene').getAttribute('data-detail')).toBe('14');
  });

  it('does not upgrade after unmount even if the user interacts later', async () => {
    setEnv({ coarse: true });
    const { unmount } = render(<HeroCanvas />);
    unmount();
    await act(async () => { window.dispatchEvent(new Event('scroll')); });
    await vi.advanceTimersByTimeAsync(3000);
    expect(sceneLoaded).not.toHaveBeenCalled();
  });

  it('uses requestIdleCallback immediately on desktop', async () => {
    setEnv();
    window.requestIdleCallback = vi.fn((cb) => setTimeout(cb, 0));
    window.cancelIdleCallback = vi.fn();
    const { getByTestId } = render(<HeroCanvas variant="compact" />);
    await act(async () => { await vi.advanceTimersByTimeAsync(10); });
    expect(getByTestId('scene').getAttribute('data-detail')).toBe('26');
  });

  it('cancels the pending idle callback on unmount', () => {
    setEnv();
    window.requestIdleCallback = vi.fn(() => 42);
    window.cancelIdleCallback = vi.fn();
    const { unmount } = render(<HeroCanvas />);
    unmount();
    expect(window.cancelIdleCallback).toHaveBeenCalledWith(42);
  });

  it('clears the timeout on unmount so the scene never loads', async () => {
    setEnv();
    const { unmount } = render(<HeroCanvas />);
    unmount();
    await vi.advanceTimersByTimeAsync(3000);
    expect(sceneLoaded).not.toHaveBeenCalled();
  });

  it('restores the CSS fallback when the scene reports a failure after it was ready', async () => {
    setEnv();
    const { getByTestId, queryByTestId, container } = render(<HeroCanvas />);
    await act(async () => { await vi.advanceTimersByTimeAsync(1300); });
    const stage = container.firstChild.firstChild;
    expect(getByTestId('scene')).toBeTruthy();
    expect(stage.getAttribute('data-hidden')).toBe('true');
    await act(async () => { sceneHandles.fail(); });
    expect(queryByTestId('scene')).toBeNull();
    expect(stage.getAttribute('data-hidden')).toBe('false');
  });

  it('tears the scene down when reduced motion is switched on while live', async () => {
    setEnv();
    const { getByTestId, queryByTestId, container } = render(<HeroCanvas />);
    await act(async () => { await vi.advanceTimersByTimeAsync(1300); });
    expect(getByTestId('scene')).toBeTruthy();
    await act(async () => { reducedListeners.forEach((fn) => fn({ matches: true })); });
    expect(queryByTestId('scene')).toBeNull();
    expect(container.firstChild.firstChild.getAttribute('data-hidden')).toBe('false');
  });

  it('removes the reduced-motion listener on unmount', () => {
    setEnv();
    const { unmount } = render(<HeroCanvas />);
    expect(reducedListeners.size).toBe(1);
    unmount();
    expect(reducedListeners.size).toBe(0);
  });

  it('falls back to the CSS orb when the scene throws while rendering', async () => {
    setEnv();
    sceneHandles.crash = true;
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { queryByTestId, container } = render(<HeroCanvas />);
    await act(async () => { await vi.advanceTimersByTimeAsync(1300); });
    expect(queryByTestId('scene')).toBeNull();
    expect(container.firstChild.children).toHaveLength(1);
    expect(container.firstChild.firstChild.getAttribute('data-hidden')).toBe('false');
    errors.mockRestore();
  });

  it('keeps the live scene when reduced motion change reports no match', async () => {
    setEnv();
    const { getByTestId } = render(<HeroCanvas />);
    await act(async () => { await vi.advanceTimersByTimeAsync(1300); });
    await act(async () => { reducedListeners.forEach((fn) => fn({ matches: false })); });
    expect(getByTestId('scene')).toBeTruthy();
  });

  it('works when matchMedia change events are unsupported', async () => {
    setEnv();
    const base = window.matchMedia;
    window.matchMedia = (q) => ({ ...base(q), addEventListener: undefined });
    const { getByTestId } = render(<HeroCanvas />);
    await act(async () => { await vi.advanceTimersByTimeAsync(1300); });
    expect(getByTestId('scene')).toBeTruthy();
  });
});
