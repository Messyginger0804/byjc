'use client';

import Image from 'next/image';
import { m } from 'motion/react';

export default function JokeAvatar({ avatarSrc, onError }) {
  return (
    <m.div
      key={avatarSrc}
      className="relative h-28 w-28 flex-shrink-0 md:h-36 md:w-36"
      initial={{ scale: 0.7, rotate: -8 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 14 }}
    >
      <Image
        src={avatarSrc}
        alt="JC's reaction"
        fill
        className="object-contain drop-shadow-lg"
        onError={onError}
        unoptimized
      />
    </m.div>
  );
}
