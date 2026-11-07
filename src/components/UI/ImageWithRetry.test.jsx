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

    it('forwards onLoad', () => {
        const onLoad = vi.fn();
        const { container } = render(<ImageWithRetry src="/a.jpg" alt="a" onLoad={onLoad} />);
        fireEvent.load(container.querySelector('img'));
        expect(onLoad).toHaveBeenCalledTimes(1);
    });

    it('does not throw on load without an onLoad handler', () => {
        const { container } = render(<ImageWithRetry src="/a.jpg" alt="a" />);
        expect(() => fireEvent.load(container.querySelector('img'))).not.toThrow();
    });

    it('reports the error to onError once even the fallback fails, and stays on the fallback', () => {
        const onError = vi.fn();
        const { container } = render(<ImageWithRetry src="/a.jpg" alt="a" retries={0} onError={onError} />);
        fireEvent.error(container.querySelector('img'));
        expect(container.querySelector('img').getAttribute('src')).toBe('/blog-images/fadedcomputer.jpg');
        expect(onError).not.toHaveBeenCalled();
        fireEvent.error(container.querySelector('img'));
        expect(onError).toHaveBeenCalledTimes(1);
        expect(container.querySelector('img').getAttribute('src')).toBe('/blog-images/fadedcomputer.jpg');
    });

    it('does not throw when the fallback fails and no onError is given', () => {
        const { container } = render(<ImageWithRetry src="/blog-images/fadedcomputer.jpg" alt="a" />);
        expect(() => fireEvent.error(container.querySelector('img'))).not.toThrow();
    });

    it('uses the fallback image when src is missing, and a default alt when alt is missing', () => {
        const { container } = render(<ImageWithRetry />);
        const img = container.querySelector('img');
        expect(img.getAttribute('src')).toBe('/blog-images/fadedcomputer.jpg');
        expect(img.getAttribute('alt')).toBe('Blog post illustration');
    });

    it('keeps an explicitly empty alt for decorative images', () => {
        const { container } = render(<ImageWithRetry src="/a.jpg" alt="" />);
        expect(container.querySelector('img').getAttribute('alt')).toBe('');
    });

    it('appends the retry parameter with & when a remote URL already has a query string', () => {
        const { container } = render(<ImageWithRetry src="https://cdn.example.com/a.jpg?w=100" alt="a" retries={1} retryDelay={10} />);
        fireEvent.error(container.querySelector('img'));
        act(() => { vi.advanceTimersByTime(20); });
        expect(container.querySelector('img').getAttribute('src')).toMatch(/\?w=100&retry=1&t=\d+$/);
    });

    it('cancels a pending retry on unmount', () => {
        const { container, unmount } = render(<ImageWithRetry src="/a.jpg" alt="a" retries={2} retryDelay={10} />);
        fireEvent.error(container.querySelector('img'));
        expect(vi.getTimerCount()).toBe(1);
        unmount();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('resets retries and loads the new image when src changes', () => {
        const { container, rerender } = render(<ImageWithRetry src="/a.jpg" alt="a" retries={1} retryDelay={10} />);
        fireEvent.error(container.querySelector('img'));
        fireEvent.error(container.querySelector('img'));
        rerender(<ImageWithRetry src="/b.jpg" alt="b" retries={1} retryDelay={10} />);
        expect(container.querySelector('img').getAttribute('src')).toBe('/b.jpg');
        fireEvent.error(container.querySelector('img'));
        act(() => { vi.advanceTimersByTime(20); });
        expect(container.querySelector('img').getAttribute('src')).toBe('/b.jpg');
    });

    it('picks up updated retries and retryDelay props', () => {
        const { container, rerender } = render(<ImageWithRetry src="/a.jpg" alt="a" retries={0} retryDelay={10} />);
        rerender(<ImageWithRetry src="/a.jpg" alt="a" retries={1} retryDelay={500} />);
        const first = container.querySelector('img');
        fireEvent.error(first);
        act(() => { vi.advanceTimersByTime(100); });
        expect(container.querySelector('img')).toBe(first);
        act(() => { vi.advanceTimersByTime(450); });
        expect(container.querySelector('img')).not.toBe(first);
    });
});
