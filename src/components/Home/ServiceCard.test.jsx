import React from 'react';
// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ServiceCard from './ServiceCard';

let trigger;
let fire;
beforeEach(() => {
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.IntersectionObserver = class {
    constructor(cb) { fire = (v) => cb([{ isIntersecting: v }]); trigger = () => fire(true); }
    observe() {}
    disconnect() {}
  };
});
afterEach(cleanup);

describe('ServiceCard', () => {
  it('arms, then flags in-view when intersecting', () => {
    render(<ServiceCard className="x"><h3>Title</h3></ServiceCard>);
    const card = screen.getByText('Title').parentElement;
    expect(card.hasAttribute('data-armed')).toBe(true);
    expect(card.hasAttribute('data-inview')).toBe(false);
    trigger();
    expect(card.hasAttribute('data-inview')).toBe(true);
    fire(false);
    expect(card.hasAttribute('data-inview')).toBe(false);
  });
  it('is in view and armed immediately when already on screen at mount', () => {
    const spy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ top: 100, bottom: 400 });
    render(<ServiceCard><h3>Title</h3></ServiceCard>);
    const card = screen.getByText('Title').parentElement;
    expect(card.hasAttribute('data-armed')).toBe(true);
    expect(card.hasAttribute('data-inview')).toBe(true);
    spy.mockRestore();
  });
  it('drops in-view when the tab is hidden', () => {
    render(<ServiceCard><h3>Title</h3></ServiceCard>);
    const card = screen.getByText('Title').parentElement;
    trigger();
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(card.hasAttribute('data-inview')).toBe(false);
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(card.hasAttribute('data-inview')).toBe(true);
  });
  it('sets spotlight vars on pointer move', () => {
    render(<ServiceCard><h3>Title</h3></ServiceCard>);
    const card = screen.getByText('Title').parentElement;
    card.getBoundingClientRect = () => ({ left: 5, top: 10, right: 205, bottom: 110, width: 200, height: 100 });
    // jsdom has no PointerEvent, so build a MouseEvent (carries clientX/Y) and tag the pointer type.
    const ev = new MouseEvent('pointermove', { clientX: 20, clientY: 30, bubbles: true });
    Object.defineProperty(ev, 'pointerType', { value: 'mouse' });
    act(() => { card.dispatchEvent(ev); });
    expect(card.style.getPropertyValue('--mx')).toBe('15px');
    expect(card.style.getPropertyValue('--my')).toBe('20px');
  });
  it('skips arming under reduced motion', () => {
    window.matchMedia = () => ({ matches: true });
    render(<ServiceCard><h3>Title</h3></ServiceCard>);
    const card = screen.getByText('Title').parentElement;
    expect(card.hasAttribute('data-inview')).toBe(true);
    expect(card.hasAttribute('data-armed')).toBe(false);
  });
});
