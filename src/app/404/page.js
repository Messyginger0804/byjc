import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import errorImage from "../../public/assets/mes/waterCoolerMe.png";


export default function Custom404() {
  return (
    <div className="bg-light text-dark dark:bg-dark dark:text-light transition-colors duration-300 min-h-screen flex flex-col items-center justify-center">
      {/* Metadata */}
      <Head>
        <title>404 | Software by JC</title>
        <meta name="description" content="Oops! The page you're looking for doesn't exist." />
      </Head>

      {/* 404 Section */}
      <section className="text-center">
        <h1
          className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-accent/50 to-accent/50 dark:from-accentDark/50 dark:to-accentDark/50 bg-[length:0px_6px] hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500"
        >
          404
        </h1>
        <p className="text-xl md:text-2xl mb-6">
          Oops! The page you’re looking for doesn’t exist.
        </p>
        <div className="relative">
          <Image
            src={errorImage} // Central image for the 404 page
            alt="404 Error Image"
            width={300}
            height={300}
            className="rounded shadow-lg"
          />
        </div>
        <p className="mt-6 text-lg md:text-xl">
          But don’t worry, you can always head back to the homepage.
        </p>
        <Link href="/">
          <button className="mt-6 px-8 py-3 bg-accent text-light dark:bg-accentDark dark:text-dark rounded hover:opacity-80 transition-opacity duration-200 text-lg tracking-wider">
            Go to Homepage
          </button>
        </Link>
      </section>
    </div>
  );
}
