import Link from "next/link";
import Image from "next/image";
import logoImage from "../../public/assets/mes/waterCoolerMe.png";


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
            <section className="hero text-center flex flex-col items-center bg-accent text-light dark:bg-accentDark dark:text-dark">
                <h1
                    className="text-2xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-accent/50 to-accent/50 dark:from-accentDark/50 dark:to-accentDark/50 bg-[length:0px_6px] hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500"
                >
                    Welcome to Software by JC
                </h1>
                <p className="text-lg md:text-xl mb-2">
                    Innovative solutions for your business needs. is this working
                </p>
            </section>

            {/* Logo and Bullet Points Section */}
            <section className="services-section py-16 px-6 md:px-16 lg:px-24 grid grid-cols-1 md:grid-cols-2 items-center gap-12">
                <div className="relative grid grid-rows-1 items-center justify-items-center">
                    <Image
                        src={logoImage}
                        alt="Software by JC Logo"
                        width={300}
                        height={300}
                        className="rounded shadow-lg"
                    />
                    <Link href="/contact">
                        <button className="absolute lg:top-1 lg:right-48 px-8 py-3 bg-accent text-light dark:bg-accentDark dark:text-dark rounded hover:opacity-80 transition-opacity duration-200 text-lg tracking-wider">
                            Get In Touch
                        </button>
                    </Link>
                </div>
                <div>
                    <h2
                        className="text-3xl md:text-5xl font-bold my-4 tracking-wide leading-snug bg-gradient-to-r from-accent/50 to-accent/50 dark:from-accentDark/50 dark:to-accentDark/50 bg-[length:0px_6px] hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500"
                    >
                        What I Can Do for You 🫵
                    </h2>
                    <p className="text-lg md:text-xl leading-loose tracking-wide mb-6">
                        From crafting visually stunning websites to building robust software applications, I offer solutions tailored to your needs:
                    </p>
                    <ul className="list-disc pl-10 space-y-4 text-lg md:text-xl leading-loose tracking-wide">
                        <li>Design and develop landing pages that showcase your brand and engage your audience.</li>
                        <li>Create powerful applications to manage your business inventory effortlessly.</li>
                        <li>Build e-commerce solutions for seamless online purchases.</li>
                        <li>Develop scalable, secure backend systems for your applications.</li>
                        <li>Deliver intuitive, responsive frontends that provide exceptional user experiences.</li>
                    </ul>
                    <p className="mt-4 text-xl md:text-3xl font-bold tracking-wide leading-loose">
                        Whatever your vision, I have the tools and expertise to bring it to life.
                    </p>
                </div>
            </section>
        </div>
    );
}
