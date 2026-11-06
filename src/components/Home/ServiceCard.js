'use client';

import { useEffect, useRef } from 'react';

/**
 * Glass card with a cursor-following spotlight (CSS vars --mx/--my) and an in-view flag
 * (data-inview) that visuals use to play their one-shot entrance. The spotlight and the
 * entrance arming are CSS-gated to fine pointers / no reduced motion; without JS the
 * visuals simply render in their final state.
 *
 * @param {object} props
 * @param {string} [props.className]
 */
export default function ServiceCard({ className = '', children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') {
      el.setAttribute('data-inview', '');
      return undefined;
    }
    el.setAttribute('data-armed', '');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute('data-inview', '');
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onPointerMove = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <div ref={ref} onPointerMove={onPointerMove} className={`glass-card svc-card ${className}`}>
      {children}
    </div>
  );
}
