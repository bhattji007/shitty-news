'use client';

import { useEffect, useRef } from 'react';
import { useAnchorMood } from './AnchorMoodProvider';
import { TICKER_SINCERITY } from '@/lib/copy';

const SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

/**
 * Enter the code on the front page and, for five seconds, he means it.
 *
 * Afterwards nothing acknowledges that it happened. There is no toast, no
 * counter, no achievement. That is the whole design.
 */
export default function KonamiListener() {
  const { setMoodFor, setTickerOverride } = useAnchorMood();
  const progress = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      const expected = SEQUENCE[progress.current];
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      if (key === expected) {
        progress.current += 1;
        if (progress.current === SEQUENCE.length) {
          progress.current = 0;
          setMoodFor('rare-sincerity', 5000);
          setTickerOverride(TICKER_SINCERITY, 5000);
        }
      } else {
        progress.current = key === SEQUENCE[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setMoodFor, setTickerOverride]);

  return null;
}
