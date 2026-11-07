import { AVATAR_DEFAULT, AVATAR_THINKING, AVATAR_LOL } from './constants';
import { startTypewriter } from './jokeStorage';

// `ui` is an object of the hook's state setters.
export function restoreShown(cached, ui) {
  ui.setCurrentJoke(cached);
  ui.setIsOneLiner(cached.isOneLiner);
  ui.setSetupText(cached.setup);
  ui.setPunchlineText(cached.punchline || '');
  ui.setShowPunchline(true);
  ui.setAvatarSrc(AVATAR_LOL);
  ui.setJokeLoaded(true);
  ui.setPunchlineLoaded(true);
}

export function restoreSetup(cached, ui, setupTimeoutRef, schedule, cancel) {
  ui.setCurrentJoke(cached);
  ui.setIsOneLiner(cached.isOneLiner);
  // startTypewriter sets the full text immediately under reduced motion.
  startTypewriter(cached.setup, ui.setSetupText, setupTimeoutRef, undefined, schedule, cancel);
  ui.setAvatarSrc(AVATAR_DEFAULT);
  ui.setJokeLoaded(true);
}

// Returns false if the component unmounted before the load finished.
export async function runInitialLoad({ cached, ui, schedule, cancel, fetchJoke, mountedRef, setupTimeoutRef }) {
  ui.setAvatarSrc(AVATAR_THINKING);
  ui.setAvatarError(false);

  await new Promise((resolve) => schedule(resolve, 2000));
  if (!mountedRef.current) return false;

  if (cached?.punchlineShown) {
    restoreShown(cached, ui);
  } else if (cached) {
    restoreSetup(cached, ui, setupTimeoutRef, schedule, cancel);
  } else {
    await fetchJoke(setupTimeoutRef);
    if (!mountedRef.current) return false;
    ui.setAvatarSrc(AVATAR_DEFAULT);
    ui.setJokeLoaded(true);
  }

  ui.setIsLoading(false);
  ui.setThinkingText('');
  return true;
}
