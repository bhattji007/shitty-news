'use client';

import { useEffect, useState } from 'react';
import { TAGLINE_DEFAULT, TAGLINE_LATE } from '@/lib/copy';

/**
 * Between 3 and 4 in the morning, local time to whoever is reading, the tagline
 * changes. It is not announced. It changes back at four.
 */
export default function Tagline({ className = '' }: { className?: string }) {
  const [text, setText] = useState(TAGLINE_DEFAULT);

  useEffect(() => {
    const check = () => {
      const hour = new Date().getHours();
      setText(hour === 3 ? TAGLINE_LATE : TAGLINE_DEFAULT);
    };
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  return <span className={className}>{text}</span>;
}
