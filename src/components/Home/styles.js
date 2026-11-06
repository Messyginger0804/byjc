// Shared class strings for the home sections.
export const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2";

export const primaryCta = `inline-flex items-center gap-2 rounded-full bg-signal-cta px-7 py-3.5 font-semibold text-white shadow-glow transition-transform hover:scale-[1.03] ${focusRing}`;

export const ghostCta = `glass inline-flex items-center rounded-full px-7 py-3.5 font-semibold transition-colors hover:border-accent dark:hover:border-accent-bright ${focusRing}`;

export const textLink = `font-mono-jb text-xs uppercase tracking-[0.2em] text-accent dark:text-accent-bright hover:underline underline-offset-4 rounded ${focusRing}`;
