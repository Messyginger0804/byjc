'use client';

export default function ContactError({ error, reset }) {
    return (
        <div className="w-full min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-dark dark:text-light mb-4">Something went wrong!</h2>
                <p className="text-dark/70 dark:text-light/70 mb-2">
                    {error.message || 'Failed to load contact page.'}
                </p>
                <p className="text-dark/50 dark:text-light/50 mb-6 text-sm">
                    Check the server logs for more details.
                </p>
                <button
                    onClick={reset}
                    className="px-6 py-3 bg-accent dark:bg-accentDark text-light rounded-lg font-medium hover:opacity-80 transition-opacity"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
