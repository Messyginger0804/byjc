const bone = "bg-ink/[0.07] dark:bg-white/[0.07] animate-pulse";

export default function Loading() {
    return (
        <div className="container-page pb-24" aria-busy="true" aria-label="Loading posts">
            <div className="pt-4 md:pt-8">
                <div className={`h-3 w-32 rounded mb-4 ${bone}`} />
                <div className={`w-full h-[60vh] min-h-[24rem] rounded-3xl ${bone}`} />
            </div>
            <div className={`h-8 w-56 rounded mt-20 ${bone}`} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 mt-8">
                <div className={`lg:row-span-2 min-h-[24rem] rounded-3xl ${bone}`} />
                <div className={`h-44 rounded-3xl ${bone}`} />
                <div className={`h-44 rounded-3xl ${bone}`} />
            </div>
        </div>
    );
}
