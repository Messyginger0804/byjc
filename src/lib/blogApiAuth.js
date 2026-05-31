import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';

function getBearerToken(headerValue) {
  if (!headerValue?.startsWith('Bearer ')) {
    return null;
  }

  return headerValue.slice('Bearer '.length).trim();
}

function safeCompare(provided, expected) {
  if (!provided) return false;
  const a = Buffer.from(provided, 'utf-8');
  const b = Buffer.from(expected, 'utf-8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function requireBlogApiAuth(request) {
  const expectedSecret = process.env.BLOG_API_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'Blog API secret is not configured.' },
      { status: 500 }
    );
  }

  const providedSecret =
    request.headers.get('x-blog-secret') ||
    getBearerToken(request.headers.get('authorization'));

  if (!safeCompare(providedSecret, expectedSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
