const bone = "bg-ink/[0.07] dark:bg-white/[0.07] animate-pulse";

export default function Loading() {
    return (
        <div className="container-page pb-24" aria-busy="true" aria-label="Loading post">
            <div className={`mt-4 w-full h-[55vh] min-h-[22rem] rounded-3xl ${bone}`} />
            <div className="max-w-[68ch] mx-auto mt-12 space-y-4">
                <div className={`h-4 w-full rounded ${bone}`} />
                <div className={`h-4 w-11/12 rounded ${bone}`} />
                <div className={`h-4 w-4/5 rounded ${bone}`} />
                <div className={`h-4 w-full rounded ${bone}`} />
                <div className={`h-4 w-2/3 rounded ${bone}`} />
            </div>
        </div>
    );
}
