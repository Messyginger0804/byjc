import siteMetadata from "@/utils/metaData";

export const metadata = {
  title: `Resume | ${siteMetadata.author}`,
  robots: { index: false, follow: false }
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-ink";

export default function ResumePage() {
  return (
    <div className="container-page py-12 md:py-24">
      <div className="glass-card mx-auto grid max-w-4xl items-center gap-10 overflow-hidden p-6 sm:p-10 md:grid-cols-[minmax(0,1fr)_minmax(0,16rem)] md:gap-14 md:p-14">
        <div className="min-w-0">
          <p className="eyebrow text-gradient reveal-up" style={{ "--i": 0 }}>Resume / PDF</p>
          <h1 className="display-md reveal-up mt-3 text-balance" style={{ "--i": 1 }}>{siteMetadata.author} — Resume</h1>
          <p className="reveal-up mt-4 max-w-md text-lg text-muted" style={{ "--i": 2 }}>
            Experience, skills and projects in one place. Open it in a new tab or save a copy.
          </p>
          <div className="reveal-up mt-8 flex flex-wrap items-center gap-3" style={{ "--i": 3 }}>
            <a
              href={siteMetadata.resume}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-full bg-signal-cta px-7 py-3.5 font-semibold text-white shadow-glow transition-transform hover:scale-[1.03] ${focusRing}`}
            >
              Open résumé (PDF) <span aria-hidden="true">↗</span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <a
              href={siteMetadata.resume}
              download
              className={`inline-flex items-center gap-2 rounded-full border border-dark/20 px-7 py-3.5 font-semibold transition-all duration-300 hover:bg-dark hover:text-white dark:border-white/25 dark:hover:bg-white dark:hover:text-ink ${focusRing}`}
            >
              Download
            </a>
          </div>
        </div>

        {/* Stylized document preview (decorative) */}
        <div aria-hidden="true" className="reveal-up mx-auto w-full max-w-[14rem] md:max-w-none" style={{ "--i": 2 }}>
          <div className="relative aspect-[8.5/11] -rotate-3 rounded-xl border border-dark/10 bg-white p-5 shadow-glow dark:border-white/15 dark:bg-white/90">
            <div className="h-3 w-2/3 rounded-full bg-signal" />
            <div className="mt-2 h-1.5 w-1/3 rounded-full bg-dark/20" />
            <div className="mt-6 space-y-2">
              <div className="h-1.5 w-full rounded-full bg-dark/10" />
              <div className="h-1.5 w-11/12 rounded-full bg-dark/10" />
              <div className="h-1.5 w-4/5 rounded-full bg-dark/10" />
            </div>
            <div className="mt-6 h-2 w-1/4 rounded-full bg-dark/25" />
            <div className="mt-3 space-y-2">
              <div className="h-1.5 w-full rounded-full bg-dark/10" />
              <div className="h-1.5 w-10/12 rounded-full bg-dark/10" />
              <div className="h-1.5 w-full rounded-full bg-dark/10" />
              <div className="h-1.5 w-3/5 rounded-full bg-dark/10" />
            </div>
            <div className="mt-6 h-2 w-1/4 rounded-full bg-dark/25" />
            <div className="mt-3 space-y-2">
              <div className="h-1.5 w-full rounded-full bg-dark/10" />
              <div className="h-1.5 w-9/12 rounded-full bg-dark/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
