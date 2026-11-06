'use client'

import React, { useState, useCallback } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { BiArrowToLeft, BiArrowToRight } from 'react-icons/bi';

const EASE_OUT = [0.22, 1, 0.36, 1];

const navButton =
    "grid h-12 w-12 shrink-0 place-items-center rounded-full glass text-2xl text-dark dark:text-[#e8e9ee] transition-all duration-300 hover:bg-accent hover:text-white dark:hover:bg-accent-bright dark:hover:text-ink active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-ink";

// `custom` carries { dir, reduce } so the exiting slide uses the *current* motion preference.
const variants = {
    enter: ({ dir, reduce }) => ({ opacity: 0, x: reduce ? 0 : dir * 48, scale: reduce ? 1 : 0.97 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: ({ dir, reduce }) => ({ opacity: 0, x: reduce ? 0 : dir * -48, scale: reduce ? 1 : 0.97 }),
};

function SlideShow({ items, renderItem, label = 'Portfolio slideshow' }) {
    const [[activeIndex, direction], setSlide] = useState([0, 1]);
    const reduceMotion = useReducedMotion();
    const count = items?.length ?? 0;
    const custom = { dir: direction, reduce: !!reduceMotion };
    const hasItems = count > 0;

    const goToPrevious = useCallback(() => {
        setSlide(([i]) => [i === 0 ? count - 1 : i - 1, -1]);
    }, [count]);

    const goToNext = useCallback(() => {
        setSlide(([i]) => [i === count - 1 ? 0 : i + 1, 1]);
    }, [count]);

    const handleKeyDown = (event) => {
        const isArrow = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
        // The focused link inside the exiting slide is about to unmount: keep focus in the carousel.
        if (isArrow && event.target.closest?.('[aria-roledescription="slide"]')) {
            event.currentTarget.focus();
        }
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            goToPrevious();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            goToNext();
        }
    };

    if (!hasItems) return null;

    return (
        <div
            className="mx-auto w-full max-w-md rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-4 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-ink"
            role="region"
            aria-roledescription="carousel"
            aria-label={label}
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <div className="relative overflow-hidden px-1 py-3" aria-live="polite" aria-atomic="true">
                <AnimatePresence mode="wait" initial={false} custom={custom}>
                    <m.div
                        key={activeIndex}
                        custom={custom}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: reduceMotion ? 0.01 : 0.35, ease: EASE_OUT }}
                        role="group"
                        aria-roledescription="slide"
                        aria-label={`${activeIndex + 1} of ${count}`}
                    >
                        {renderItem(items[activeIndex])}
                    </m.div>
                </AnimatePresence>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
                <button type="button" onClick={goToPrevious} aria-label="Previous slide" className={navButton}>
                    <BiArrowToLeft aria-hidden="true" />
                </button>
                <div className="flex items-center gap-1.5" aria-hidden="true">
                    {items.map((_, i) => (
                        <span
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                                i === activeIndex ? 'w-6 bg-signal' : 'w-1.5 bg-dark/20 dark:bg-white/25'
                            }`}
                        />
                    ))}
                </div>
                <button type="button" onClick={goToNext} aria-label="Next slide" className={navButton}>
                    <BiArrowToRight aria-hidden="true" />
                </button>
            </div>
            <p className="sr-only">Use the left and right arrow keys to change slides.</p>
        </div>
    );
}

export default SlideShow;
