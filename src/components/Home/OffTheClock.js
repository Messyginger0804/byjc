import Image from "next/image";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import dsdImage from "../../../public/about-images/dsd2.png";
import cycImage from "../../../public/about-images/cyc.png";
import lolImage from "../../../public/assets/mes/lol.png";
import { textLink } from "./styles";

const stretched = "after:absolute after:inset-0 after:content-[''] focus-visible:outline-none";
const cardRing = "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent dark:has-[a:focus-visible]:ring-accent-bright";

function Card({ children }) {
    return <div className={`group glass-card ${cardRing} relative flex h-full flex-col overflow-hidden p-3`}>{children}</div>;
}

export default function Community() {
    return (
        <section className="container-page pb-20 md:pb-28" aria-labelledby="community-heading">
            <Reveal className="max-w-3xl">
                <p className="eyebrow text-gradient mb-3">Beyond the keyboard</p>
                <h2 id="community-heading" className="display-lg font-display text-balance">
                    Community, and a little <span className="text-gradient">comic relief</span>
                </h2>
            </Reveal>
            <Stagger className="mt-10 grid gap-4 md:mt-12 md:gap-6 lg:grid-cols-3">
                <StaggerItem>
                    <Card>
                        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                            <Image src={dsdImage} alt="" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                        </div>
                        <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
                            <h3 className="font-display text-xl font-semibold tracking-tight">Dallas Software Developers</h3>
                            <p className="mt-2 leading-relaxed text-muted">
                                An active member of the meetup, learning from the room and giving talks of my own.
                            </p>
                            <Link href="/about" className={`${stretched} mt-auto pt-5 ${textLink} self-start`}>
                                More about me <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>
                    </Card>
                </StaggerItem>
                <StaggerItem>
                    <Card>
                        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                            <Image src={cycImage} alt="" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                        </div>
                        <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
                            <h3 className="font-display text-xl font-semibold tracking-tight">Commit Your Code</h3>
                            <p className="mt-2 leading-relaxed text-muted">
                                Attended twice. It&apos;s the only conference I&apos;ve been to, and I loved the people and the energy.
                            </p>
                            <Link href="/about" className={`${stretched} mt-auto pt-5 ${textLink} self-start`}>
                                Read more <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>
                    </Card>
                </StaggerItem>
                <StaggerItem>
                    <Card>
                        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br from-accent/15 via-violet/10 to-amber/20">
                            <Image
                                src={lolImage}
                                alt=""
                                width={240}
                                height={240}
                                className="absolute left-1/2 top-1 h-[142%] w-auto max-w-none -translate-x-1/2 object-contain object-top"
                            />
                        </div>
                        <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
                            <h3 className="font-display text-xl font-semibold tracking-tight">Need a laugh?</h3>
                            <p className="mt-2 leading-relaxed text-muted">
                                Debugging is serious business. A joke in between never hurt anybody.
                            </p>
                            <Link href="/jokes" className={`${stretched} mt-auto pt-5 ${textLink} self-start`}>
                                Tell me a joke <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>
                    </Card>
                </StaggerItem>
            </Stagger>
        </section>
    );
}
