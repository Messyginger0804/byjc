'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { AnimatePresence, m } from 'motion/react';

const AVATAR_DEFAULT = '/assets/mes/intro.png';
const AVATAR_THINKING = '/assets/mes/thinking.png';
const AVATAR_LOL = '/assets/mes/lol.png';

const btnFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-ink';
const primaryBtn = `rounded-full bg-signal-cta px-7 py-3 font-semibold text-white shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 ${btnFocus}`;
const ghostBtn = `rounded-full border border-dark/20 px-7 py-3 font-semibold transition-all duration-300 hover:bg-dark hover:text-white active:scale-95 dark:border-white/25 dark:hover:bg-white dark:hover:text-ink ${btnFocus}`;

const STORAGE_KEY = 'jc-joke-state';

function loadCachedJoke() {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    return null;
  }
  return null;
}

function saveCachedJoke(joke) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(joke));
  } catch {
  }
}

function clearCachedJoke() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
  }
}

function startTypewriter(text, setter, timeoutRef, onComplete, schedule = setTimeout, cancel = clearTimeout) {
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion || !text) {
    setter(text);
    onComplete?.();
    return;
  }

  if (timeoutRef.current) {
    cancel(timeoutRef.current);
  }

  let index = 0;
  setter('');

  const typeChar = () => {
    if (index < text.length) {
      setter(text.slice(0, index + 1));
      index++;
      timeoutRef.current = schedule(typeChar, 50);
    } else {
      onComplete?.();
    }
  };

  typeChar();
}

export default function JokeSection() {
  const [currentJoke, setCurrentJoke] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setupText, setSetupText] = useState('');
  const [punchlineText, setPunchlineText] = useState('');
  const [showPunchline, setShowPunchline] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(AVATAR_THINKING);
  const [avatarError, setAvatarError] = useState(false);
  const [, setThinkingText] = useState('Thinking of a good one...');
  const [isOneLiner, setIsOneLiner] = useState(false);
  const [jokeLoaded, setJokeLoaded] = useState(false);
  const [punchlineLoaded, setPunchlineLoaded] = useState(false);

  const setupTimeoutRef = useRef(null);
  const punchlineTimeoutRef = useRef(null);
  const mountedRef = useRef(false);
  const timersRef = useRef(new Set());

  // Every timer goes through here so unmount can clear all of them.
  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      timersRef.current.delete(id);
      if (mountedRef.current) fn();
    }, ms);
    timersRef.current.add(id);
    return id;
  }, []);

  // Cancel a pending timer and drop it from the registry.
  const cancel = useCallback((id) => {
    clearTimeout(id);
    timersRef.current.delete(id);
  }, []);

  const fetchJoke = useCallback(async (timeoutRef) => {
    try {
      const res = await fetch('/api/jokes/random');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (!mountedRef.current) return;
      if (data) {
        setCurrentJoke(data);
        setIsOneLiner(data.isOneLiner);
        startTypewriter(data.setup, setSetupText, timeoutRef, undefined, schedule, cancel);
        saveCachedJoke(data);
      }
    } catch {
      if (mountedRef.current) setCurrentJoke(null);
    }
  }, [schedule, cancel]);

  useEffect(() => {
    const cached = loadCachedJoke();
    const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    mountedRef.current = true;
    const timers = timersRef.current;

    (async () => {
      setAvatarSrc(AVATAR_THINKING);
      setAvatarError(false);

      await new Promise((resolve) => schedule(resolve, 2000));
      if (!mountedRef.current) return;

      if (cached?.punchlineShown) {
        setCurrentJoke(cached);
        setIsOneLiner(cached.isOneLiner);
        setSetupText(cached.setup);
        setPunchlineText(cached.punchline || '');
        setShowPunchline(true);
        setAvatarSrc(AVATAR_LOL);
        setJokeLoaded(true);
        setPunchlineLoaded(true);
      } else if (cached) {
        setCurrentJoke(cached);
        setIsOneLiner(cached.isOneLiner);
        if (reducedMotion) {
          setSetupText(cached.setup);
        } else {
          startTypewriter(cached.setup, setSetupText, setupTimeoutRef, undefined, schedule, cancel);
        }
        setAvatarSrc(AVATAR_DEFAULT);
        setJokeLoaded(true);
      } else {
        await fetchJoke(setupTimeoutRef);
        if (!mountedRef.current) return;
        setAvatarSrc(AVATAR_DEFAULT);
        setJokeLoaded(true);
      }

      setIsLoading(false);
      setThinkingText('');
    })();

    return () => {
      mountedRef.current = false;
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, [fetchJoke, schedule, cancel]);

  const setupComplete = !isLoading && jokeLoaded && setupText === currentJoke?.setup;
  const showPunchlineBtn = setupComplete && !showPunchline && !isOneLiner;
  const showNewJokeBtn = (setupComplete && isOneLiner) || (showPunchline && !isLoading);

  const handleShowPunchline = () => {
    if (punchlineTimeoutRef.current) cancel(punchlineTimeoutRef.current);

    setShowPunchline(true);
    const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onPunchlineDone = () => {
      setAvatarSrc(AVATAR_LOL);
      setPunchlineLoaded(true);
    };

    if (reducedMotion || !currentJoke?.punchline) {
      setPunchlineText(currentJoke?.punchline || '');
      onPunchlineDone();
    } else {
      startTypewriter(currentJoke.punchline, setPunchlineText, punchlineTimeoutRef, onPunchlineDone, schedule, cancel);
    }

    const updatedJoke = { ...currentJoke, punchlineShown: true };
    setCurrentJoke(updatedJoke);
    saveCachedJoke(updatedJoke);
  };

  const handleNewJoke = () => {
    if (setupTimeoutRef.current) cancel(setupTimeoutRef.current);
    if (punchlineTimeoutRef.current) cancel(punchlineTimeoutRef.current);
    
    setShowPunchline(false);
    setSetupText('');
    setPunchlineText('');
    setAvatarError(false);
    setJokeLoaded(false);
    setPunchlineLoaded(false);
    clearCachedJoke();
    setIsLoading(true);
    setThinkingText('Thinking of a good one...');
    setAvatarSrc(AVATAR_THINKING);
    setCurrentJoke(null);

    schedule(async () => {
      await fetchJoke(setupTimeoutRef);
      if (!mountedRef.current) return;
      setAvatarSrc(AVATAR_DEFAULT);
      setIsLoading(false);
      setThinkingText('');
      setJokeLoaded(true);
    }, 2000);
  };

  // Persistent live region: only complete text is announced, never the typing.
  const liveRegion = (
    <div className="sr-only" role="status" aria-live="polite">
      {setupComplete && currentJoke?.setup && <p>{currentJoke.setup}</p>}
      {showPunchline && punchlineLoaded && currentJoke?.punchline && <p>{currentJoke.punchline}</p>}
    </div>
  );

  if (isLoading) {
    return (
      <>
      {liveRegion}
      <div className="glass-card relative flex flex-col items-center space-y-8 overflow-hidden rounded-[2.5rem] p-8 text-center md:p-16">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal opacity-20 blur-3xl motion-safe:animate-pulse" />
        <div className="relative z-10">
          {!avatarError && (
            <button
              type="button"
              aria-label="Tell me a joke"
              onClick={async () => {
                await fetchJoke(setupTimeoutRef);
                if (!mountedRef.current) return;
                setAvatarSrc(AVATAR_DEFAULT);
                setIsLoading(false);
                setThinkingText('');
                setJokeLoaded(true);
              }}
              className="relative mx-auto mb-6 h-32 w-32 cursor-pointer rounded-full transition-transform hover:scale-105 motion-safe:animate-bounce focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-ink"
            >
              <Image
                src={avatarSrc}
                alt="JC thinking"
                fill
                className="object-contain"
                onError={() => setAvatarError(true)}
                unoptimized
              />
            </button>
          )}
          <p className="text-xl italic text-muted motion-safe:animate-pulse">Click me to tell you a joke...</p>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    {liveRegion}
    <div
      className="glass-card group relative flex flex-col items-center space-y-8 overflow-hidden rounded-[2.5rem] p-8 text-center md:p-16"
      aria-busy={isLoading}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-signal opacity-20 blur-3xl transition-opacity duration-1000 group-hover:opacity-35" />
      <span aria-hidden="true" className="font-display text-gradient pointer-events-none absolute left-6 top-0 select-none text-[9rem] leading-none opacity-25">&ldquo;</span>

      <div className="relative z-10 flex w-full flex-col items-center gap-8 sm:flex-row">
        {/* Joke text */}
        <div className="flex-1 space-y-6 text-center">
          {currentJoke ? (
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
          ) : (
            <p className="text-xl italic text-muted">No jokes found. Our joke teller is currently on a break! 😴</p>
          )}
        </div>

        {/* Avatar */}
        {!avatarError && currentJoke && (
          <m.div
            key={avatarSrc}
            className="relative h-28 w-28 flex-shrink-0 md:h-36 md:w-36"
            initial={{ scale: 0.7, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 14 }}
          >
            <Image
              src={avatarSrc}
              alt="JC's reaction"
              fill
              className="object-contain drop-shadow-lg"
              onError={() => setAvatarError(true)}
              unoptimized
            />
          </m.div>
        )}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4 pt-4 sm:flex-row">
        {showPunchlineBtn && (
          <button onClick={handleShowPunchline} className={primaryBtn}>
            See Punchline!
          </button>
        )}

        {showNewJokeBtn && (
          <button onClick={handleNewJoke} className={primaryBtn}>
            Get Another Joke!
          </button>
        )}

        {!showPunchlineBtn && !showNewJokeBtn && (
          <button onClick={handleNewJoke} className={primaryBtn}>
            Get Another Joke
          </button>
        )}

        <a
          href="https://chromewebstore.google.com/detail/fplggjklhidneilngfdodbbpkapamcld?utm_source=item-share-cb"
          target="_blank"
          rel="noopener noreferrer"
          className={ghostBtn}
        >
          Download the extension
        </a>
      </div>
    </div>
    </>
  );
}
