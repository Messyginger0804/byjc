// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { deriveFlags } from './jokeActions';

const base = { isLoading: false, jokeLoaded: true, setupText: 'S', currentJoke: { setup: 'S' }, showPunchline: false, isOneLiner: false };

describe('deriveFlags', () => {
  it('offers the punchline once the setup is fully typed', () => {
    expect(deriveFlags(base)).toEqual({ setupComplete: true, showPunchlineBtn: true, showNewJokeBtn: false });
  });
  it('offers a new joke for one-liners', () => {
    expect(deriveFlags({ ...base, isOneLiner: true })).toMatchObject({ showPunchlineBtn: false, showNewJokeBtn: true });
  });
  it('is incomplete while typing', () => {
    expect(deriveFlags({ ...base, setupText: 'Sx'.slice(0, 0) })).toMatchObject({ setupComplete: false, showPunchlineBtn: false });
  });
  it('offers a new joke after the punchline when not loading', () => {
    expect(deriveFlags({ ...base, showPunchline: true })).toMatchObject({ showNewJokeBtn: true, showPunchlineBtn: false });
  });
});
