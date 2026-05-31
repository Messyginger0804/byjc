import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="w-full min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-dark dark:text-light mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-dark dark:text-light mb-4">Page Not Found</h2>
                <p className="text-dark/70 dark:text-light/70 mb-6">
                    The page you are looking for does not exist or has been moved.
                </p>
                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-accent dark:bg-accentDark text-light rounded-lg font-medium hover:opacity-80 transition-opacity"
                >
                    Go back home
                </Link>
            </div>
        </div>
    );
}
