'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { m } from 'motion/react';
import { navItems, externalNavItem, isActivePath } from './navItems';

/**
 * Desktop pill links with a shared-layout active indicator (layoutId).
 * @param {{ baseUrl?: string }} props
 */
export default function NavLinks({ baseUrl = '' }) {
  const pathname = usePathname();

  return (
    <ul className="flex items-center gap-0.5">
      {navItems.map(({ label, path }) => {
        const active = isActivePath(pathname, path);
        return (
          <li key={path}>
            <Link
              href={`${baseUrl}${path}`}
              aria-current={active ? 'page' : undefined}
              className={`relative isolate block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                active
                  ? 'text-white'
                  : 'text-dark/70 hover:text-dark dark:text-white/70 dark:hover:text-white'
              }`}
            >
              {active && (
                <m.span
                  layoutId="nav-pill"
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-full bg-ink shadow-[0_6px_20px_-6px_rgba(53,104,189,0.6)] dark:bg-white/15 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              {label}
            </Link>
          </li>
        );
      })}
      <li>
        <a
          href={externalNavItem.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-full px-4 py-2 text-sm font-medium text-dark/70 transition-colors duration-300 hover:text-dark dark:text-white/70 dark:hover:text-white"
        >
          {externalNavItem.label} <span aria-hidden="true">&#8599;</span>
          <span className="sr-only"> (DFW Software Consulting, opens in a new tab)</span>
        </a>
      </li>
    </ul>
  );
}
