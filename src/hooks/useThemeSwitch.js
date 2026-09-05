"use client";

import { useEffect, useState } from "react";

export function useThemeSwitch() {
    const preferDarkQuery = "(prefers-color-scheme: dark)";
    const storageKey = "theme";

    const toggleTheme = (theme) => {
        if (typeof window !== "undefined") {
            if (theme === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
            window.localStorage.setItem(storageKey, theme);
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

    // Initialize synchronously from the same source the pre-hydration inline
    // script (in layout.js) reads, so the toggle icon doesn't flash the wrong
    // state on first paint when the site loads in dark mode.
    const [mode, setMode] = useState(getUserPreference);

    useEffect(() => {
        const mediaQuery = window.matchMedia(preferDarkQuery);
        const handleChange = () => {
            const newMode = getUserPreference();
            setMode(newMode);
            toggleTheme(newMode);
        };

        handleChange();

        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    useEffect(() => {
        toggleTheme(mode);
    }, [mode]);

    return [mode, setMode];
}
