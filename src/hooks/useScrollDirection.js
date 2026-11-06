'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks scroll direction for a hide-on-scroll-down / show-on-scroll-up header.
 * SSR-safe (state only changes inside effects). Uses a passive listener batched with rAF.
 *
 * @param {{ compactAfter?: number, hideAfter?: number, delta?: number }} [options]
 * @returns {{ hidden: boolean, compact: boolean }}
 */
export function useScrollDirection({ compactAfter = 40, hideAfter = 120, delta = 8 } = {}) {
  const [state, setState] = useState({ hidden: false, compact: false });

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    let rafId = 0;

    const update = () => {
      ticking = false;
      rafId = 0;
      const y = Math.max(window.scrollY, 0);
      const diff = y - lastY;
      let hidden;
      if (y < hideAfter) hidden = false;
      else if (diff > delta) hidden = true;
      else if (diff < -delta) hidden = false;
      if (Math.abs(diff) > delta || y < hideAfter) lastY = y;
      const compact = y > compactAfter;
      setState((prev) => {
        const nextHidden = hidden === undefined ? prev.hidden : hidden;
        return prev.hidden === nextHidden && prev.compact === compact ? prev : { hidden: nextHidden, compact };
      });
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [compactAfter, hideAfter, delta]);

  return state;
}

export default useScrollDirection;
