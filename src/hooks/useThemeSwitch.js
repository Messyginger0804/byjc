"use client";

import { useEffect, useRef, useState } from "react";

export function useThemeSwitch() {
    const preferDarkQuery = "(prefers-color-scheme: dark)";
    const storageKey = "theme";
    const syncEvent = "theme-switch-sync";

    const toggleTheme = (theme) => {
        if (typeof window !== "undefined") {
            if (theme === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
            const changed = window.localStorage.getItem(storageKey) !== theme;
            window.localStorage.setItem(storageKey, theme);
            // Keep every mounted toggle (desktop + mobile menu) in step.
            if (changed) window.dispatchEvent(new Event(syncEvent));
        }
    };

    const getUserPreference = () => {
        if (typeof window !== "undefined") {
            const userPref = window.localStorage.getItem(storageKey);
            if (userPref) {
                return userPref;
            }
            return window.matchMedia(preferDarkQuery).matches ? "dark" : "light";
        }
        return "light"; // Default to light theme if window is not defined
    };

    const [mode, setMode] = useState("light");

    useEffect(() => {
        const mediaQuery = window.matchMedia(preferDarkQuery);
        const handleChange = () => {
            const newMode = getUserPreference();
            setMode(newMode);
            toggleTheme(newMode);
        };

        handleChange();

        mediaQuery.addEventListener("change", handleChange);
        window.addEventListener(syncEvent, handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
            window.removeEventListener(syncEvent, handleChange);
        };
    }, []);

    // Skip the first run: `mode` is still the "light" placeholder there, and applying it would
    // overwrite a stored (or system) dark preference before the effect above has read it.
    const hydrated = useRef(false);
    useEffect(() => {
        if (!hydrated.current) {
            hydrated.current = true;
            return;
        }
        toggleTheme(mode);
    }, [mode]);

    return [mode, setMode];
}
