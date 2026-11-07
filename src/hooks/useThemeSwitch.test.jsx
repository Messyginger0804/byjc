import React from 'react';
// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useThemeSwitch } from './useThemeSwitch';

function Probe() {
    const [mode, setMode] = useThemeSwitch();
    return <button type="button" onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>{mode}</button>;
}

function mockSystem(dark) {
    window.matchMedia = (query) => {
        expect(query).toBe('(prefers-color-scheme: dark)');
        return {
            matches: dark,
            addEventListener: () => {},
            removeEventListener: () => {},
        };
    };
}

beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
});
afterEach(cleanup);

describe('useThemeSwitch', () => {
    it('keeps a stored dark preference when the system prefers light', () => {
        mockSystem(false);
        window.localStorage.setItem('theme', 'dark');
        render(<Probe />);
        expect(window.localStorage.getItem('theme')).toBe('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(screen.getByRole('button').textContent).toBe('dark');
    });

    it('keeps a stored light preference when the system prefers dark', () => {
        mockSystem(true);
        window.localStorage.setItem('theme', 'light');
        render(<Probe />);
        expect(window.localStorage.getItem('theme')).toBe('light');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('falls back to the system preference and persists changes', () => {
        mockSystem(true);
        render(<Probe />);
        expect(screen.getByRole('button').textContent).toBe('dark');
        act(() => screen.getByRole('button').click());
        expect(window.localStorage.getItem('theme')).toBe('light');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('keeps a stored dark preference under React.StrictMode and does not write on mount', () => {
        mockSystem(false);
        window.localStorage.setItem('theme', 'dark');
        const setItem = vi.spyOn(Storage.prototype, 'setItem');
        render(<React.StrictMode><Probe /></React.StrictMode>);
        expect(window.localStorage.getItem('theme')).toBe('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(screen.getByRole('button').textContent).toBe('dark');
        expect(setItem).not.toHaveBeenCalled();
        setItem.mockRestore();
    });
});
