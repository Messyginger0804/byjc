import siteMetadata from "@/utils/metaData";
import { createPageMetadata, createWebSiteJsonLd } from "@/lib/metadata";
import JsonLd from "@/components/JsonLd";
import Hero from "@/components/Home/Hero";
import LatestWriting from "@/components/Home/LatestWriting";
import Stack from "@/components/Home/Stack";
import Hire from "@/components/Home/Hire";
import Story from "@/components/Home/Story";
import Testimonials from "@/components/Home/Testimonials";
import OffTheClock from "@/components/Home/OffTheClock";
import SayHi from "@/components/Home/SayHi";

// Latest posts come from PostgreSQL at request time (cached 60s, see src/lib/latestPosts.js), like /blogs.
export const dynamic = "force-dynamic";

export async function generateMetadata() {
    return createPageMetadata({
        title: "Home | Software by JC",
        description: "JC Ashley is a full-stack engineer in Dallas, a dad of three and a writer. Read the blog, see what I've built and get to know me.",
        keywords: [
            "Software by JC",
            "JC Ashley",
            "software development",
            "web development",
                        "byjc.dev",
        ],
        url: siteMetadata.siteUrl,
    });
}

export default function HomePage() {
    return (
        <>
            <JsonLd data={createWebSiteJsonLd()} />
            <Hero />
            <LatestWriting />
            <Story />
            {/* Side projects section hidden for now — component kept in Projects.js */}
            <Stack />
            <Testimonials />
            <OffTheClock />
            <Hire />
            <SayHi />
        </>
    );
}
