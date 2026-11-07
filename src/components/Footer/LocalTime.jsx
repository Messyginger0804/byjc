'use client';

import { useEffect, useState } from 'react';

const format = () =>
    new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' }).format(new Date());

/**
 * "Dallas, TX · 3:07 PM". The time is filled in after mount (the server renders a fixed-width
 * placeholder), so there is no hydration mismatch.
 */
export default function LocalTime({ className = '' }) {
    const [time, setTime] = useState('');
    useEffect(() => {
        const tick = () => setTime(format());
        tick();
        const id = setInterval(tick, 30000);
        return () => clearInterval(id);
    }, []);
    return (
        <span className={className}>
            Dallas, TX
            <span className="inline-block min-w-[6.5ch] text-left" suppressHydrationWarning>
                {time ? <> &middot; {time}</> : null}
            </span>
        </span>
    );
}
