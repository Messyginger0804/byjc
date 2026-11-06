'use client';

export default function BlogDetailError({ error, reset }) {
    return (
        <div className="container-page min-h-[60vh] flex items-center justify-center py-16">
            <div className="glass-card max-w-lg w-full p-8 md:p-12 text-center hover:!translate-y-0" role="alert">
                <p className="eyebrow text-gradient mb-4">Error / Signal lost</p>
                <h2 className="display-md font-display mb-4">Something went wrong!</h2>
                <p className="text-muted mb-2">
                    {error?.message || 'Failed to load this blog post.'}
                </p>
                <p className="text-muted text-sm mb-8">
                    Check the server logs for more details.
                </p>
                <button
                    type="button"
                    onClick={reset}
                    className="rounded-full bg-signal-cta px-7 py-3 font-semibold text-white shadow-glow transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
