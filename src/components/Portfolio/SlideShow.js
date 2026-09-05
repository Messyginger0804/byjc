'use client'

import React, { useState, useCallback } from 'react';
import { BiArrowToLeft, BiArrowToRight } from 'react-icons/bi';

function SlideShow({ items, renderItem }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const hasItems = items?.length > 0;

    const goToPrevious = useCallback(() => {
        setActiveIndex((currentIndex) =>
            currentIndex === 0 ? items.length - 1 : currentIndex - 1
        );
    }, [items]);

    const goToNext = useCallback(() => {
        setActiveIndex((currentIndex) =>
            currentIndex === items.length - 1 ? 0 : currentIndex + 1
        );
    }, [items]);

    // Scoped to this carousel via onKeyDown + tabIndex instead of a window
    // listener — otherwise arrow keys would drive whichever slideshow mounted
    // last, regardless of which one (if any) the user is actually focused on.
    const handleKeyDown = useCallback((event) => {
        if (event.key === 'ArrowLeft') {
            goToPrevious();
        } else if (event.key === 'ArrowRight') {
            goToNext();
        }
    }, [goToPrevious, goToNext]);

    if (!hasItems) return null;

    return (
        <div
            className="mx-auto flex w-full max-w-4xl items-center gap-3 md:w-1/2"
            role="region"
            aria-roledescription="carousel"
            aria-label="Portfolio slideshow"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <button
                type="button"
                onClick={goToPrevious}
                aria-label="Previous slide"
                className="shrink-0"
            >
                <BiArrowToLeft className="text-4xl text-dark dark:text-light" />
            </button>
            <div className="flex min-w-0 flex-1 justify-center gap-3 overflow-hidden" aria-live="polite">
                {renderItem(items[activeIndex])}
            </div>
            <button
                type="button"
                onClick={goToNext}
                aria-label="Next slide"
                className="shrink-0"
            >
                <BiArrowToRight className="text-4xl text-dark dark:text-light" />
            </button>
        </div>
    );
}

export default SlideShow;
