import Image from "next/image";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import famImage from "../../../public/about-images/ma-and-fam.jpg";
import serviceImage from "../../../public/about-images/serviceCollege.png";
import { textLink } from "./styles";

// Facts drawn from src/data/about.js and src/data/resumeData.js.
const BEATS = [
    {
        title: "A family man first",
        text: "I'm a proud father of three. They're the reason for the late-night coding and the weekend breaks from it.",
    },
    {
        title: "15 years on the service floor",
        text: "Employee, then manager. Communication, leadership and adaptability were the job long before code was.",
    },
    {
        title: "Trading shifts for software",
        text: "I changed careers into software development and became a UTD alum, bringing a customer-first operator's mindset with me.",
    },
    {
        title: "Lead intern at iServiceWeb",
        text: "Promoted to Lead Intern Engineer within three months, running code reviews and mentoring 5+ junior developers.",
    },
    {
        title: "Onix Media, and my own shop",
        text: "I build full-stack products at Onix Media, and in 2023 I founded DFW Software Consulting to do the same for small businesses.",
    },
];

export default function Story() {
    return (
        <section className="container-page pb-20 md:pb-28" aria-labelledby="story-heading">
            <Reveal className="max-w-3xl">
                <p className="eyebrow text-gradient mb-3">My story</p>
                <h2 id="story-heading" className="display-lg font-display text-balance">
                    From the service floor to the <span className="text-gradient">server stack</span>
                </h2>
            </Reveal>
            <div className="mt-10 grid gap-8 md:mt-12 lg:grid-cols-[4fr_8fr] lg:gap-12">
                <Reveal className="grid grid-cols-2 gap-4 lg:sticky lg:top-28 lg:self-start lg:grid-cols-1">
                    <figure className="glass-card overflow-hidden p-3">
                        <Image
                            src={famImage}
                            alt="JC with his family"
                            sizes="(max-width: 1024px) 50vw, 40vw"
                            className="aspect-square w-full rounded-2xl object-cover"
                        />
                        <figcaption className="px-2 pb-2 pt-3 text-sm text-muted">The reason for all of it.</figcaption>
                    </figure>
                    <figure className="glass-card overflow-hidden p-3">
                        <Image
                            src={serviceImage}
                            alt="Four photos of JC working shifts in the service industry"
                            sizes="(max-width: 1024px) 50vw, 40vw"
                            className="aspect-square w-full rounded-2xl object-cover"
                        />
                        <figcaption className="px-2 pb-2 pt-3 text-sm text-muted">
                            Where I learned to read a room and take care of people.
                        </figcaption>
                    </figure>
                </Reveal>
                <div>
                    <Stagger as="ol" className="relative space-y-4 md:space-y-5" stagger={0.09}>
                        {BEATS.map((b, i) => (
                            <StaggerItem as="li" key={b.title}>
                                <div className="glass-card flex gap-5 p-5 md:p-6">
                                    <span className="font-mono-jb text-sm font-medium tracking-[0.2em] text-accent dark:text-accent-bright" aria-hidden="true">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <div>
                                        <h3 className="font-display text-xl font-semibold tracking-tight text-balance md:text-2xl">{b.title}</h3>
                                        <p className="mt-2 leading-relaxed text-muted">{b.text}</p>
                                    </div>
                                </div>
                            </StaggerItem>
                        ))}
                    </Stagger>
                    <Reveal className="mt-8">
                        <Link href="/about" className={`${textLink} text-sm`}>Read the full story &rarr;</Link>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
