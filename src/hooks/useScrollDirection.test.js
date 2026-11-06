// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollDirection } from './useScrollDirection';

const scrollTo = (y) => {
  act(() => {
    window.scrollY = y;
    window.dispatchEvent(new Event('scroll'));
  });
};

beforeEach(() => {
  window.scrollY = 0;
  vi.stubGlobal('requestAnimationFrame', (cb) => {
    cb();
    return 1;
  });
  window.requestAnimationFrame = globalThis.requestAnimationFrame;
});
afterEach(() => vi.unstubAllGlobals());

describe('useScrollDirection', () => {
  it('starts visible and not compact at the top', () => {
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current).toEqual({ hidden: false, compact: false });
  });

  it('becomes compact after compactAfter but stays visible before hideAfter', () => {
    const { result } = renderHook(() => useScrollDirection());
    scrollTo(60);
    expect(result.current).toEqual({ hidden: false, compact: true });
  });

  it('hides on scroll down past hideAfter and shows on scroll up', () => {
    const { result } = renderHook(() => useScrollDirection());
    scrollTo(200);
    expect(result.current).toEqual({ hidden: true, compact: true });
    scrollTo(150);
    expect(result.current.hidden).toBe(false);
  });

  it('ignores jitter within delta', () => {
    const { result } = renderHook(() => useScrollDirection());
    scrollTo(200);
    scrollTo(204);
    expect(result.current.hidden).toBe(true);
    scrollTo(200);
    expect(result.current.hidden).toBe(true);
  });

  it('reveals and un-compacts when returning to top, clamping negative scroll', () => {
    const { result } = renderHook(() => useScrollDirection());
    scrollTo(300);
    scrollTo(-50);
    expect(result.current).toEqual({ hidden: false, compact: false });
  });

  it('honours custom thresholds', () => {
    const { result } = renderHook(() => useScrollDirection({ compactAfter: 10, hideAfter: 20, delta: 2 }));
    scrollTo(30);
    expect(result.current).toEqual({ hidden: true, compact: true });
  });

  it('batches events into one frame and removes the listener on unmount', () => {
    let pending;
    window.requestAnimationFrame = vi.fn((cb) => {
      pending = cb;
      return 1;
    });
    const { result, unmount } = renderHook(() => useScrollDirection());
    window.scrollY = 300;
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('scroll'));
    });
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    act(() => pending());
    expect(result.current.hidden).toBe(true);
    unmount();
    window.dispatchEvent(new Event('scroll'));
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
  });
});
