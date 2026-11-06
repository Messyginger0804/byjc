/**
 * Pure capability gating for the 3D hero. No three/fiber imports here so the
 * module is safe to ship in the initial bundle and trivial to unit test.
 */

/** Decide whether the WebGL scene should be loaded at all. */
export function shouldEnable3D({ reducedMotion = false, saveData = false, webgl = false } = {}) {
  return !reducedMotion && !saveData && Boolean(webgl);
}

/** three r187 needs WebGL2. Probe once and release the context immediately. */
export function detectWebGL() {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Read the browser signals used for gating. `webgl` is only probed on request. */
export function detectEnvironment({ probeWebGL = true } = {}) {
  if (typeof window === 'undefined') {
    return { reducedMotion: true, saveData: false, webgl: false, small: false };
  }
  const mq = (q) => (window.matchMedia ? window.matchMedia(q).matches : false);
  return {
    reducedMotion: mq('(prefers-reduced-motion: reduce)'),
    saveData: Boolean(navigator.connection?.saveData),
    webgl: probeWebGL ? detectWebGL() : true,
    small: mq('(max-width: 767px), (pointer: coarse)'),
  };
}

/**
 * Quality knobs per variant and screen class.
 * detail: IcosahedronGeometry subdivision; particles: point count.
 */
export function getQualityProfile({ variant = 'hero', small = false } = {}) {
  const compact = variant === 'compact';
  let detail;
  let particles;
  if (compact) {
    detail = small ? 14 : 26;
    particles = small ? 220 : 480;
  } else {
    detail = small ? 24 : 48;
    particles = small ? 700 : 1600;
  }
  return {
    detail,
    particles,
    dpr: small ? [1, 1.5] : [1, 1.75],
    antialias: true,
    pointSize: compact ? 4.2 : 5.2,
  };
}

/** Events that count as "the user is here"; any one of them releases the mobile WebGL upgrade. */
export const INTERACTION_EVENTS = ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll'];

/**
 * Small / coarse-pointer devices (and GPU-less CI Chrome emulating them) pay for shader
 * compile + render on the main thread, so they wait for a real interaction first.
 */
export function shouldWaitForInteraction({ small = false } = {}) {
  return Boolean(small);
}

/** Run `cb` once after the first interaction (passive listeners). Returns a cleanup fn. */
export function onFirstInteraction(cb, target = typeof window === 'undefined' ? null : window) {
  if (!target) return () => {};
  const opts = { passive: true, capture: true };
  const cleanup = () => INTERACTION_EVENTS.forEach((e) => target.removeEventListener(e, handler, opts));
  function handler() {
    cleanup();
    cb();
  }
  INTERACTION_EVENTS.forEach((e) => target.addEventListener(e, handler, opts));
  return cleanup;
}
