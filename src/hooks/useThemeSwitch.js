"use client";

import { useEffect, useLayoutEffect, useState } from "react";

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

    // Keep the initial render's value identical on server and client ("light")
    // so hydration doesn't mismatch — the real preference depends on
    // localStorage/matchMedia, which don't exist on the server. Correct it in
    // useLayoutEffect below, which runs after hydration but before the browser
    // paints, so there's no visible flash even though the initial value is
    // technically wrong for a split second.
    const [mode, setMode] = useState("light");

    useLayoutEffect(() => {
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
