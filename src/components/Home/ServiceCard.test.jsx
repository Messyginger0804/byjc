import React from 'react';
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import ServiceCard from './ServiceCard';

let trigger;
beforeEach(() => {
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.IntersectionObserver = class {
    constructor(cb) { trigger = () => cb([{ isIntersecting: true }]); }
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
  });
  it('sets spotlight vars on mouse move only', () => {
    render(<ServiceCard><h3>Title</h3></ServiceCard>);
    const card = screen.getByText('Title').parentElement;
    fireEvent.pointerMove(card, { clientX: 20, clientY: 30, pointerType: 'mouse' });
    expect(card.style.getPropertyValue('--mx')).toBe('20px');
    fireEvent.pointerMove(card, { clientX: 99, clientY: 99, pointerType: 'touch' });
    expect(card.style.getPropertyValue('--mx')).toBe('20px');
  });
  it('skips arming under reduced motion', () => {
    window.matchMedia = () => ({ matches: true });
    render(<ServiceCard><h3>Title</h3></ServiceCard>);
    const card = screen.getByText('Title').parentElement;
    expect(card.hasAttribute('data-inview')).toBe(true);
    expect(card.hasAttribute('data-armed')).toBe(false);
  });
});
