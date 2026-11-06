'use client';

import { m, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react';
import usePointerMotionEnabled from './usePointerMotionEnabled';

/**
 * Subtle 3D pointer tilt with a moving glare. Tilt is disabled (same DOM) on touch / reduced motion.
 * Add your own surface classes (e.g. `glass-card`) via className.
 *
 * @param {object} props
 * @param {string} [props.className]
 * @param {number} [props.max=6]  Max tilt in degrees.
 * @param {React.ReactNode} props.children
 */
export default function TiltCard({ className, max = 6, children }) {
  const enabled = usePointerMotionEnabled();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 300, damping: 30 };
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(400px circle at ${gx} ${gy}, rgb(255 255 255 / 0.14), transparent 60%)`;
  const glareOpacity = useMotionValue(0);


  const onMove = (e) => {
    if (!enabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    glareOpacity.set(1);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
    glareOpacity.set(0);
  };

  // One stable DOM shape: outer keeps the caller's classes (glass-card hover, h-full, ...);
  // the inner element carries the tilt so Motion's inline transform never overrides CSS hover.
  return (
    <div className={className} style={enabled ? { perspective: 900 } : undefined}>
      <m.div
        className="relative h-full w-full rounded-[inherit]"
        style={enabled ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : undefined}
        onPointerMove={enabled ? onMove : undefined}
        onPointerLeave={enabled ? onLeave : undefined}
      >
        {children}
        <m.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ backgroundImage: glare, opacity: glareOpacity }}
        />
      </m.div>
    </div>
  );
}

