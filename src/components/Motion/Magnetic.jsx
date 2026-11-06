'use client';

import { useRef } from 'react';
import { m, useMotionValue, useSpring } from 'motion/react';
import usePointerMotionEnabled from './usePointerMotionEnabled';

/**
 * Magnetic hover: wrapped content is pulled toward the pointer. No-op on coarse pointers and
 * with reduced motion. Renders an inline-block wrapper so it does not affect layout size.
 *
 * @param {object} props
 * @param {number} [props.strength=0.3]  Fraction of the pointer offset to follow.
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Magnetic({ strength = 0.3, className, children }) {
  const ref = useRef(null);
  const enabled = usePointerMotionEnabled();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 30, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 300, damping: 30, mass: 0.6 });


  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.div
      ref={ref}
      className={`inline-block ${className || ''}`}
      style={enabled ? { x: sx, y: sy } : undefined}
      onPointerMove={enabled ? onMove : undefined}
      onPointerLeave={enabled ? onLeave : undefined}
    >
      {children}
    </m.div>
  );
}
