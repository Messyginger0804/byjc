'use client';

import { AnimatePresence, m } from 'motion/react';

export default function JokeText({ currentJoke, setupText, showPunchline, punchlineText }) {
  if (!currentJoke) {
    return <p className="text-xl italic text-muted">No jokes found. Our joke teller is currently on a break! 😴</p>;
  }

  return (
    <>
      <p aria-hidden="true" className="font-display text-2xl font-semibold leading-tight tracking-tight text-balance md:text-4xl">
        {setupText}
      </p>

      <AnimatePresence>
        {showPunchline && (
          <m.div
            key="punchline"
            className="space-y-6"
            style={{ perspective: 800 }}
            initial={{ opacity: 0, rotateX: -80, y: 12 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          >
            <div className="mx-auto h-px w-24 bg-signal opacity-60" />
            <p aria-hidden="true" className="font-display text-xl font-medium italic leading-relaxed tracking-tight text-accent dark:text-amber md:text-3xl">
              {punchlineText}
            </p>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
