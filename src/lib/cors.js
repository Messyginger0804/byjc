const ALLOWED_ORIGINS = [
  'https://www.byjc.dev',
  'https://byjc.dev',
];

const ALLOWED_PATTERNS = [
  /^chrome-extension:\/\/[a-z0-9]+$/i,
];

if (process.env.NODE_ENV !== 'production') {
  ALLOWED_PATTERNS.push(/^http:\/\/localhost(:\d+)?$/);
  ALLOWED_PATTERNS.push(/^http:\/\/127\.0\.0\.1(:\d+)?$/);
}

export function resolveCorsOrigin(origin) {
  if (!origin) return null;
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (ALLOWED_PATTERNS.some((re) => re.test(origin))) return origin;
  return null;
}
