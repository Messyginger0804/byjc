import Link from "next/link";
import AboutCover from "@/components/About/AboutCover";
import Portfolio from "@/components/About/Portfolio";
import Professional from "@/components/About/Professional";
import Skills from "@/components/About/Skills";

export async function generateMetadata() {
    return {
        title: "Home | Software by JC",
        description: "Welcome to Software by JC. Crafting innovative software solutions for businesses of all sizes.",
    };
}

export default function HomePage() {
    return (
        <div className="bg-light text-dark dark:bg-dark dark:text-light transition-colors duration-300">
            {/* Hero Section */}
            <section className="hero py-20 text-center">
                <h1 className="text-4xl md:text-6xl font-bold">
                    Welcome to Software by JC
                </h1>
                <p className="mt-4 text-xl">
                    Innovative solutions for your business needs.
                </p>
                <Link href="/contact">
                    <button className="mt-6 px-6 py-2 bg-accent text-light rounded hover:opacity-80 transition-opacity duration-200">
                        Contact Me
                    </button>
                </Link>
            </section>

            {/* Highlights Section */}
            <section className="highlights py-20 px-8 md:px-16 lg:px-32 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <h2 className="text-2xl font-bold">
                        Tailored Solutions
                    </h2>
                    <p>
                        From robust backend systems to engaging frontends, I specialize in creating software tailored
                        to meet your goals and exceed expectations.
                    </p>
                </div>
                <div>
                    <h2 className="text-2xl font-bold">
                        Cutting-Edge Technologies
                    </h2>
                    <p>
                        Harnessing the latest tools and technologies, I ensure your platform is not only functional but
                        also future-proof.
                    </p>
                </div>
            </section>

            {/* Portfolio Preview */}
            <section className="portfolio-preview py-20 px-8">
                <h2 className="text-3xl font-bold text-center mb-8">
                    Explore My Work
                </h2>
                <Portfolio />
                <div className="text-center mt-6">
                    <Link href="/blog">
                        <button className="px-6 py-2 bg-dark text-light dark:bg-light dark:text-dark rounded hover:opacity-80 transition-opacity duration-200">
                            View Blog
                        </button>
                    </Link>
                </div>
            </section>

            {/* Skills Section */}
            <section className="skills py-20 px-8">
                <h2 className="text-3xl font-bold text-center mb-8">
                    Skills & Expertise
                </h2>
                <Skills />
            </section>

            {/* Call-to-Action */}
            <section className="call-to-action py-16 text-center bg-accent text-light dark:bg-accentDark dark:text-dark">
                <h2 className="text-2xl font-bold">
                    Let’s Build Something Together
                </h2>
                <p className="mt-4">
                    Have a project in mind? Reach out and let’s make it happen!
                </p>
                <Link href="/contact">
                    <button className="mt-6 px-6 py-2 bg-light text-accent dark:bg-dark dark:text-accentDark rounded hover:opacity-80 transition-opacity duration-200">
                        Get In Touch
                    </button>
                </Link>
            </section>
        </div>
    );
}
