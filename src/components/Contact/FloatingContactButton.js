'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { m } from 'motion/react';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import Magnetic from '@/components/Motion/Magnetic';
import siteMetadata from '@/utils/metaData';
import { restoreFocus, trapDialogFocus } from '@/lib/modalFocus';

const ContactForm = dynamic(() => import('@/components/Contact/ContactForm'), {
  loading: () => (
    <div className="w-full animate-pulse space-y-6 p-6 md:p-8">
      <div className="h-6 w-1/3 rounded bg-dark/10 dark:bg-light/10" />
      <div className="h-12 w-full rounded-2xl bg-dark/10 dark:bg-light/10" />
      <div className="h-12 w-full rounded-2xl bg-dark/10 dark:bg-light/10" />
      <div className="h-32 w-full rounded-2xl bg-dark/10 dark:bg-light/10" />
      <div className="h-14 w-full rounded-full bg-dark/10 dark:bg-light/10" />
    </div>
  ),
});

const tabs = [
  { id: 'message', label: 'Send message' },
  { id: 'book', label: 'Book time' },
];

export default function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('message');
  const pathname = usePathname();
  const { compact } = useScrollDirection({ compactAfter: 200 });
  // Icon-only everywhere; the label is open at the top of the home page and on hover / focus-visible.
  const expanded = pathname === '/' && !compact && !isOpen;
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  const closeDialog = useCallback(() => setIsOpen(false), []);

  const openDialog = (event) => {
    previousFocusRef.current = event.currentTarget;
    setActiveTab('message');
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeDialog();
      } else {
        trapDialogFocus(event, dialogRef.current);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
      restoreFocus(previousFocusRef.current);
    };
  }, [closeDialog, isOpen]);

  if (pathname?.startsWith('/contact') && !isOpen) {
    return null;
  }

  return (
    <>
      <m.div
        className='contact-fab fixed bottom-5 right-5 z-[90] transition-opacity duration-200'
        initial={{ opacity: 0, y: 24, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.8 }}
      >
        <Magnetic strength={0.25}>
          <button
            type='button'
            onClick={openDialog}
            className='group/cta relative flex items-center overflow-hidden rounded-full glass p-2 shadow-glow transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgba(107,155,255,0.5),0_14px_44px_-8px_rgba(139,92,246,0.7)]'
            aria-haspopup='dialog'
            aria-expanded={isOpen}
            aria-controls={isOpen ? 'contact-dialog' : undefined}
            aria-label='Get in touch'
          >
            <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-signal text-white'>
              <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'></path>
              </svg>
            </span>
            <span
              aria-hidden='true'
              className={`hidden overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ease-out motion-reduce:transition-none sm:block group-hover/cta:max-w-48 group-hover/cta:opacity-100 group-focus-visible/cta:max-w-48 group-focus-visible/cta:opacity-100 ${
                expanded ? 'max-w-48 opacity-100' : 'max-w-0 opacity-0'
              }`}
            >
              <span className='block pl-2.5 pr-3 text-sm font-semibold text-dark dark:text-white md:text-base'>Get in touch</span>
            </span>
          </button>
        </Magnetic>
      </m.div>

      {isOpen && (
        <div onClick={closeDialog} className='fixed inset-0 z-[120] flex items-end justify-center bg-ink/60 p-3 backdrop-blur-sm sm:items-center sm:p-6'>
          <div
            id='contact-dialog'
            ref={dialogRef}
            tabIndex={-1}
            role='dialog'
            aria-modal='true'
            aria-label='Contact JC'
            onClick={(e) => e.stopPropagation()}
            className='glass w-full max-w-3xl max-h-[90dvh] overflow-y-auto rounded-[2rem] !bg-paper/95 p-5 text-dark shadow-glow outline-none dark:!bg-ink-2/95 dark:text-white sm:p-8'
          >
            <div className='mb-6 flex items-start justify-between gap-4'>
              <div>
                <p className='eyebrow !text-accent dark:!text-accent-bright'>Contact</p>
                <h2 className='mt-2 text-2xl font-bold tracking-tight sm:text-3xl'>Let&apos;s talk about your project</h2>
                <p className='mt-2 max-w-xl text-sm opacity-75 sm:text-base'>
                  Send a message if you want to start the conversation, or jump straight to a booking slot if you want time on the calendar.
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type='button'
                onClick={closeDialog}
                className='inline-flex h-11 w-11 items-center justify-center rounded-full border border-dark/10 text-xl transition-colors hover:bg-dark/5 dark:border-white/10 dark:hover:bg-white/10'
                aria-label='Close contact dialog'
              >
                ×
              </button>
            </div>

            <div className='mb-6 inline-flex rounded-full border border-dark/10 p-1 dark:border-white/10' role='group' aria-label='Contact method'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type='button'
                  aria-pressed={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-colors sm:px-5 ${
                    activeTab === tab.id
                      ? 'bg-signal-cta text-white'
                      : 'text-dark/70 hover:text-accent dark:text-white/70 dark:hover:text-accent-bright'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'message' ? (
              <ContactForm showBookingLink={false} className='p-6 md:p-8' />
            ) : (
              <div className='glass rounded-[2rem] p-6 md:p-8'>
                <div className='max-w-xl'>
                  <h3 className='text-xl font-bold text-accent dark:text-accent-bright'>Book an appointment</h3>
                  <p className='mt-3 text-sm leading-relaxed opacity-80 sm:text-base'>
                    Pick a time that works for you and I&apos;ll meet you there. Use the booking page to lock in a quick intro call, project discussion, or follow-up session.
                  </p>
                </div>

                <div className='mt-6 flex flex-col gap-4 sm:flex-row'>
                  <a
                    href={siteMetadata.booking}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='bg-signal-cta rounded-full px-6 py-4 text-center font-semibold shadow-glow transition-shadow hover:shadow-modern'
                  >
                    Open booking page
                  </a>
                  <button
                    type='button'
                    onClick={() => setActiveTab('message')}
                    className='rounded-full border-2 border-dark/10 px-6 py-4 font-semibold transition-colors hover:border-accent hover:text-accent dark:border-white/10 dark:hover:border-accent-bright dark:hover:text-accent-bright'
                  >
                    Send a message instead
                  </button>
                </div>
                <p className='mt-5 text-sm opacity-80'>
                  Hiring for a project?{' '}
                  <a
                    href={siteMetadata.company}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='font-semibold text-accent underline underline-offset-4 dark:text-accent-bright'
                  >
                    Work with me at DFW Software Consulting &#8599;
                    <span className='sr-only'> (opens in a new tab)</span>
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
