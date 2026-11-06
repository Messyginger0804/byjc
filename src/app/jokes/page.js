import JokeSection from "@/components/JokeSection";
import siteMetadata from "@/utils/metaData";
import { createPageMetadata, createJokesJsonLd } from "@/lib/metadata";
import JsonLd from "@/components/JsonLd";

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
    <div className="container-page py-12 md:py-24">
      <JsonLd data={createJokesJsonLd()} />
      {/* Hero Section */}
      <div className="mb-12 flex flex-col items-center justify-center text-center md:mb-20">
        <p className="eyebrow text-gradient reveal-up" style={{ "--i": 0 }}>Daily jokes / Dad-approved</p>
        <h1 className="display-lg mt-5 max-w-4xl text-balance">
          <span className="reveal-line"><span className="reveal-line-inner" style={{ "--i": 0 }}>JC tells you a</span></span>{" "}
          <span className="reveal-line"><span className="reveal-line-inner text-gradient gradient-flow" style={{ "--i": 1 }}>joke</span></span>{" "}
          <span className="reveal-line"><span className="reveal-line-inner" style={{ "--i": 2 }}>every day! lol 😏</span></span>
        </h1>
        <p className="reveal-up mt-6 max-w-2xl text-xl text-muted text-balance md:text-2xl" style={{ "--i": 2 }}>
          Because sometimes you just need a good laugh (or a terrible pun).
        </p>
      </div>

      {/* Interactive Joke Section */}
      <div className="mx-auto max-w-4xl">
        <JokeSection />
      </div>
    </div>
  );
}
