import Image from "next/image";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { contractedJobs } from "@/data/jobs";
import { focusRing } from "./styles";

// Only title, link and image are read from the jobs data. Contact names and phone numbers are never rendered.
const CLIENTS = contractedJobs.map(({ title, link, image }) => ({ title, link, image }));

export default function ClientStrip() {
    return (
        <section className="container-page pb-20 md:pb-28" aria-labelledby="clients-heading">
            <Reveal>
                <p id="clients-heading" className="eyebrow mb-6 text-center">
                    Teams and businesses I&apos;ve built for
                </p>
            </Reveal>
            <Stagger as="ul" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 md:gap-4" stagger={0.06}>
                {CLIENTS.map((c) => (
                    <StaggerItem as="li" key={c.title} className="col-span-1 last:col-span-2 sm:last:col-span-1">
                        <a
                            href={c.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group glass flex h-full flex-col items-center gap-3 rounded-2xl p-4 text-center transition-colors hover:border-accent dark:hover:border-accent-bright ${focusRing}`}
                        >
                            <span className="flex h-20 w-full items-center justify-center overflow-hidden rounded-xl bg-white p-2.5 ring-1 ring-black/5">
                                <Image
                                    src={c.image}
                                    alt=""
                                    width={160}
                                    height={80}
                                    className="h-full w-full object-contain opacity-80 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0"
                                />
                            </span>
                            <span className="text-sm font-semibold leading-snug">
                                {c.title}
                                <span className="sr-only"> (opens in a new tab)</span>
                            </span>
                        </a>
                    </StaggerItem>
                ))}
            </Stagger>
        </section>
    );
}
