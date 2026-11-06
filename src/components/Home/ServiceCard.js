'use client';

import { useEffect, useRef } from 'react';

/**
 * Glass card with a cursor-following spotlight (CSS vars --mx/--my) and an in-view flag
 * (data-inview, toggled both ways) that visuals use to play their entrance and loops only while visible. The spotlight and the
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
    // data-inview means "on screen and tab visible": it plays the entrance and the looping
    // animations, and is removed again offscreen / when the tab is hidden so loops pause.
    let intersecting = false;
    const sync = () => el.toggleAttribute('data-inview', intersecting && !document.hidden);
    // Seed from the live layout so a card already in view at hydration never collapses and regrows.
    const r = el.getBoundingClientRect();
    intersecting = r.top < window.innerHeight && r.bottom > 0;
    sync();
    el.setAttribute('data-armed', '');
    const io = new IntersectionObserver(
      ([entry]) => {
        intersecting = entry.isIntersecting;
        sync();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    document.addEventListener('visibilitychange', sync);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
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
