import Link from "next/link";
import Image from "next/image";
import logoImage from "../../../public/assets/mes/waterCoolerMe.png";

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
            <section className="hero py-20 text-center flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl font-bold">
                    Welcome to Software by JC
                </h1>
                <p className="mt-4 text-xl">
                    Innovative solutions for your business needs.
                </p>
            </section>

            {/* Highlights Section */}
            <section className="highlights py-20 px-8 md:px-16 lg:px-32">
                <h2 className="text-2xl font-bold text-center mb-8">
                    What I Can Do for You
                </h2>
                <p className="text-center mb-12">
                    From crafting visually stunning websites to building robust software applications, I offer solutions tailored to your needs.
                </p>
            </section>

            {/* Logo and Bullet Points Section */}
            <section className="services-section py-20 px-8 md:px-16 lg:px-32 grid grid-cols-1 md:grid-cols-2 items-center">
                <div className="flex justify-center">
                    <Image
                        src={logoImage}
                        alt="Software by JC Logo"
                        width={300}
                        height={300}
                        className="rounded shadow-lg"
                    />
                </div>
                <div>
                    <ul className="list-disc pl-6">
                        <li>Design and develop landing pages that showcase your brand and engage your audience.</li>
                        <li>Create powerful applications to manage your business inventory effortlessly.</li>
                        <li>Build e-commerce solutions for seamless online purchases.</li>
                        <li>Develop scalable, secure backend systems for your applications.</li>
                        <li>Deliver intuitive, responsive frontends that provide exceptional user experiences.</li>
                    </ul>
                    <p className="mt-4">
                        Whatever your vision, I have the tools and expertise to bring it to life.
                    </p>
                </div>
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
