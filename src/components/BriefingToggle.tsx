'use client';

import { useState } from 'react';
import { ERRORS } from '@/lib/copy';

export default function BriefingToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const next = !on;
    setBusy(true);
    setError(null);
    setOn(next);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyBriefing: next }),
      });
      const data = (await res.json()) as { note?: string; error?: string };
      if (!res.ok) {
        setOn(!next);
        setError(data.error ?? ERRORS.generic);
      } else {
        setNote(data.note ?? null);
      }
    } catch {
      setOn(!next);
      setError(ERRORS.generic);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={on}
          disabled={busy}
          onClick={() => void toggle()}
          className={`mt-0.5 flex h-5 w-9 shrink-0 items-center border transition-colors disabled:opacity-50 ${
            on ? 'border-crt/60 bg-crt/20' : 'border-newsprint/25 bg-ink'
          }`}
        >
          <span
            className={`h-3.5 w-3.5 transition-transform ${
              on ? 'translate-x-[18px] bg-crt' : 'translate-x-[2px] bg-newsprint-dim'
            }`}
          />
        </button>
        <span className="text-[13.5px] leading-relaxed text-newsprint/80">
          Email me the daily briefing (why would you want this)
        </span>
      </label>

      {note && <p className="mt-2 font-mono text-[11.5px] leading-relaxed text-crt">{note}</p>}
      {error && <p className="mt-2 font-mono text-[11.5px] leading-relaxed text-broadcast">{error}</p>}
    </div>
  );
}
