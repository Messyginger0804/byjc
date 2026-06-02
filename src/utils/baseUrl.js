import { headers } from 'next/headers';

const ROOT_DOMAINS = new Set(["byjc.dev", "www.byjc.dev", "localhost", "127.0.0.1"]);
const SUBDOMAIN_ROUTES = new Set(["about", "portfolio", "contact", "blogs", "software"]);

export async function getBaseUrl() {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') || '';
  const hostname = host.split(':')[0].toLowerCase();

  if (!hostname || ROOT_DOMAINS.has(hostname) || hostname.endsWith('.vercel.app')) {
    return '';
  }

  const parts = hostname.split('.');
  if (parts.length > 2 && parts[parts.length - 2] === 'byjc' && parts[parts.length - 1] === 'dev') {
    const subdomain = parts[0];
    return SUBDOMAIN_ROUTES.has(subdomain) ? 'https://byjc.dev' : '';
  }

  return '';
}
