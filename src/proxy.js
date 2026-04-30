import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
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
  portfili: "/portfolio",
  contact: "/contact",
  blogs: "/blogs",
  jokes: "/jokes",
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
  matcher: ["/((?!_next/|api/|.*\\..*).*)", "/"],
};
