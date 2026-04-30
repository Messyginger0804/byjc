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

function startTypewriter(text, setter, timeoutRef) {
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (reducedMotion || !text) {
    setter(text);
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
  const [thinkingText, setThinkingText] = useState('Thinking of a good one...');
  const [isOneLiner, setIsOneLiner] = useState(false);
  const [jokeLoaded, setJokeLoaded] = useState(false);
  const [punchlineLoaded, setPunchlineLoaded] = useState(false);

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
    
    const initialize = async () => {
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
    };

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
    
    if (reducedMotion || !currentJoke?.punchline) {
      setPunchlineText(currentJoke?.punchline || '');
    } else {
      startTypewriter(currentJoke.punchline, setPunchlineText, punchlineTimeoutRef);
    }
    
    setAvatarSrc(AVATAR_LOL);
    setPunchlineLoaded(true);
    
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
      <div className="glass rounded-[2.5rem] p-8 md:p-16 shadow-modern flex flex-col items-center text-center space-y-8 relative overflow-hidden">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent to-accentDark rounded-[2.5rem] blur opacity-10"></div>
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
              className="w-32 h-32 mx-auto mb-6 relative cursor-pointer hover:scale-105 transition-transform animate-bounce"
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
          <p className="text-xl opacity-60 italic animate-pulse">Click me to tell you a joke...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="glass rounded-[2.5rem] p-8 md:p-16 shadow-modern flex flex-col items-center text-center space-y-8 relative overflow-hidden group"
      aria-busy={isLoading}
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-accent to-accentDark rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
      
      <div className="relative z-10 space-y-6">
        {currentJoke ? (
          <>
            <p className="text-2xl md:text-4xl font-semibold tracking-tight text-balance leading-tight">
              {setupText}
            </p>
            
            {showPunchline && (
              <>
                <div className="h-px w-24 bg-accent dark:bg-accentDark mx-auto opacity-30" />
                <p className="text-xl md:text-3xl text-accent dark:text-accentDark italic font-medium tracking-tight leading-relaxed animate-fade-in">
                  {punchlineText}
                </p>
              </>
            )}
          </>
        ) : (
          <p className="text-xl opacity-60 italic">No jokes found. Our joke teller is currently on a break! 😴</p>
        )}
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row gap-6 pt-8">
        {showPunchlineBtn && (
          <button
            onClick={handleShowPunchline}
            className="btn-primary"
          >
            See Punchline!
          </button>
        )}
        
        {showNewJokeBtn && (
          <button
            onClick={handleNewJoke}
            className="btn-primary"
          >
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
          className="btn-primary"
        >
          Download the extension
        </a>
      </div>

      {!avatarError && currentJoke && (
        <div className="absolute top-4 right-4 md:top-8 md:right-8 w-16 h-16 md:w-24 md:h-24">
          <div className="relative w-full h-full group-hover:scale-110 transition-transform duration-500">
            <Image
              src={avatarSrc}
              alt="JC's reaction"
              fill
              className="object-contain drop-shadow-lg"
              onError={() => setAvatarError(true)}
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}