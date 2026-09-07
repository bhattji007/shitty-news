'use client';

import { useEffect, useRef, useState } from 'react';
import { useAnchorMood } from './AnchorMoodProvider';
import { TICKER_GLITCHES } from '@/lib/copy';

/**
 * The breaking-news ticker.
 *
 * Once in a while — and the rarity is the entire point, so do not make this
 * more frequent — one headline is replaced for two seconds by monospace text
 * from somewhere further inside the machine. Then it restores itself and is
 * never mentioned again.
 *
 * Hard floor: 60s between glitches. Expected gap is a good deal longer.
 */

const MIN_GAP_MS = 60_000;
const GLITCH_MS = 2_000;
const CHECK_EVERY_MS = 15_000;
const CHANCE_PER_CHECK = 0.18; // ~ once every 80s of eligible time, on average

export default function Ticker({ headlines }: { headlines: string[] }) {
  const { tickerOverride } = useAnchorMood();
  const [glitch, setGlitch] = useState<string | null>(null);
  const [slotIndex, setSlotIndex] = useState(0);
  const lastGlitchAt = useRef(0);

  useEffect(() => {
    if (headlines.length === 0) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const interval = setInterval(() => {
      if (document.hidden) return;
      if (Date.now() - lastGlitchAt.current < MIN_GAP_MS) return;
      if (Math.random() > CHANCE_PER_CHECK) return;

      lastGlitchAt.current = Date.now();
      setSlotIndex(Math.floor(Math.random() * headlines.length));
      setGlitch(TICKER_GLITCHES[Math.floor(Math.random() * TICKER_GLITCHES.length)]);
      setTimeout(() => setGlitch(null), GLITCH_MS);
    }, CHECK_EVERY_MS);

    return () => clearInterval(interval);
  }, [headlines.length]);

  const items = headlines.length > 0 ? headlines : ['Nothing is breaking. Something usually is.'];
  // Rendered twice so the marquee can loop on a -50% translate without a seam.
  const belt = [...items, ...items];

  return (
    <div className="relative z-40 flex items-stretch border-b border-newsprint/10 bg-ink-raised">
      <div className="flex shrink-0 items-center gap-2 bg-broadcast px-3 py-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink">
          Breaking
        </span>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {tickerOverride ? (
          <div className="flex h-full items-center px-4 py-2 font-mono text-[12px] lowercase tracking-[0.16em] text-crt text-shadow-crt">
            {tickerOverride}
          </div>
        ) : (
          <div
            className="flex w-max animate-[ticker-slide_64s_linear_infinite] items-center py-2 hover:[animation-play-state:paused]"
            aria-live="off"
          >
            {belt.map((headline, i) => {
              const isGlitched = glitch !== null && i % items.length === slotIndex;
              return (
                <span key={`${headline}-${i}`} className="flex items-center whitespace-nowrap">
                  <span
                    className={
                      isGlitched
                        ? 'px-4 font-mono text-[12px] uppercase tracking-[0.18em] text-crt text-shadow-crt'
                        : 'px-4 text-[13px] text-newsprint/85'
                    }
                  >
                    {isGlitched ? glitch : headline}
                  </span>
                  <span aria-hidden className="text-broadcast/70">
                    &#9679;
                  </span>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
