'use client'

import React, { useState } from 'react';
import { BiArrowToLeft, BiArrowToRight } from 'react-icons/bi';

function SlideShow({ items, renderItem }) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!items?.length) return null;

    const goToPrevious = () => {
        setActiveIndex((currentIndex) =>
            currentIndex === 0 ? items.length - 1 : currentIndex - 1
        );
    };

    const goToNext = () => {
        setActiveIndex((currentIndex) =>
            currentIndex === items.length - 1 ? 0 : currentIndex + 1
        );
    };

    return (
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 md:w-1/2">
            <button
                type="button"
                onClick={goToPrevious}
                aria-label="Previous slide"
                className="shrink-0"
            >
                <BiArrowToLeft className="text-4xl text-white" />
            </button>
            <div className="flex min-w-0 flex-1 justify-center gap-3 overflow-hidden">
                {renderItem(items[activeIndex])}
            </div>
            <button
                type="button"
                onClick={goToNext}
                aria-label="Next slide"
                className="shrink-0"
            >
                <BiArrowToRight className="text-4xl text-white" />
            </button>
        </div>
    );
}

export default SlideShow;
