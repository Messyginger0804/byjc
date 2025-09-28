import { NextResponse } from "next/server";
import siteMetadata from "@/utils/metaData";

const DOMAIN = "byjc.dev";
const REDIRECTS = {
  github: siteMetadata.github,
  linkedin: siteMetadata.linkedin,
  discord: siteMetadata.discord,
};
const MAP = {
  software: "/",
  about: "/about",
  portfolio: "/portfolio",
  contact: "/contact",
  blogs: "/blogs",
};

export function middleware(req) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  if (
    path.startsWith("/_next/") ||
    path.startsWith("/api") ||
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  const host = (req.headers.get("host") || "").split(":")[0];
  if (!host.endsWith(DOMAIN)) return NextResponse.next();

  const sub = host.replace(`.${DOMAIN}`, "");

  if (REDIRECTS[sub]) {
    return NextResponse.redirect(REDIRECTS[sub]);
  }

  const base = MAP[sub];
  if (!base) return NextResponse.next();

  const alreadyOn =
    base === "/" ? url.pathname === "/" : url.pathname.startsWith(base);
  if (alreadyOn) return NextResponse.next();

  const extra = url.pathname === "/" ? "" : url.pathname;
  url.pathname = `${base}${extra}`.replace("//", "/");

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
