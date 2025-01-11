
import Link from "next/link";
import Image from "next/image";
import siteMetadata from "@/utils/metaData";
import logoImage from "../../../public/assets/mes/waterCoolerMe.png";

export async function generateMetadata() {
    return {
        title: "Home | Software by JC",
        description: "Welcome to Software by JC. Crafting innovative software solutions for businesses of all sizes.",
        keywords: [
            "Software by JC",
            "web development services",
            "software development",
            "hire a software developer",
            "custom software solutions",
            "web developer in dallas"
        ],
        author: "JC",
        openGraph: {
            title: "Software by JC",
            description: "Welcome to Software by JC. Crafting innovative software solutions for businesses of all sizes.",
            url: siteMetadata.siteUrl,
            images: [
                {
                    url: "https://byjc.dev/assets/profile.png",
                    width: 1200,
                    height: 630,
                    alt: "Software by JC Logo",
                },
            ],
        },
        canonical: siteMetadata.siteUrl,
    };
}


export default function HomePage() {
    return (
        <div className="bg-light text-dark dark:bg-dark dark:text-light transition-colors duration-300">
            {/* Hero Section */}
            <section className="hero text-center flex flex-col items-center bg-accent text-light dark:bg-accentDark dark:text-dark">
                <h1 className="text-2xl md:text-5xl text-dark font-bold mb-2">
                    Welcome to Software by JC
                </h1>
                <p className="text-lg md:text-xl mb-2">
                    Innovative solutions for your business needs.
                    </p>
            </section>

            {/* Logo and Bullet Points Section */}
            <section className="services-section py-6 px-6 md:px-12 lg:px-24 grid grid-cols-1 md:grid-cols-2 items-center gap-8">
                <div className="relative grid grid-rows-1 items-center justify-items-center">
                    <Image
                        src={logoImage}
                        alt="Software by JC Logo"
                        width={300}
                        height={300}
                        className="rounded shadow-lg"
                    />
                    <Link href="/contact">
                        <button className="absolute lg:top-1 lg:right-48 px-6 py-2 bg-accent text-light dark:bg-accentDark dark:text-dark rounded hover:opacity-80 transition-opacity duration-200">
                            Get In Touch
                        </button>
                    </Link>
                </div>
                <div>
                    <h2 className="text-2xl font-bold my-2">
                        What I Can Do for You
                    </h2>
                    <p className="mb-4">
                        From crafting visually stunning websites to building robust software applications, I offer solutions tailored to your needs:
                    </p>
                    <ul className="list-disc pl-10 space-y-1">
                        <li>Design and develop landing pages that showcase your brand and engage your audience.</li>
                        <li>Create powerful applications to manage your business inventory effortlessly.</li>
                        <li>Build e-commerce solutions for seamless online purchases.</li>
                        <li>Develop scalable, secure backend systems for your applications.</li>
                        <li>Deliver intuitive, responsive frontends that provide exceptional user experiences.</li>
                    </ul>
                    <p className="mt-2 text-lg font-bold">
                        Whatever your vision, I have the tools and expertise to bring it to life.
                    </p>
                </div>
            </section>
        </div>
    );
}
