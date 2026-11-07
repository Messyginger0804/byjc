"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

const PREFER_DARK_QUERY = "(prefers-color-scheme: dark)";
const STORAGE_KEY = "theme";
const SYNC_EVENT = "theme-switch-sync";

// The stored choice wins; otherwise follow the system preference. Reads only, never writes.
function getSnapshot() {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia(PREFER_DARK_QUERY).matches ? "dark" : "light";
}

// Server and hydration render use the light placeholder; the store then re-reads on the client.
const getServerSnapshot = () => "light";

function subscribe(onChange) {
    const mediaQuery = window.matchMedia(PREFER_DARK_QUERY);
    mediaQuery.addEventListener("change", onChange);
    window.addEventListener(SYNC_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
        mediaQuery.removeEventListener("change", onChange);
        window.removeEventListener(SYNC_EVENT, onChange);
        window.removeEventListener("storage", onChange);
    };
}

/**
 * Theme mode shared by every mounted toggle. localStorage is written only when the user changes
 * the mode (setMode), never on mount, so it is safe under StrictMode's double-invoked effects.
 */
export function useThemeSwitch() {
    const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    // Reflect the resolved mode on <html>; idempotent, no storage writes.
    useEffect(() => {
        document.documentElement.classList.toggle("dark", mode === "dark");
    }, [mode]);

    const setMode = useCallback((next) => {
        const value = typeof next === "function" ? next(getSnapshot()) : next;
        if (window.localStorage.getItem(STORAGE_KEY) !== value) {
            window.localStorage.setItem(STORAGE_KEY, value);
            // useSyncExternalStore listeners in this tab (desktop + mobile toggles) re-read.
            window.dispatchEvent(new Event(SYNC_EVENT));
        }
    }, []);

    return [mode, setMode];
}
