import { Suspense } from "react";
import Link from "next/link";
import { format } from "date-fns";
import ImageWithRetry from "@/components/UI/ImageWithRetry";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { getBlogImage, getPrimaryBlogTag } from "@/lib/blogPresentation";
import { loadLatestPosts } from "@/lib/latestPosts";
import { textLink } from "./styles";

const stretched = "after:absolute after:inset-0 after:content-[''] focus-visible:outline-none";
const cardRing = "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent dark:has-[a:focus-visible]:ring-accent-bright";

function PostDate({ post, className = "" }) {
    const d = post.published_at || post.publishedAt;
    return (
        <time dateTime={new Date(d).toISOString()} className={`font-mono-jb text-xs uppercase tracking-[0.15em] text-muted ${className}`}>
            {format(new Date(d), "MMM dd, yyyy")}
        </time>
    );
}

function FeaturedPost({ post }) {
    return (
        <div className={`group glass-card ${cardRing} relative flex h-full flex-col overflow-hidden p-3`}>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
                <ImageWithRetry
                    src={getBlogImage(post)}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
            </div>
            <div className="flex flex-1 flex-col px-3 pb-3 pt-5 md:px-4">
                <span className="self-start rounded-full border border-accent/30 px-3 py-1 font-mono-jb text-[0.7rem] uppercase tracking-[0.15em] text-accent dark:border-accent-bright/30 dark:text-accent-bright">
                    {getPrimaryBlogTag(post)}
                </span>
                <h3 className="mt-3 font-display text-2xl font-semibold leading-snug tracking-tight text-balance md:text-3xl">
                    <Link href={`/blogs/${post.slug}`} className={stretched}>{post.title}</Link>
                </h3>
                {post.description ? (
                    <p className="mt-3 line-clamp-3 text-base leading-relaxed text-muted">{post.description}</p>
                ) : null}
                <PostDate post={post} className="mt-auto pt-5" />
            </div>
        </div>
    );
}

function CompactPost({ post }) {
    return (
        <div className={`group glass-card ${cardRing} relative flex h-full items-center gap-4 overflow-hidden p-3`}>
            <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-2xl sm:w-28">
                <ImageWithRetry
                    src={getBlogImage(post)}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
            </div>
            <div className="min-w-0 py-1 pr-2">
                <span className="font-mono-jb text-[0.7rem] uppercase tracking-[0.15em] text-accent dark:text-accent-bright">
                    {getPrimaryBlogTag(post)}
                </span>
                <h3 className="mt-1.5 line-clamp-3 font-display text-lg font-semibold leading-snug tracking-tight text-balance">
                    <Link href={`/blogs/${post.slug}`} className={stretched}>{post.title}</Link>
                </h3>
                <PostDate post={post} className="mt-2 block" />
            </div>
        </div>
    );
}

async function LatestPosts() {
    const posts = await loadLatestPosts(4);
    if (!posts.length) {
        // DB down or nothing published yet: keep the page whole with a single path into the blog.
        return (
            <div className="glass rounded-3xl p-8 text-center">
                <Link href="/blogs" className={`${textLink} text-sm`}>Read the blog &rarr;</Link>
            </div>
        );
    }
    const [featured, ...rest] = posts;
    return (
        <Stagger className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-5">
            <StaggerItem className="lg:col-span-3">
                <FeaturedPost post={featured} />
            </StaggerItem>
            {rest.length ? (
                <div className="grid gap-4 md:gap-6 lg:col-span-2 lg:grid-rows-3">
                    {rest.map((p) => (
                        <StaggerItem key={p.id ?? p.slug}>
                            <CompactPost post={p} />
                        </StaggerItem>
                    ))}
                </div>
            ) : null}
        </Stagger>
    );
}

function LatestSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-5" aria-hidden="true">
            <div className="glass-card animate-pulse p-3 lg:col-span-3">
                <div className="aspect-[16/10] w-full rounded-2xl bg-black/5 dark:bg-white/5" />
                <div className="space-y-3 px-3 pb-3 pt-5">
                    <div className="h-6 w-24 rounded-full bg-black/5 dark:bg-white/5" />
                    <div className="h-8 w-4/5 rounded bg-black/5 dark:bg-white/5" />
                    <div className="h-4 w-full rounded bg-black/5 dark:bg-white/5" />
                    <div className="h-4 w-3/5 rounded bg-black/5 dark:bg-white/5" />
                </div>
            </div>
            <div className="grid gap-4 md:gap-6 lg:col-span-2 lg:grid-rows-3">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="glass-card flex animate-pulse items-center gap-4 p-3">
                        <div className="aspect-square w-24 shrink-0 rounded-2xl bg-black/5 dark:bg-white/5 sm:w-28" />
                        <div className="flex-1 space-y-3">
                            <div className="h-3 w-16 rounded bg-black/5 dark:bg-white/5" />
                            <div className="h-5 w-full rounded bg-black/5 dark:bg-white/5" />
                            <div className="h-3 w-24 rounded bg-black/5 dark:bg-white/5" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function LatestWriting() {
    return (
        <section className="container-page pb-20 md:pb-28" aria-labelledby="latest-heading">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow text-gradient mb-3">Latest writing</p>
                    <h2 id="latest-heading" className="display-lg font-display text-balance">
                        Fresh from the <span className="text-gradient">blog</span>
                    </h2>
                </div>
                <Link href="/blogs" className={textLink}>All posts &rarr;</Link>
            </Reveal>
            <div className="mt-10 md:mt-12">
                <Suspense fallback={<LatestSkeleton />}>
                    <LatestPosts />
                </Suspense>
            </div>
        </section>
    );
}
