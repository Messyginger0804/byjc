import siteMetadata from "@/utils/metaData";
import { createPageMetadata, createWebSiteJsonLd } from "@/lib/metadata";
import JsonLd from "@/components/JsonLd";
import Hero from "@/components/Home/Hero";
import LatestWriting from "@/components/Home/LatestWriting";
import ClientStrip from "@/components/Home/ClientStrip";
import ServicesBento from "@/components/Home/ServicesBento";
import Story from "@/components/Home/Story";
import Testimonials from "@/components/Home/Testimonials";
import Community from "@/components/Home/Community";
import ContactPanel from "@/components/Home/ContactPanel";

// Latest posts come from PostgreSQL at request time (cached 60s, see src/lib/latestPosts.js), like /blogs.
export const dynamic = "force-dynamic";

export async function generateMetadata() {
    return createPageMetadata({
        title: "Home | Software by JC",
        description: "Welcome to Software by JC. Crafting innovative software solutions for businesses of all sizes.",
        keywords: [
            "Software by JC",
            "JC Ashley",
            "software development",
            "web development",
            "hire developer",
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
            <ClientStrip />
            <ServicesBento />
            <Story />
            <Testimonials />
            <Community />
            <ContactPanel />
        </>
    );
}
