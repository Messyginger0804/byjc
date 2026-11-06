'use client';

import { useEffect } from 'react';
import { m } from 'motion/react';

// Module-level flag: false for the very first load (SSR + hydration => no animation, so the
// LCP element is never gated behind JS), true for every later client-side navigation.
let hasNavigated = false;

export default function Template({ children }) {
  useEffect(() => {
    hasNavigated = true;
  }, []);

  return (
    <m.div
      initial={hasNavigated ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}
