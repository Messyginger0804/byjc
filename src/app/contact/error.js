'use client';

export default function ContactError({ error, reset }) {
    return (
        <div className="container-page flex min-h-[60vh] items-center justify-center">
            <div className="glass max-w-lg rounded-3xl p-8 text-center md:p-12" role="alert">
                <p className="eyebrow text-gradient">Error</p>
                <h2 className="display-md mt-3">Something went wrong!</h2>
                <p className="mt-4 text-muted">
                    {error.message || 'Failed to load contact page.'}
                </p>
                <p className="mt-1 mb-6 text-sm text-muted">
                    Check the server logs for more details.
                </p>
                <button
                    onClick={reset}
                    className="rounded-full bg-signal-cta px-6 py-3 font-semibold text-white transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
