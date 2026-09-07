'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { REACTIONS, ERRORS } from '@/lib/copy';

/**
 * Three reactions, logged-in only. Toggleable: you may feel a thing, and you
 * may stop feeling it, but you may not feel it twice.
 */
export default function ReactionBar({
  articleId,
  initialCounts,
  initialMine,
}: {
  articleId: string;
  initialCounts: Record<string, number>;
  initialMine: string[];
}) {
  const { data: session, status } = useSession();
  const [counts, setCounts] = useState(initialCounts);
  const [mine, setMine] = useState<string[]>(initialMine);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const signedIn = status === 'authenticated' && Boolean(session?.user);

  async function react(type: string) {
    setError(null);
    const wasOn = mine.includes(type);

    // Optimistic, then reconciled with whatever the server actually believes.
    setMine((m) => (wasOn ? m.filter((t) => t !== type) : [...m, type]));
    setCounts((c) => ({ ...c, [type]: Math.max(0, (c[type] ?? 0) + (wasOn ? -1 : 1)) }));

    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, type }),
      });
      const data = (await res.json()) as {
        counts?: Record<string, number>;
        mine?: string[];
        error?: string;
      };

      if (!res.ok) {
        setMine(initialMine);
        setCounts(initialCounts);
        setError(data.error ?? ERRORS.generic);
        return;
      }
      if (data.counts) setCounts(data.counts);
      if (data.mine) setMine(data.mine);
    } catch {
      setMine(initialMine);
      setCounts(initialCounts);
      setError(ERRORS.generic);
    }
  }

  return (
    <section aria-labelledby="reactions" className="border-t border-newsprint/10 pt-6">
      <h2 id="reactions" className="rubric-dim">
        Register a response
      </h2>

      <div className="mt-3 flex flex-wrap gap-2">
        {REACTIONS.map(({ type, label }) => {
          const active = mine.includes(type);
          return (
            <button
              key={type}
              type="button"
              disabled={!signedIn || pending}
              onClick={() => startTransition(() => void react(type))}
              className={`font-mono text-[12px] tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                active
                  ? 'border border-crt/60 bg-crt/10 px-3 py-2 text-crt'
                  : 'border border-newsprint/20 px-3 py-2 text-newsprint-dim hover:border-broadcast/50 hover:text-newsprint'
              }`}
              title={signedIn ? undefined : 'Sign in first. It changes nothing, but it is required.'}
            >
              [ {label} ]{' '}
              <span className="tabular-nums opacity-70">{counts[type] ?? 0}</span>
            </button>
          );
        })}
      </div>

      {!signedIn && status !== 'loading' && (
        <p className="mt-3 text-[12.5px] leading-relaxed text-newsprint-dim">
          Reactions require an account.{' '}
          <Link href="/login" className="text-broadcast hover:underline">
            Identify yourself
          </Link>
          , if you must. I will store three integers about you and resent every one of them.
        </p>
      )}

      {error && <p className="mt-3 font-mono text-[12px] leading-relaxed text-broadcast">{error}</p>}
    </section>
  );
}
