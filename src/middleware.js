import { NextResponse } from "next/server";
import siteMetadata from "@/utils/metaData";

const EXTERNAL_REDIRECTS = {
  github: siteMetadata.github,
  linkedin: siteMetadata.linkedin,
  discord: siteMetadata.discord,
  resume: siteMetadata.resume,
};

const INTERNAL_REWRITES = {
  software: "/",
  about: "/about",
  portfolio: "/portfolio",
  contact: "/contact",
  blogs: "/blogs",
};

export function middleware(req) {
  const url = req.nextUrl;
  const host = req.headers.get("host") || "";
  const sub = host.split(".").length > 2 ? host.split(".")[0] : "";

  const p = url.pathname;
  const isAsset = 
    p.startsWith("/_next/") || 
    p.startsWith("/api/") || 
    p.startsWith("/favicon") || 
    p.startsWith("/icons") || 
    p.startsWith("/images") || 
    /\.[a-zA-Z0-9]+$/.test(p);
  if (isAsset) return NextResponse.next();

  if (sub && EXTERNAL_REDIRECTS[sub]) {
    return NextResponse.redirect(EXTERNAL_REDIRECTS[sub], { status: 308 });
  }

  if (sub && INTERNAL_REWRITES[sub]) {
    const next = url.clone();
    next.pathname = INTERNAL_REWRITES[sub];
    return NextResponse.rewrite(next);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|.*\\..*).*) ", "/"],
};