'use client';

/**
 * Smooth-scrolls to the top of the page; jumps instantly when the visitor prefers reduced motion.
 */
export default function BackToTop({ className = '' }) {
    const onClick = () => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    };
    return (
        <button type="button" onClick={onClick} className={className}>
            Back to top <span aria-hidden="true">&uarr;</span>
        </button>
    );
}
