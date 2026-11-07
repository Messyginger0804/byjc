'use client';

import { useEffect, useRef } from 'react';
import { m, useMotionValue, useSpring, useTransform } from 'motion/react';

const MAX_TILT = 8;
const SPRING = { stiffness: 260, damping: 24, mass: 0.6 };

/**
 * External-link tile with a premium hover: spring 3D tilt toward a fine pointer, cursor spotlight + glare,
 * animated gradient border and a lifted logo. The visual states are CSS (.brand-tile in globals.css) gated to
 * fine pointer / no reduced motion; JS only drives the tilt springs and the --mx/--my vars. The DOM is identical
 * on server, client, touch and keyboard, so hydration never remounts children.
 *
 * @param {object} props
 * @param {string} props.href
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function BrandTile({ href, className = '', children }) {
  const ref = useRef(null);
  const canTilt = useRef(false);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(px, [0, 1], [-MAX_TILT, MAX_TILT]), SPRING);
  const rotateX = useSpring(useTransform(py, [0, 1], [MAX_TILT, -MAX_TILT]), SPRING);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      canTilt.current = fine.matches && !reduce.matches;
    };
    update();
    fine.addEventListener('change', update);
    reduce.addEventListener('change', update);
    return () => {
      fine.removeEventListener('change', update);
      reduce.removeEventListener('change', update);
    };
  }, []);

  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
    if (canTilt.current) {
      px.set((e.clientX - r.left) / r.width);
      py.set((e.clientY - r.top) / r.height);
    }
  };
  const onPointerLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <m.a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`brand-tile ${className}`}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <span aria-hidden="true" className="brand-glow" />
      <span aria-hidden="true" className="brand-fx" />
      {children}
      <span aria-hidden="true" className="brand-arrow">↗</span>
    </m.a>
  );
}
