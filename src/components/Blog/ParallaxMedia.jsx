'use client';

import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

/**
 * Subtle scroll parallax (transform only) for a hero image. The image is rendered
 * server-side as children, so it is never gated behind JS (LCP safe).
 */
export default function ParallaxMedia({ className = '', children }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '5%']);
    const reduce = useReducedMotion();
    return (
        <div ref={ref} className={className}>
            <m.div className="absolute inset-x-0 -top-[6%] h-[112%]" style={reduce ? undefined : { y }}>
                {children}
            </m.div>
        </div>
    );
}
