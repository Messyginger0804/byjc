"use client";

import { useMemo } from "react";

const ROOT_DOMAINS = new Set(["byjc.dev", "www.byjc.dev", "localhost", "127.0.0.1"]);
const SUBDOMAIN_ROUTES = new Set(["about", "portfolio", "contact", "blogs", "software"]);

const getHostName = () => {
  if (typeof window === "undefined") return "";
  return window.location.hostname.toLowerCase();
};

export const useBaseUrl = () => {
  return useMemo(() => {
    const hostname = getHostName();

    if (!hostname || ROOT_DOMAINS.has(hostname) || hostname.endsWith(".vercel.app")) {
      return "";
    }

    const parts = hostname.split(".");
    if (parts.length > 2 && parts[parts.length - 2] === "byjc" && parts[parts.length - 1] === "dev") {
      const subdomain = parts[0];
      return SUBDOMAIN_ROUTES.has(subdomain) ? "https://byjc.dev" : "";
    }

    return "";
  }, []);
};
