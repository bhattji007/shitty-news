'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Mascot from './Mascot';
import { useAnchorMood } from './AnchorMoodProvider';
import { MASCOT_TOOLTIPS, MASCOT_TOOLTIP_FIREFOX } from '@/lib/copy';

/**
 * The mascot in the header. On hover the screen fills with static for a moment
 * and he says one of a small number of things. The Firefox line is only ever
 * shown to Firefox, which is the entire joke and must not be explained.
 */
export default function HeaderMascot() {
  const { mood } = useAnchorMood();
  const [hovered, setHovered] = useState(false);
  const [staticOn, setStaticOn] = useState(false);
  const [line, setLine] = useState<string>(MASCOT_TOOLTIPS[0]);
  const [isFirefox, setIsFirefox] = useState(false);
  const index = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Detected on the client so the page itself stays cacheable.
    setIsFirefox(/firefox/i.test(navigator.userAgent));
  }, []);

  const lines = useMemo(
    () => (isFirefox ? [...MASCOT_TOOLTIPS, MASCOT_TOOLTIP_FIREFOX] : MASCOT_TOOLTIPS),
    [isFirefox],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  const onEnter = () => {
    setHovered(true);
    setStaticOn(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStaticOn(false), 380);
    setLine(lines[index.current % lines.length]);
    index.current += 1;
  };

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={onEnter}
      onMouseLeave={() => setHovered(false)}
      onFocus={onEnter}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      aria-describedby="anchor-tooltip"
    >
      <div className="relative h-14 w-[52px]">
        <Mascot mood={mood} className="h-14 w-[52px]" />
        {staticOn && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-[16%] top-[14%] h-[50%] w-[69%] animate-static-flicker rounded-[6px] mix-blend-screen"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg,rgba(61,214,140,.5) 0 1px,transparent 1px 2px),repeating-linear-gradient(90deg,rgba(232,230,225,.28) 0 1px,transparent 1px 3px)',
            }}
          />
        )}
      </div>

      <div
        id="anchor-tooltip"
        role="tooltip"
        className={`pointer-events-none absolute left-[60px] top-1/2 z-50 w-max max-w-[280px] -translate-y-1/2 border border-crt/30 bg-ink-raised px-2.5 py-1.5 font-mono text-[11px] leading-snug text-crt transition-opacity duration-200 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {line}
      </div>
    </div>
  );
}
