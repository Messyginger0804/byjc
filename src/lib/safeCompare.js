import { timingSafeEqual } from 'node:crypto';

export function safeCompare(provided, expected) {
  if (!provided) return false;
  const a = Buffer.from(provided, 'utf-8');
  const b = Buffer.from(expected, 'utf-8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
