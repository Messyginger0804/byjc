import JokeSection from "@/components/JokeSection";
import siteMetadata from "@/utils/metaData";

export const revalidate = 300;

export async function generateMetadata() {
    return {
        title: "Daily Jokes | Software by JC",
        description: "Get your daily dose of laughter with JC's random jokes. A fun way to start your day!",
        openGraph: {
            title: "Daily Jokes | Software by JC",
            description: "Get your daily dose of laughter with JC's random jokes. A fun way to start your day!",
            url: `${siteMetadata.siteUrl}/jokes`,
            siteName: siteMetadata.title,
            locale: "en_US",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: "Daily Jokes | Software by JC",
            description: "Get your daily dose of laughter with JC's random jokes. A fun way to start your day!",
        },
        canonical: `${siteMetadata.siteUrl}/jokes`,
    };
}

export default function JokesPage() {
  return (
    <main className="transition-colors duration-300 px-6 sm:px-12 py-12 md:py-24">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center mb-12 md:mb-24 text-center">
        <h1 className="font-bold capitalize text-4xl xs:text-5xl lg:text-7xl tracking-tight text-balance leading-tight">
          JC tells you a <span className="text-accent dark:text-accentDark">joke</span> every day! lol 😏
        </h1>
        <p className="mt-4 text-xl md:text-2xl opacity-80 max-w-2xl text-balance">
          Because sometimes you just need a good laugh (or a terrible pun).
        </p>
      </div>

      {/* Interactive Joke Section */}
      <div className="max-w-4xl mx-auto">
        <JokeSection />
      </div>
    </main>
  );
}
