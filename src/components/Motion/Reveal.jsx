'use client';

import { m } from 'motion/react';

export const EASE_OUT = [0.22, 1, 0.36, 1];

/**
 * Below-the-fold scroll reveal (opacity + rise + blur -> sharp), once.
 * Do NOT use on the LCP element / above-the-fold hero text (use the CSS `.reveal-up` classes).
 *
 * @param {object} props
 * @param {string} [props.as='div']  Tag name rendered (e.g. 'section', 'li', 'h2').
 * @param {number} [props.delay=0]   Seconds.
 * @param {number} [props.y=24]      Starting offset in px.
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Reveal({ as = 'div', delay = 0, y = 24, className, children, ...rest }) {
  const Tag = m[as] || m.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export { Reveal };
