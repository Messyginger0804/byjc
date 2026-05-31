export default function Loading() {
    return (
        <main className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="w-full max-w-5xl space-y-8">
                {/* Hero skeleton */}
                <div className="w-full h-64 rounded-3xl bg-dark/5 dark:bg-light/5 animate-pulse" />
                
                {/* Blog cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-2xl bg-dark/5 dark:bg-light/5 p-4 space-y-4 animate-pulse">
                            <div className="h-40 rounded-xl bg-dark/10 dark:bg-light/10" />
                            <div className="h-4 w-3/4 rounded bg-dark/10 dark:bg-light/10" />
                            <div className="h-3 w-1/2 rounded bg-dark/10 dark:bg-light/10" />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
