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

// Static shell with ISR. The latest-posts loader (src/lib/latestPosts.js) fails soft only at build time, so a
// build without a database prerenders the "Read the blog" fallback and the first revalidation at runtime fills
// in the posts. If a later revalidation throws (database outage), Next.js keeps serving the last good page.
// Publishing a post also revalidates "/" on demand (see src/lib/revalidateBlogs.js).
export const revalidate = 300;

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
