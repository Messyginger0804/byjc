'use client';

import { m } from 'motion/react';
import { EASE_OUT } from './Reveal';

const container = (stagger, delay) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const item = (y) => ({
  hidden: { opacity: 0, y, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'none', transition: { duration: 0.6, ease: EASE_OUT } },
});

/**
 * Container that staggers its `StaggerItem` children in when scrolled into view (once).
 *
 * @param {object} props
 * @param {string} [props.as='div']
 * @param {number} [props.stagger=0.07]  Seconds between children.
 * @param {number} [props.delay=0]
 * @param {string} [props.className]
 */
export function Stagger({ as = 'div', stagger = 0.07, delay = 0, className, children, ...rest }) {
  const Tag = m[as] || m.div;
  return (
    <Tag
      className={className}
      data-motion-hidden=""
      variants={container(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Child of `Stagger`. Inherits the variant state from the parent.
 *
 * @param {object} props
 * @param {string} [props.as='div']
 * @param {number} [props.y=24]
 * @param {string} [props.className]
 */
export function StaggerItem({ as = 'div', y = 24, className, children, ...rest }) {
  const Tag = m[as] || m.div;
  return (
    <Tag className={className} data-motion-hidden="" variants={item(y)} {...rest}>
      {children}
    </Tag>
  );
}

export default Stagger;
