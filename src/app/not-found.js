import Link from 'next/link';
import HeroCanvas from '@/components/Three/HeroCanvas';

export default function NotFound() {
    return (
        <div className="relative isolate overflow-hidden md:flex md:min-h-[75vh] md:items-center md:justify-center">
            <div className="relative h-[34svh] min-h-[13rem] max-h-[20rem] w-full opacity-80 md:absolute md:inset-0 md:h-auto md:max-h-none md:min-h-0 md:-z-10 md:opacity-60">
                <HeroCanvas variant="compact" />
            </div>
            <div className="container-page relative z-10 pb-16 pt-2 text-center md:py-16">
                <p className="eyebrow mb-2 reveal-up" style={{ '--i': 0 }}>Error / Lost in space</p>
                <h1 className="text-gradient gradient-flow font-display font-bold tracking-[-0.05em] leading-none text-[clamp(7rem,28vw,16rem)] reveal-up" style={{ '--i': 1 }}>
                    404
                </h1>
                <h2 className="display-md font-display mt-2 reveal-up" style={{ '--i': 2 }}>Page Not Found</h2>
                <p className="mt-4 text-muted max-w-md mx-auto reveal-up" style={{ '--i': 2 }}>
                    The page you are looking for does not exist or has been moved. Looks like this one drifted out of orbit.
                </p>
                <Link
                    href="/"
                    className="reveal-up mt-8 inline-flex items-center gap-2 rounded-full bg-signal-cta px-7 py-3.5 font-semibold text-white shadow-glow transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2"
                    style={{ '--i': 3 }}
                >
                    Go back home <span aria-hidden="true">&rarr;</span>
                </Link>
            </div>
        </div>
    );
}
