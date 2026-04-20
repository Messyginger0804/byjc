import { NextResponse } from 'next/server';

function getBearerToken(headerValue) {
  if (!headerValue?.startsWith('Bearer ')) {
    return null;
  }

  return headerValue.slice('Bearer '.length).trim();
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

  if (providedSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
