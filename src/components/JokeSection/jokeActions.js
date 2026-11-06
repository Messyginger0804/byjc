import { AVATAR_THINKING, AVATAR_LOL } from './constants';
import { saveCachedJoke, clearCachedJoke, startTypewriter } from './jokeStorage';

// `ui` is an object of the hook's state setters.
export async function fetchRandomJoke({ ui, timeoutRef, schedule, cancel, mountedRef }) {
  try {
    const res = await fetch('/api/jokes/random');
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    if (!mountedRef.current) return;
    if (data) {
      ui.setCurrentJoke(data);
      ui.setIsOneLiner(data.isOneLiner);
      startTypewriter(data.setup, ui.setSetupText, timeoutRef, undefined, schedule, cancel);
      saveCachedJoke(data);
    }
  } catch {
    if (mountedRef.current) ui.setCurrentJoke(null);
  }
}

export function revealPunchline({ currentJoke, ui, punchlineTimeoutRef, schedule, cancel }) {
  if (punchlineTimeoutRef.current) cancel(punchlineTimeoutRef.current);

  ui.setShowPunchline(true);

  const onPunchlineDone = () => {
    ui.setAvatarSrc(AVATAR_LOL);
    ui.setPunchlineLoaded(true);
  };

  // startTypewriter sets the full text immediately under reduced motion or when empty.
  startTypewriter(currentJoke?.punchline || '', ui.setPunchlineText, punchlineTimeoutRef, onPunchlineDone, schedule, cancel);

  const updatedJoke = { ...currentJoke, punchlineShown: true };
  ui.setCurrentJoke(updatedJoke);
  saveCachedJoke(updatedJoke);
}

export function resetForNewJoke({ ui, setupTimeoutRef, punchlineTimeoutRef, cancel }) {
  if (setupTimeoutRef.current) cancel(setupTimeoutRef.current);
  if (punchlineTimeoutRef.current) cancel(punchlineTimeoutRef.current);

  ui.setShowPunchline(false);
  ui.setSetupText('');
  ui.setPunchlineText('');
  ui.setAvatarError(false);
  ui.setJokeLoaded(false);
  ui.setPunchlineLoaded(false);
  clearCachedJoke();
  ui.setIsLoading(true);
  ui.setThinkingText('Thinking of a good one...');
  ui.setAvatarSrc(AVATAR_THINKING);
  ui.setCurrentJoke(null);
}

export function deriveFlags({ isLoading, jokeLoaded, setupText, currentJoke, showPunchline, isOneLiner }) {
  const setupComplete = !isLoading && jokeLoaded && setupText === currentJoke?.setup;
  return {
    setupComplete,
    showPunchlineBtn: setupComplete && !showPunchline && !isOneLiner,
    showNewJokeBtn: (setupComplete && isOneLiner) || (showPunchline && !isLoading),
  };
}
