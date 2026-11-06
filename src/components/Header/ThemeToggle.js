"use client";

import { useId } from "react";
import { useThemeSwitch } from '@/hooks/useThemeSwitch';

/**
 * Sun/moon morph. The visual state is driven purely by the `dark` class on <html>
 * (so it is correct before hydration); the hook only performs the toggle.
 */
export default function ThemeToggle() {
  const [mode, setMode] = useThemeSwitch();
  const maskId = `theme-mask-${useId().replace(/:/g, '')}`;

  return (
    <button
      type="button"
      onClick={() => setMode(mode === "light" ? "dark" : "light")}
      className="group/theme relative flex h-9 w-9 items-center justify-center rounded-full text-dark transition-colors hover:bg-dark/5 dark:text-white dark:hover:bg-white/10"
      aria-label="Toggle theme"
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
        className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:rotate-[40deg]"
      >
        <mask id={maskId}>
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <circle
            cx="24"
            cy="0"
            r="8"
            fill="black"
            className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none [transform:translate(0,0)] dark:[transform:translate(-11px,6px)]"
          />
        </mask>
        <circle
          cx="12"
          cy="12"
          r="5"
          fill="currentColor"
          mask={`url(#${maskId})`}
          className="origin-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:[transform:scale(1.35)]"
        />
        <g className="origin-center transition-all duration-500 ease-out motion-reduce:transition-none dark:scale-50 dark:opacity-0">
          <path d="M12 1.5v2.5M12 20v2.5M1.5 12H4M20 12h2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" />
        </g>
      </svg>
    </button>
  );
}
