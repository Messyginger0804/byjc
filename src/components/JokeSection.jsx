'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

const AVATAR_DEFAULT = '/assets/mes/intro.png';
const AVATAR_THINKING = '/assets/mes/thinking.png';
const AVATAR_LOL = '/assets/mes/lol.png';

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

function startTypewriter(text, setter, timeoutRef, onComplete) {
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion || !text) {
    setter(text);
    onComplete?.();
    return;
  }

  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }

  let index = 0;
  setter('');

  const typeChar = () => {
    if (index < text.length) {
      setter(text.slice(0, index + 1));
      index++;
      timeoutRef.current = setTimeout(typeChar, 50);
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
  const [, setPunchlineLoaded] = useState(false);

  const setupTimeoutRef = useRef(null);
  const punchlineTimeoutRef = useRef(null);

  const fetchJoke = useCallback(async (timeoutRef) => {
    try {
      const res = await fetch('/api/jokes/random');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data) {
        setCurrentJoke(data);
        setIsOneLiner(data.isOneLiner);
        startTypewriter(data.setup, setSetupText, timeoutRef);
        saveCachedJoke(data);
      }
    } catch {
      setCurrentJoke(null);
    }
  }, []);

  useEffect(() => {
    const cached = loadCachedJoke();
    const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    (async () => {
      setAvatarSrc(AVATAR_THINKING);
      setAvatarError(false);

      await new Promise(resolve => setTimeout(resolve, 2000));

      if (cached && !cached.punchlineShown) {
        setCurrentJoke(cached);
        setIsOneLiner(cached.isOneLiner);
        if (reducedMotion) {
          setSetupText(cached.setup);
        } else {
          startTypewriter(cached.setup, setSetupText, setupTimeoutRef);
        }
        setAvatarSrc(AVATAR_DEFAULT);
        setJokeLoaded(true);
      } else {
        await fetchJoke(setupTimeoutRef);
        setAvatarSrc(AVATAR_DEFAULT);
        setJokeLoaded(true);
      }

      if (cached?.punchlineShown) {
        setCurrentJoke(cached);
        setIsOneLiner(cached.isOneLiner);
        setSetupText(cached.setup);
        setPunchlineText(cached.punchline || '');
        setShowPunchline(true);
        setAvatarSrc(AVATAR_LOL);
        setJokeLoaded(true);
        setPunchlineLoaded(true);
      }

      setIsLoading(false);
      setThinkingText('');
    })();

    const setupTimeout = setupTimeoutRef.current;
    const punchlineTimeout = punchlineTimeoutRef.current;

    return () => {
      if (setupTimeout) clearTimeout(setupTimeout);
      if (punchlineTimeout) clearTimeout(punchlineTimeout);
    };
  }, [fetchJoke]);

  const setupComplete = !isLoading && jokeLoaded && setupText === currentJoke?.setup;
  const showPunchlineBtn = setupComplete && !showPunchline && !isOneLiner;
  const showNewJokeBtn = (setupComplete && isOneLiner) || (showPunchline && !isLoading);

  const handleShowPunchline = () => {
    if (punchlineTimeoutRef.current) clearTimeout(punchlineTimeoutRef.current);

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
      startTypewriter(currentJoke.punchline, setPunchlineText, punchlineTimeoutRef, onPunchlineDone);
    }

    const updatedJoke = { ...currentJoke, punchlineShown: true };
    setCurrentJoke(updatedJoke);
    saveCachedJoke(updatedJoke);
  };

  const handleNewJoke = () => {
    if (setupTimeoutRef.current) clearTimeout(setupTimeoutRef.current);
    if (punchlineTimeoutRef.current) clearTimeout(punchlineTimeoutRef.current);
    
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

    setTimeout(async () => {
      await fetchJoke(setupTimeoutRef);
      setAvatarSrc(AVATAR_DEFAULT);
      setIsLoading(false);
      setThinkingText('');
      setJokeLoaded(true);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="glass rounded-3xl p-8 md:p-16 shadow-modern flex flex-col items-center text-center space-y-8 relative overflow-hidden">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent to-accentDark rounded-3xl blur opacity-10"></div>
        <div className="relative z-10">
          {!avatarError && (
            <button
              onClick={async () => {
                await fetchJoke(setupTimeoutRef);
                setAvatarSrc(AVATAR_DEFAULT);
                setIsLoading(false);
                setThinkingText('');
                setJokeLoaded(true);
              }}
              className="w-32 h-32 mx-auto mb-6 relative cursor-pointer hover:scale-105 transition-transform animate-bounce active:scale-95"
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
          <p className="text-xl md:text-2xl font-medium opacity-60 italic animate-pulse">Click JC to hear a joke...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="glass rounded-3xl p-8 md:p-16 shadow-modern flex flex-col items-center space-y-8 relative overflow-hidden group"
      aria-busy={isLoading}
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-accent to-accentDark rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>

      <div className="relative z-10 w-full flex flex-col sm:flex-row items-center gap-8 md:gap-12">
        {/* Joke text */}
        <div className="flex-1 space-y-6 text-center sm:text-left">
          {currentJoke ? (
            <div className="animate-fade-in">
              <p className="text-2xl md:text-4xl font-bold tracking-tight text-balance leading-tight">
                {setupText}
              </p>

              {showPunchline && (
                <div className="mt-6 animate-slide-in">
                  <div className="h-1 w-20 bg-accent dark:bg-accentDark mb-6 opacity-30 rounded-full" />
                  <p className="text-xl md:text-3xl text-accent dark:text-accentDark italic font-semibold tracking-tight leading-relaxed">
                    {punchlineText}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xl opacity-60 italic text-center w-full">No jokes found. Our joke teller is currently on a break! 😴</p>
          )}
        </div>

        {/* Avatar */}
        {!avatarError && currentJoke && (
          <div className="flex-shrink-0 w-32 h-32 md:w-48 md:h-48 relative group-hover:scale-110 transition-all duration-500 ease-out hover:rotate-3 drop-shadow-2xl">
            <Image
              src={avatarSrc}
              alt="JC's reaction"
              fill
              className="object-contain"
              onError={() => setAvatarError(true)}
              unoptimized
            />
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-wrap justify-center gap-4 md:gap-6 pt-4">
        {showPunchlineBtn && (
          <button onClick={handleShowPunchline} className="btn-primary">
            See Punchline!
          </button>
        )}

        {showNewJokeBtn && (
          <button onClick={handleNewJoke} className="btn-primary">
            Get Another Joke!
          </button>
        )}

        {!showPunchlineBtn && !showNewJokeBtn && (
          <button onClick={handleNewJoke} className="btn-primary">
            Get Another Joke
          </button>
        )}

        <a
          href="https://chromewebstore.google.com/detail/fplggjklhidneilngfdodbbpkapamcld?utm_source=item-share-cb"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex items-center gap-2"
        >
          <span>Extension</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      </div>
    </div>
  );
  }