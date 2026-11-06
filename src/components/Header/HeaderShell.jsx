'use client';

import { useScrollDirection } from '@/hooks/useScrollDirection';

/**
 * Fixed header wrapper: hides on scroll down, returns on scroll up (or keyboard focus),
 * and sets `data-compact` after ~40px so children can shrink via `group-data-[compact=true]/header:*`.
 * Renders an in-flow spacer so content is not covered.
 */
export default function HeaderShell({ children }) {
  const { hidden, compact } = useScrollDirection();

  return (
    <>
      <div aria-hidden="true" className="h-[4.5rem] sm:h-24" />
      <header
        data-compact={compact}
        className={`group/header pointer-events-none fixed inset-x-0 top-0 z-50 px-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:px-8 focus-within:translate-y-0 ${
          hidden ? '-translate-y-full' : 'translate-y-0'
        } ${compact ? 'pt-2 sm:pt-3' : 'pt-3 sm:pt-6'}`}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
          {children}
        </div>
      </header>
    </>
  );
}
