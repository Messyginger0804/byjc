import { NextResponse } from "next/server";
import siteMetadata from "@/utils/metaData";

const EXTERNAL_REDIRECTS = {
  github: siteMetadata.github,
  linkedin: siteMetadata.linkedin,
  discord: siteMetadata.discord,
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

  // 1) Let assets/API pass through untouched
  const p = url.pathname;
  const isAsset = 
    p.startsWith("/_next/") || 
    p.startsWith("/api/") || 
    p.startsWith("/favicon") || 
    p.startsWith("/icons") || 
    p.startsWith("/images") || 
    /\.[a-zA-Z0-9]+$/.test(p); // any file with an extension
  if (isAsset) return NextResponse.next();

  // 2) External redirects
  if (sub && EXTERNAL_REDIRECTS[sub]) {
    return NextResponse.redirect(EXTERNAL_REDIRECTS[sub], { status: 308 });
  }

  // 3) Internal rewrites (only change the path for page requests)
  if (sub && INTERNAL_REWRITES[sub]) {
    const next = url.clone();
    next.pathname = INTERNAL_REWRITES[sub];
    return NextResponse.rewrite(next);
  }

  return NextResponse.next();
}

// Exclude assets at the matcher level too (belt & suspenders)
export const config = {
  matcher: ["/((?!_next/|api/|.*\\..*).*) ", "/"],
};