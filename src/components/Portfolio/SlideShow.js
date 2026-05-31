'use client'

import React, { useState, useEffect, useCallback } from 'react';
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

    useEffect(() => {
        if (!hasItems) return;

        const handleKeyDown = (event) => {
            if (event.key === 'ArrowLeft') {
                goToPrevious();
            } else if (event.key === 'ArrowRight') {
                goToNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hasItems, goToPrevious, goToNext]);

    if (!hasItems) return null;

    return (
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 md:w-1/2" role="region" aria-roledescription="carousel" aria-label="Portfolio slideshow">
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
