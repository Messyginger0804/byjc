import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import siteMetadata from "@/utils/metaData";

const EXTERNAL_REDIRECTS = {
  github:   "https://github.com/Messyginger0804",
  linkedin: "https://www.linkedin.com/in/dev-jc/",
  discord: "https://discordapp.com/users/1033153137923596379",
  jokes:    "https://chromewebstore.google.com/detail/fplggjklhidneilngfdodbbpkapamcld?utm_source=item-share-cb",
};

const INTERNAL_REWRITES = {
  software:  "/",
  about:     "/about",
  portfolio: "/portfolio",
  portfili:  "/portfolio",
  contact:   "/contact",
  blogs:     "/blogs",
  jokes:     "/jokes",
};

async function handleAdminAuth(req) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get("admin_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    return handleAdminAuth(req);
  }

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

  if (sub === "resume") {
    if (p === "/") {
      const dest = new URL(`/resume${url.search}`, "https://byjc.dev");
      return NextResponse.redirect(dest, { status: 302 });
    }
    const dest = new URL(`${p}${url.search}`, "https://byjc.dev");
    return NextResponse.redirect(dest, { status: 308 });
  }

  if (EXTERNAL_REDIRECTS[sub]) {
    return NextResponse.redirect(EXTERNAL_REDIRECTS[sub], { status: 308 });
  }

  if (INTERNAL_REWRITES[sub]) {
    if (p !== "/") {
      const dest = new URL(`${p}${url.search}`, "https://byjc.dev");
      return NextResponse.redirect(dest, { status: 308 });
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