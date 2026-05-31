"use client";

import { useThemeSwitch } from '@/hooks/useThemeSwitch';
import { cssFunc } from '@/utils';
import { MdLightMode, MdDarkMode } from 'react-icons/md';

export default function ThemeToggle() {
  const [mode, setMode] = useThemeSwitch();

  return (
    <button
      onClick={() => setMode(mode === "light" ? "dark" : "light")}
      className={cssFunc(
        "w-6 h-6 ease ml-2 flex items-center justify-center rounded-full p-1 shadow-sm hover:scale-110 transition-transform",
        mode === "light" ? "bg-dark text-light" : "bg-light text-dark"
      )}
      aria-label="theme-switcher"
    >
      {mode === "light" ? (
        <MdDarkMode className={"fill-light"} />
      ) : (
        <MdLightMode className={"fill-dark"} />
      )}
    </button>
  );
}
