// @vitest-environment node
import React from 'react';
import { renderToReadableStream } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const loadLatestPosts = vi.fn();
vi.mock('@/lib/latestPosts', () => ({ loadLatestPosts: (...a) => loadLatestPosts(...a) }));
vi.mock('@/components/Motion', () => {
  const Pass = ({ as: As = 'div', children, className }) => <As className={className}>{children}</As>;
  return { Reveal: Pass, Stagger: Pass, StaggerItem: Pass };
});
vi.mock('@/components/UI/ImageWithRetry', () => ({ default: () => <span /> }));

import LatestWriting from './LatestWriting';

async function html() {
  const stream = await renderToReadableStream(<LatestWriting />);
  await stream.allReady;
  return new Response(stream).text();
}

describe('LatestWriting', () => {
  beforeEach(() => loadLatestPosts.mockReset());

  it('falls back to a single blog link when there are no posts (e.g. no database at build time)', async () => {
    loadLatestPosts.mockResolvedValue([]);
    const out = await html();
    expect(out).toContain('Read the blog');
    expect(out).toContain('Fresh from the');
  });

  it('renders featured and compact posts', async () => {
    loadLatestPosts.mockResolvedValue([
      { id: 1, slug: 'one', title: 'First post', description: 'Desc', published_at: '2026-01-02T00:00:00Z', tags: [] },
      { id: 2, slug: 'two', title: 'Second post', published_at: '2026-01-01T00:00:00Z', tags: [] },
    ]);
    const out = await html();
    expect(out).toContain('/blogs/one');
    expect(out).toContain('Second post');
    expect(out).not.toContain('Read the blog');
  });
});
