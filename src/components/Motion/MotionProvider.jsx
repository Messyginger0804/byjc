'use client';

import { LazyMotion, MotionConfig } from 'motion/react';

// If the feature chunk fails to load, reveal everything (CSS keys off this class on <html>)
// instead of leaving initial-hidden content invisible.
const loadFeatures = () =>
  import('./features')
    .then((mod) => mod.default)
    .catch(() => {
      document.documentElement.classList.add('motion-failed');
      return {};
    });

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

