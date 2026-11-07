'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AVATAR_DEFAULT, AVATAR_THINKING } from './constants';
import { runInitialLoad } from './initialLoad';
import { fetchRandomJoke, revealPunchline, resetForNewJoke, deriveFlags } from './jokeActions';
import { loadCachedJoke } from './jokeStorage';

function useJokeTimers() {
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

  return { setupTimeoutRef, punchlineTimeoutRef, mountedRef, timersRef, schedule, cancel };
}

function useInitialLoad({ ui, fetchJoke, schedule, cancel, mountedRef, setupTimeoutRef, timersRef }) {
  useEffect(() => {
    const cached = loadCachedJoke();

    mountedRef.current = true;
    const timers = timersRef.current;

    runInitialLoad({ cached, ui, schedule, cancel, fetchJoke, mountedRef, setupTimeoutRef });

    return () => {
      mountedRef.current = false;
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, [ui, fetchJoke, schedule, cancel, mountedRef, setupTimeoutRef, timersRef]);
}

function useJokeFetch({ ui, schedule, cancel, mountedRef, setupTimeoutRef }) {
  const fetchJoke = useCallback(
    (timeoutRef) => fetchRandomJoke({ ui, timeoutRef, schedule, cancel, mountedRef }),
    [ui, schedule, cancel, mountedRef],
  );

  // Fetch a fresh joke, then settle the UI into the "ready" state.
  // Returns false if the component unmounted meanwhile.
  const fetchAndSettle = useCallback(async () => {
    await fetchJoke(setupTimeoutRef);
    if (!mountedRef.current) return false;
    ui.setAvatarSrc(AVATAR_DEFAULT);
    ui.setIsLoading(false);
    ui.setThinkingText('');
    ui.setJokeLoaded(true);
    return true;
  }, [fetchJoke, ui, mountedRef, setupTimeoutRef]);

  return { fetchJoke, fetchAndSettle };
}

export function useJokeSection() {
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

  const { setupTimeoutRef, punchlineTimeoutRef, mountedRef, timersRef, schedule, cancel } = useJokeTimers();

  const ui = useMemo(() => ({
    setCurrentJoke, setIsOneLiner, setSetupText, setPunchlineText, setShowPunchline,
    setAvatarSrc, setAvatarError, setJokeLoaded, setPunchlineLoaded, setIsLoading, setThinkingText,
  }), []);

  const { fetchJoke, fetchAndSettle } = useJokeFetch({ ui, schedule, cancel, mountedRef, setupTimeoutRef });

  useInitialLoad({ ui, fetchJoke, schedule, cancel, mountedRef, setupTimeoutRef, timersRef });

  const { setupComplete, showPunchlineBtn, showNewJokeBtn } = deriveFlags({
    isLoading, jokeLoaded, setupText, currentJoke, showPunchline, isOneLiner,
  });

  const handleShowPunchline = () => revealPunchline({ currentJoke, ui, punchlineTimeoutRef, schedule, cancel });

  const handleNewJoke = () => {
    resetForNewJoke({ ui, setupTimeoutRef, punchlineTimeoutRef, cancel });
    schedule(fetchAndSettle, 2000);
  };

  return {
    currentJoke,
    isLoading,
    setupText,
    punchlineText,
    showPunchline,
    avatarSrc,
    avatarError,
    setAvatarError,
    punchlineLoaded,
    setupComplete,
    showPunchlineBtn,
    showNewJokeBtn,
    handleShowPunchline,
    handleNewJoke,
    handleTellJoke: fetchAndSettle,
  };
}
