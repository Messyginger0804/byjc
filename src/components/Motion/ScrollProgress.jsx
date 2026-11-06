'use client';

import { m, useReducedMotion, useScroll, useSpring } from 'motion/react';

/**
 * Fixed top reading-progress bar (gradient, scaleX driven by page scroll). Decorative (aria-hidden).
 *
 * @param {object} props
 * @param {string} [props.className]  Extra classes (e.g. override height `h-1`).
 */
export default function ScrollProgress({ className = '' }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 30, restDelta: 0.001 });
  const reduce = useReducedMotion();
  return (
    <m.div
      aria-hidden="true"
      className={`fixed inset-x-0 top-0 z-[80] h-[3px] origin-left bg-signal ${className}`}
      style={{ scaleX: reduce ? scrollYProgress : scaleX }}
    />
  );
}

export { ScrollProgress };
