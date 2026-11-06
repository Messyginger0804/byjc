'use client';

import { LazyMotion, MotionConfig } from 'motion/react';

const loadFeatures = () => import('./features').then((mod) => mod.default);

/**
 * Mounted once in the root layout. Provides LazyMotion (async domMax features, so use `m.*`
 * components, never `motion.*`) and MotionConfig with reducedMotion="user".
 *
 * @param {{ children: React.ReactNode }} props
 */
export default function MotionProvider({ children }) {
  return (
    <LazyMotion features={loadFeatures}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

export { MotionProvider };
