// @vitest-environment jsdom
import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ImageWithRetry from './ImageWithRetry';

vi.mock('next/image', () => ({
    // eslint-disable-next-line @next/next/no-img-element
    default: ({ alt, src, onError, onLoad }) => <img alt={alt} src={src} onError={onError} onLoad={onLoad} />,
}));

describe('ImageWithRetry', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('never adds a query string to local images, which next/image rejects', () => {
        const { container } = render(<ImageWithRetry src="/blog-images/a.jpg" alt="a" retries={2} retryDelay={10} />);
        const first = container.querySelector('img');
        fireEvent.error(first);
        act(() => { vi.advanceTimersByTime(20); });

        const retried = container.querySelector('img');
        expect(retried.getAttribute('src')).toBe('/blog-images/a.jpg');
        expect(retried).not.toBe(first);

        // Second (last) retry: still the same src, freshly remounted.
        fireEvent.error(retried);
        act(() => { vi.advanceTimersByTime(40); });
        const lastRetry = container.querySelector('img');
        expect(lastRetry.getAttribute('src')).toBe('/blog-images/a.jpg');
        expect(lastRetry).not.toBe(retried);

        // Retries exhausted: falls back.
        fireEvent.error(lastRetry);
        expect(container.querySelector('img').getAttribute('src')).toBe('/blog-images/fadedcomputer.jpg');
    });

    it('adds a cache-busting query to remote images and falls back after the last retry', () => {
        const { container } = render(<ImageWithRetry src="https://framerusercontent.com/a.jpg" alt="a" retries={1} retryDelay={10} />);
        fireEvent.error(container.querySelector('img'));
        act(() => { vi.advanceTimersByTime(20); });
        expect(container.querySelector('img').getAttribute('src')).toMatch(/\?retry=1&t=\d+$/);

        fireEvent.error(container.querySelector('img'));
        expect(container.querySelector('img').getAttribute('src')).toBe('/blog-images/fadedcomputer.jpg');
    });
});
