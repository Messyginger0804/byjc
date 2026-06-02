import JokeSection from "@/components/JokeSection";
import siteMetadata from "@/utils/metaData";
import { createPageMetadata, createJokesJsonLd } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata() {
    return createPageMetadata({
        title: "Daily Jokes | Software by JC",
        description: "Get your daily dose of laughter with JC's random jokes. A fun way to start your day!",
        keywords: [
            "jokes",
            "daily jokes",
            "developer jokes",
            "programming humor",
            "Jokes by JC",
            "random jokes",
        ],
        url: `${siteMetadata.siteUrl}/jokes`,
    });
}

export default function JokesPage() {
  return (
    <main className="transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(createJokesJsonLd()) }}
      />
      
      {/* Hero Section */}
      <section className="hero py-20 md:py-32 text-center flex flex-col items-center bg-accent text-light dark:bg-accentDark dark:text-dark relative overflow-hidden mb-12 md:mb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <h1 className="text-3xl md:text-6xl font-bold mb-6 text-balance relative z-10 px-4 leading-tight">
          <span className="bg-gradient-to-r from-white/50 to-white/50 dark:from-dark/50 dark:to-dark/50 bg-[length:0px_6px] hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 pb-2">
            JC tells you a joke every day! 😏
          </span>
        </h1>
        <p className="text-xl md:text-2xl mb-2 opacity-90 text-balance relative z-10 px-4 font-medium max-w-2xl">
          Because sometimes you just need a good laugh (or a terrible pun).
        </p>
      </section>

      {/* Interactive Joke Section */}
      <div className="max-w-4xl mx-auto px-6 sm:px-12 pb-24">
        <JokeSection />
      </div>
    </main>
  );
}
