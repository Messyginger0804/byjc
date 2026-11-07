'use client';

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import ThemeToggle from './ThemeToggle';
import Socials from '../Socials/Index';
import { navItems, externalNavItem, isActivePath } from './navItems';
import { trapDialogFocus } from '../../lib/modalFocus';

const EASE = [0.22, 1, 0.36, 1];
const noopSubscribe = () => () => {};
const useIsClient = () => useSyncExternalStore(noopSubscribe, () => true, () => false);

/**
 * Hamburger + full-screen animated overlay menu (portaled to <body> so the transformed,
 * hide-on-scroll header cannot become its containing block). Locks body scroll, closes on
 * Escape / link click, traps focus and restores it to the toggle on close.
 */
export default function MobileNav({ baseUrl = '' }) {
    const [open, setOpen] = useState(false);
    const [openPath, setOpenPath] = useState(null);
    const reduceMotion = useReducedMotion();
    const toggleRef = useRef(null);
    const overlayRef = useRef(null);
    const pathname = usePathname();
    const isClient = useIsClient();

    // Browser Back/Forward keeps this component mounted: close the menu when the route changes.
    if (openPath !== pathname) {
        setOpenPath(pathname);
        if (open) setOpen(false);
    }

    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (!open) return undefined;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.documentElement.dataset.menuOpen = 'true';
        const toggle = toggleRef.current;
        overlayRef.current?.querySelector('a')?.focus();

        const onKeyDown = (event) => {
            if (event.key === 'Escape') close();
            else trapDialogFocus(event, overlayRef.current);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = prevOverflow;
            delete document.documentElement.dataset.menuOpen;
            window.removeEventListener('keydown', onKeyDown);
            toggle?.focus();
        };
    }, [open, close]);

    // Close when the viewport grows past the `md` breakpoint (the overlay is md:hidden).
    useEffect(() => {
        if (!open || typeof window.matchMedia !== 'function') return undefined;
        const mq = window.matchMedia('(min-width: 768px)');
        const onChange = (e) => {
            if (e.matches) setOpen(false);
        };
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, [open]);

    const overlay = (
        <AnimatePresence>
            {open && (
                <m.div
                    key="mobile-overlay"
                    ref={overlayRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Site menu"
                    className="fixed inset-0 z-[110] flex flex-col overflow-y-auto overflow-x-hidden overscroll-contain bg-paper/95 px-6 pb-8 pt-5 text-dark backdrop-blur-2xl dark:bg-ink/95 dark:text-white md:hidden"
                    initial={{ clipPath: 'circle(0% at 90% 5%)' }}
                    animate={{ clipPath: 'circle(150% at 90% 5%)' }}
                    exit={{ clipPath: 'circle(0% at 90% 5%)' }}
                    transition={{ duration: reduceMotion ? 0 : 0.55, ease: EASE }}
                >
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -bottom-24 -right-24 h-[26rem] w-[26rem] rounded-full opacity-70 blur-3xl"
                            style={{ background: 'radial-gradient(closest-side, rgb(139 92 246 / 0.28), rgb(107 155 255 / 0.12) 60%, transparent)' }}
                        />
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -left-32 top-1/3 h-80 w-80 rounded-full opacity-60 blur-3xl"
                            style={{ background: 'radial-gradient(closest-side, rgb(107 155 255 / 0.22), transparent)' }}
                        />
                    </div>
                    <div className="relative flex items-center justify-between">
                        <span className="eyebrow">Menu</span>
                        <button
                            type="button"
                            onClick={close}
                            aria-label="Close menu"
                            className="flex h-11 w-11 items-center justify-center rounded-full glass text-2xl leading-none"
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>

                    <nav id="mobile-nav" aria-label="Mobile" className="relative flex flex-1 flex-col justify-center py-6">
                        <ul className="flex flex-col gap-3">
                            {navItems.map(({ label, path }, i) => {
                                const active = isActivePath(pathname, path);
                                return (
                                    <li key={path} className="overflow-hidden">
                                        <m.div
                                            initial={{ y: '110%' }}
                                            animate={{ y: 0 }}
                                            exit={{ y: '110%' }}
                                            transition={{ duration: reduceMotion ? 0 : 0.6, ease: EASE, delay: reduceMotion ? 0 : 0.1 + i * 0.07 }}
                                        >
                                            <Link
                                                href={`${baseUrl}${path}`}
                                                onClick={close}
                                                aria-current={active ? 'page' : undefined}
                                                className={`block font-display text-[clamp(3.25rem,17vw,5.5rem)] font-bold leading-[1.05] tracking-[-0.035em] ${
                                                    active ? 'text-gradient' : 'text-dark dark:text-white'
                                                }`}
                                            >
                                                {label}
                                            </Link>
                                        </m.div>
                                    </li>
                                );
                            })}
                            <li className="overflow-hidden">
                                <m.div
                                    initial={{ y: '110%' }}
                                    animate={{ y: 0 }}
                                    exit={{ y: '110%' }}
                                    transition={{ duration: reduceMotion ? 0 : 0.6, ease: EASE, delay: reduceMotion ? 0 : 0.1 + navItems.length * 0.07 }}
                                >
                                    <a
                                        href={externalNavItem.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={close}
                                        className="block font-display text-[clamp(2rem,10vw,3.25rem)] font-bold leading-[1.15] tracking-[-0.03em] text-accent dark:text-accent-bright"
                                    >
                                        {externalNavItem.label} <span aria-hidden="true">&#8599;</span>
                                        <span className="sr-only"> (DFW Software Consulting, opens in a new tab)</span>
                                    </a>
                                </m.div>
                            </li>
                        </ul>
                    </nav>

                    <m.div
                        className="relative flex flex-col gap-4 border-t border-dark/10 pt-5 dark:border-white/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : 0.45 }}
                    >
                        <div className="flex items-center justify-between">
                            <span className="eyebrow">Elsewhere</span>
                            <Socials />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="eyebrow">Theme</span>
                            <ThemeToggle />
                        </div>
                    </m.div>
                </m.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <button
                ref={toggleRef}
                type="button"
                className="relative flex h-11 w-11 items-center justify-center rounded-full glass md:hidden"
                onClick={() => setOpen((isOpen) => !isOpen)}
                aria-label="Hamburger Menu"
                aria-expanded={open}
                aria-controls={open ? 'mobile-nav' : undefined}
            >
                <span aria-hidden="true" className="relative block h-3 w-5">
                    <span className="absolute left-0 top-0 h-0.5 w-full rounded bg-dark dark:bg-white" />
                    <span className="absolute bottom-0 left-0 h-0.5 w-3 rounded bg-dark dark:bg-white" />
                </span>
            </button>
            {isClient ? createPortal(overlay, document.body) : null}
        </>
    );
}
