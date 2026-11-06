import React from 'react';
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import InsightBanner from './InsightBanner';

afterEach(cleanup);

describe('InsightBanner', () => {
  it('renders nothing without insights', () => {
    const { container } = render(<InsightBanner insights={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a labelled band with a duplicated, aria-hidden loop row', () => {
    const { container } = render(<InsightBanner insights={['One', 'Two']} />);
    expect(screen.getByRole('region', { name: 'Highlights' })).toBeTruthy();
    const lists = container.querySelectorAll('ul');
    expect(lists.length).toBe(2);
    expect(lists[1].getAttribute('aria-hidden')).toBe('true');
  });

  it('puts the pause pill inside the band and toggles pause state', () => {
    render(<InsightBanner insights={['One']} />);
    const band = screen.getByRole('region', { name: 'Highlights' });
    const btn = screen.getByRole('button', { name: 'Pause highlights' });
    expect(band.contains(btn)).toBe(true);
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(btn);
    expect(band.hasAttribute('data-paused')).toBe(true);
    const play = screen.getByRole('button', { name: 'Play highlights' });
    expect(play.getAttribute('aria-pressed')).toBe('true');
  });
});
