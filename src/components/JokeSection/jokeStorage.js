const STORAGE_KEY = 'jc-joke-state';

export function loadCachedJoke() {
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

export function saveCachedJoke(joke) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(joke));
  } catch {
  }
}

export function clearCachedJoke() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
  }
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function startTypewriter(text, setter, timeoutRef, onComplete, schedule = setTimeout, cancel = clearTimeout) {
  if (prefersReducedMotion() || !text) {
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
