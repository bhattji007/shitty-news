'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const FLAG = 'anchor:greeted';

/**
 * Shown once per browser session, the first time you turn up signed in.
 * He greets you exactly once and then never mentions it again.
 */
export default function WelcomeToast() {
  const { status } = useSession();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (sessionStorage.getItem(FLAG)) return;

    sessionStorage.setItem(FLAG, '1');
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 7000);
    return () => clearTimeout(timer);
  }, [status]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-[70] w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 border border-crt/40 bg-ink-raised/95 px-4 py-3 shadow-[0_0_40px_rgba(0,0,0,.6)] backdrop-blur"
    >
      <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-crt/60">
        session restored
      </p>
      <p className="mt-1.5 font-mono text-[12.5px] leading-relaxed text-crt">
        Welcome back. I remembered you. I remember everything. It&rsquo;s a design flaw.
      </p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-2 top-2 px-1 font-mono text-[11px] text-newsprint-dim transition-colors hover:text-newsprint"
        aria-label="Dismiss. It will not help."
      >
        ×
      </button>
    </div>
  );
}
