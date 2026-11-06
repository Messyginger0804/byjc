// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  detectEnvironment,
  detectWebGL,
  getQualityProfile,
  INTERACTION_EVENTS,
  onFirstInteraction,
  shouldEnable3D,
  shouldWaitForInteraction,
} from './capabilities';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('shouldEnable3D', () => {
  it('requires webgl and no reduced-motion / save-data', () => {
    expect(shouldEnable3D({ webgl: true })).toBe(true);
    expect(shouldEnable3D({ webgl: true, reducedMotion: true })).toBe(false);
    expect(shouldEnable3D({ webgl: true, saveData: true })).toBe(false);
    expect(shouldEnable3D({ webgl: false })).toBe(false);
    expect(shouldEnable3D({})).toBe(false);
    expect(shouldEnable3D()).toBe(false);
  });
});

describe('detectWebGL', () => {
  it('is false when no webgl2 context is available', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    expect(detectWebGL()).toBe(false);
  });

  it('is true and releases the context when available', () => {
    const loseContext = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      getExtension: () => ({ loseContext }),
    });
    expect(detectWebGL()).toBe(true);
    expect(loseContext).toHaveBeenCalled();
  });

  it('is true even when the lose_context extension is missing', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ getExtension: () => null });
    expect(detectWebGL()).toBe(true);
  });

  it('is false when probing throws', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
      throw new Error('boom');
    });
    expect(detectWebGL()).toBe(false);
  });

  it('is false without a document', () => {
    vi.stubGlobal('document', undefined);
    expect(detectWebGL()).toBe(false);
  });
});

describe('detectEnvironment', () => {
  it('returns safe defaults without a window', () => {
    vi.stubGlobal('window', undefined);
    expect(detectEnvironment()).toEqual({ reducedMotion: true, saveData: false, webgl: false, small: false });
  });

  it('reads media queries, saveData and probes webgl', () => {
    window.matchMedia = (q) => ({ matches: q.includes('reduced-motion') || q.includes('pointer: coarse') });
    vi.stubGlobal('navigator', { connection: { saveData: true } });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    expect(detectEnvironment()).toEqual({ reducedMotion: true, saveData: true, webgl: false, small: true });
  });

  it('skips the webgl probe when asked and tolerates missing matchMedia / connection', () => {
    window.matchMedia = undefined;
    vi.stubGlobal('navigator', {});
    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext');
    expect(detectEnvironment({ probeWebGL: false })).toEqual({
      reducedMotion: false,
      saveData: false,
      webgl: true,
      small: false,
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('works with a plain matchMedia stub', () => {
    window.matchMedia = (q) => ({ matches: q.includes('max-width') });
    vi.stubGlobal('navigator', {});
    expect(detectEnvironment({ probeWebGL: false })).toMatchObject({ reducedMotion: false, small: true });
  });
});

describe('getQualityProfile', () => {
  it('covers hero/compact x small/large', () => {
    expect(getQualityProfile()).toEqual({ detail: 48, particles: 1600, dpr: [1, 1.75], antialias: true, pointSize: 5.2 });
    expect(getQualityProfile({ variant: 'hero', small: true })).toEqual({
      detail: 24, particles: 700, dpr: [1, 1.5], antialias: true, pointSize: 5.2,
    });
    expect(getQualityProfile({ variant: 'compact' })).toEqual({
      detail: 26, particles: 480, dpr: [1, 1.75], antialias: true, pointSize: 4.2,
    });
    expect(getQualityProfile({ variant: 'compact', small: true })).toEqual({
      detail: 14, particles: 220, dpr: [1, 1.5], antialias: true, pointSize: 4.2,
    });
  });
});

describe('shouldWaitForInteraction', () => {
  it('gates only small / coarse-pointer environments', () => {
    expect(shouldWaitForInteraction({ small: true })).toBe(true);
    expect(shouldWaitForInteraction({ small: false })).toBe(false);
    expect(shouldWaitForInteraction()).toBe(false);
  });
});

describe('onFirstInteraction', () => {
  it.each(INTERACTION_EVENTS)('fires once on %s and then detaches', (name) => {
    const cb = vi.fn();
    onFirstInteraction(cb);
    window.dispatchEvent(new Event(name));
    window.dispatchEvent(new Event(name));
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('registers passive listeners and can be cancelled', () => {
    const target = new EventTarget();
    const add = vi.spyOn(target, 'addEventListener');
    const cb = vi.fn();
    const cancel = onFirstInteraction(cb, target);
    expect(add).toHaveBeenCalledWith('pointerdown', expect.any(Function), expect.objectContaining({ passive: true }));
    cancel();
    target.dispatchEvent(new Event('pointerdown'));
    expect(cb).not.toHaveBeenCalled();
  });

  it('is a no-op without a target', () => {
    expect(onFirstInteraction(() => {}, null)()).toBeUndefined();
  });
});
