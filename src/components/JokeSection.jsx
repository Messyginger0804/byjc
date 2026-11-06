'use client';

import JokeText from './JokeSection/JokeText';
import JokeAvatar from './JokeSection/JokeAvatar';
import JokeActions from './JokeSection/JokeActions';
import LoadingView from './JokeSection/LoadingView';
import { useJokeSection } from './JokeSection/useJokeSection';

export default function JokeSection() {
  const {
    currentJoke, isLoading, setupText, punchlineText, showPunchline, avatarSrc,
    avatarError, setAvatarError, punchlineLoaded, setupComplete,
    showPunchlineBtn, showNewJokeBtn, handleShowPunchline, handleNewJoke, handleTellJoke,
  } = useJokeSection();

  const onAvatarError = () => setAvatarError(true);

  // Persistent live region: only complete text is announced, never the typing.
  const liveRegion = (
    <div className="sr-only" role="status" aria-live="polite">
      {setupComplete && currentJoke?.setup && <p>{currentJoke.setup}</p>}
      {showPunchline && punchlineLoaded && currentJoke?.punchline && <p>{currentJoke.punchline}</p>}
    </div>
  );

  if (isLoading) {
    return (
      <LoadingView
        liveRegion={liveRegion}
        avatarError={avatarError}
        avatarSrc={avatarSrc}
        onTellJoke={handleTellJoke}
        onAvatarError={onAvatarError}
      />
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
          <JokeText
            currentJoke={currentJoke}
            setupText={setupText}
            showPunchline={showPunchline}
            punchlineText={punchlineText}
          />
        </div>

        {/* Avatar */}
        {!avatarError && currentJoke && <JokeAvatar avatarSrc={avatarSrc} onError={onAvatarError} />}
      </div>

      <JokeActions
        showPunchlineBtn={showPunchlineBtn}
        showNewJokeBtn={showNewJokeBtn}
        onShowPunchline={handleShowPunchline}
        onNewJoke={handleNewJoke}
      />
    </div>
    </>
  );
}
