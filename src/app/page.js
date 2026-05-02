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
        <div className="transition-colors duration-300">
            {/* Hero Section */}
            <section className="hero py-20 md:py-32 text-center flex flex-col items-center bg-accent text-light dark:bg-accentDark dark:text-dark relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                <h1
                    className="text-3xl md:text-6xl font-bold mb-6 text-balance relative z-10 px-4"
                >
                    <span className="bg-gradient-to-r from-accent/50 to-accent/50 dark:from-accentDark/50 dark:to-accentDark/50 bg-[length:0px_6px] hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 pb-2">
                        Welcome to Software by JC
                    </span>
                </h1>
                <p className="text-xl md:text-2xl mb-2 opacity-90 text-balance relative z-10 px-4 font-medium">
                    Innovative solutions for your business needs.
                </p>
            </section>

            {/* Logo and Bullet Points Section */}
            <section className="services-section py-20 px-6 md:px-16 lg:px-24 grid grid-cols-1 md:grid-cols-2 items-center gap-16">
                <div className="relative flex flex-col items-center justify-center">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-accent to-accentDark rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <Image
                            src={logoImage}
                            alt="Software by JC Logo"
                            width={350}
                            height={350}
                            priority
                            sizes="(max-width: 768px) 80vw, 350px"
                            className="relative rounded-2xl shadow-modern group-hover:shadow-modern-lg transition-all duration-500"
                        />
                    </div>
                </div>
                <div>
                    <h2
                        className="text-3xl md:text-4xl lg:text-5xl font-bold my-6 text-balance md:leading-tight"
                    >
                        What I Can Do for You 🫵
                    </h2>
                    <p className="text-lg md:text-xl md:leading-relaxed mb-8 opacity-80">
                        From crafting visually stunning websites to building robust software applications, I offer solutions tailored to your needs:
                    </p>
                    <ul className="space-y-4 text-lg md:text-xl md:leading-relaxed">
                        {[
                            "Design and develop landing pages that showcase your brand.",
                            "Create powerful applications to manage your business inventory.",
                            "Build e-commerce solutions for seamless online purchases.",
                            "Develop scalable, secure backend systems for your applications.",
                            "Deliver intuitive, responsive frontends for exceptional UX."
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="text-accent dark:text-accentDark mt-1">✦</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-8 text-2xl md:text-3xl font-bold md:leading-tight text-accent dark:text-accentDark">
                        Whatever your vision, I have the tools and expertise to bring it to life.
                    </p>
                </div>
            </section>
        </div>
    );
}
