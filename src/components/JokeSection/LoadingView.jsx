'use client';

import Image from 'next/image';

export default function LoadingView({ avatarError, avatarSrc, onTellJoke, onAvatarError }) {
  return (
    <div className="glass-card relative flex flex-col items-center space-y-8 overflow-hidden rounded-[2.5rem] p-8 text-center md:p-16">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal opacity-20 blur-3xl motion-safe:animate-pulse" />
      <div className="relative z-10">
        {!avatarError && (
          <button
            type="button"
            aria-label="Tell me a joke"
            onClick={onTellJoke}
            className="relative mx-auto mb-6 h-32 w-32 cursor-pointer rounded-full transition-transform hover:scale-105 motion-safe:animate-bounce focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-ink"
          >
            <Image
              src={avatarSrc}
              alt="JC thinking"
              fill
              className="object-contain"
              onError={onAvatarError}
              unoptimized
            />
          </button>
        )}
        <p className="text-xl italic text-muted motion-safe:animate-pulse">Click me to tell you a joke...</p>
      </div>
    </div>
  );
}
