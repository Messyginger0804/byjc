'use client';

import { useEffect, useState } from 'react';
import ContactForm from '@/components/Contact/ContactForm';
import siteMetadata from '@/utils/metaData';

const tabs = [
  { id: 'message', label: 'Send message' },
  { id: 'book', label: 'Book time' },
];

export default function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('message');

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type='button'
        onClick={() => {
          setActiveTab('message');
          setIsOpen(true);
        }}
        className='fixed bottom-5 right-5 z-[90] btn-primary !py-3 !px-5 md:!py-4 md:!px-6 flex items-center gap-2 bg-light/90 dark:bg-dark/90 backdrop-blur-md shadow-modern-lg'
        aria-haspopup='dialog'
        aria-expanded={isOpen}
      >
        <span className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-light dark:bg-accentDark dark:text-dark'>
          <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'></path>
          </svg>
        </span>
        <span className='text-sm md:text-base font-bold'>Get in touch</span>
      </button>

      {isOpen && (
        <div onClick={() => setIsOpen(false)} className='fixed inset-0 z-[100] flex items-end justify-center bg-dark/65 p-3 sm:items-center sm:p-6'>
          <div
            role='dialog'
            aria-modal='true'
            aria-label='Contact JC'
            onClick={(e) => e.stopPropagation()}
            className='glass w-full max-w-3xl max-h-[90dvh] overflow-y-auto rounded-[2rem] border border-light/10 bg-light/95 p-5 text-dark shadow-modern-lg dark:bg-dark/95 dark:text-light sm:p-8'
          >
            <div className='mb-6 flex items-start justify-between gap-4'>
              <div>
                <p className='text-sm font-bold uppercase tracking-[0.2em] text-accent dark:text-accentDark'>Contact</p>
                <h2 className='mt-2 text-2xl font-bold tracking-tight sm:text-3xl'>Let&apos;s talk about your project</h2>
                <p className='mt-2 max-w-xl text-sm opacity-75 sm:text-base'>
                  Send a message if you want to start the conversation, or jump straight to a booking slot if you want time on the calendar.
                </p>
              </div>
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                className='inline-flex h-11 w-11 items-center justify-center rounded-full border border-dark/10 text-xl transition-colors hover:bg-dark hover:text-light dark:border-light/10 dark:hover:bg-light dark:hover:text-dark'
                aria-label='Close contact dialog'
              >
                ×
              </button>
            </div>

            <div className='mb-6 inline-flex rounded-full border border-dark/10 p-1 dark:border-light/10'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type='button'
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-colors sm:px-5 ${
                    activeTab === tab.id
                      ? 'bg-accent text-light dark:bg-accentDark dark:text-dark'
                      : 'text-dark/70 hover:text-accent dark:text-light/70 dark:hover:text-accentDark'
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
                  <h3 className='text-xl font-bold text-accent dark:text-accentDark'>Book an appointment</h3>
                  <p className='mt-3 text-sm leading-relaxed opacity-80 sm:text-base'>
                    Pick a time that works for you and I&apos;ll meet you there. Use the booking page to lock in a quick intro call, project discussion, or follow-up session.
                  </p>
                </div>

                <div className='mt-6 flex flex-col gap-4 sm:flex-row'>
                  <a
                    href={siteMetadata.booking}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='btn-primary !py-4 text-center'
                  >
                    Open booking page
                  </a>
                  <button
                    type='button'
                    onClick={() => setActiveTab('message')}
                    className='rounded-full border-2 border-dark/10 px-6 py-4 font-bold transition-colors hover:border-accent hover:text-accent dark:border-light/10 dark:hover:border-accentDark dark:hover:text-accentDark'
                  >
                    Send a message instead
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
