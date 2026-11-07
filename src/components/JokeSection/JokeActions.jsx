'use client';

import { primaryBtn, ghostBtn } from './constants';

export default function JokeActions({ showPunchlineBtn, showNewJokeBtn, onShowPunchline, onNewJoke }) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-4 pt-4 sm:flex-row">
      {showPunchlineBtn && (
        <button onClick={onShowPunchline} className={primaryBtn}>
          See Punchline!
        </button>
      )}

      {showNewJokeBtn && (
        <button onClick={onNewJoke} className={primaryBtn}>
          Get Another Joke!
        </button>
      )}

      {!showPunchlineBtn && !showNewJokeBtn && (
        <button onClick={onNewJoke} className={primaryBtn}>
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
  );
}
