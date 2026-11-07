// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { restoreShown, restoreSetup } from './initialLoad';

const makeUi = () => new Proxy({}, { get: (t, k) => (t[k] ??= vi.fn()) });
const JOKE = { setup: 'S', punchline: 'P', isOneLiner: false };

describe('initialLoad', () => {
  it('restoreShown restores setup, punchline and the lol avatar', () => {
    const ui = makeUi();
    restoreShown(JOKE, ui);
    expect(ui.setSetupText).toHaveBeenCalledWith('S');
    expect(ui.setPunchlineText).toHaveBeenCalledWith('P');
    expect(ui.setShowPunchline).toHaveBeenCalledWith(true);
    expect(ui.setAvatarSrc).toHaveBeenCalledWith('/assets/mes/lol.png');
    expect(ui.setPunchlineLoaded).toHaveBeenCalledWith(true);
  });

  it('restoreShown defaults a missing punchline to empty', () => {
    const ui = makeUi();
    restoreShown({ setup: 'S', isOneLiner: true }, ui);
    expect(ui.setPunchlineText).toHaveBeenCalledWith('');
  });

  it('restoreSetup types the setup and uses the default avatar', () => {
    const ui = makeUi();
    window.matchMedia = () => ({ matches: true });
    restoreSetup(JOKE, ui, { current: null }, setTimeout, clearTimeout);
    expect(ui.setSetupText).toHaveBeenCalledWith('S');
    expect(ui.setAvatarSrc).toHaveBeenCalledWith('/assets/mes/intro.png');
    expect(ui.setJokeLoaded).toHaveBeenCalledWith(true);
  });
});
