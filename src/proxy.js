import { NextResponse } from "next/server";

const EXTERNAL_REDIRECTS = {
  github:   "https://github.com/Messyginger0804",
  linkedin: "https://www.linkedin.com/in/dev-jc/",
  discord:  "https://discordapp.com/users/1033153137923596379",
  jokes:    "https://chromewebstore.google.com/detail/fplggjklhidneilngfdodbbpkapamcld?utm_source=item-share-cb",
};

const INTERNAL_REWRITES = {
  software:  "/",
  about:     "/about",
  portfolio: "/portfolio",
  contact:   "/contact",
  blogs:     "/blogs",
};

export default function middleware(req) {
  const url   = req.nextUrl;
  const host  = req.headers.get("host") || "";
  const parts = host.split(".");
  const sub   = parts.length > 2 ? parts[0] : "";

  const p = url.pathname;
  if (
    p.startsWith("/_next/") ||
    p.startsWith("/api/")   ||
    p.startsWith("/favicon")||
    p.startsWith("/icons")  ||
    p.startsWith("/images") ||
    /\.[a-zA-Z0-9]+$/.test(p)
  ) {
    return NextResponse.next();
  }

  if (sub === "www") {
    const dest = new URL(url);
    dest.host = "byjc.dev";
    return NextResponse.redirect(dest, { status: 301 });
  }

  if (sub === "resume") {
    return NextResponse.redirect(`https://byjc.dev/resume${p}`, { status: 302 });
  }

  if (EXTERNAL_REDIRECTS[sub]) {
    return NextResponse.redirect(EXTERNAL_REDIRECTS[sub], { status: 308 });
  }

  if (INTERNAL_REWRITES[sub]) {
    if (p !== "/") {
      return NextResponse.redirect(`https://byjc.dev${p}`, { status: 308 });
    }

    const next = url.clone();
    next.pathname = INTERNAL_REWRITES[sub];
    return NextResponse.rewrite(next);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|.*\\..*).*)", "/"],
};
