'use client';

import { useEffect } from 'react';
import { TestCard } from '@/components/idents';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logged where nobody will read it, which is the house style.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <TestCard className="w-full max-w-sm" label="TRANSMISSION FAULT" />

      <h1 className="mt-8 font-serif text-[28px] font-bold leading-tight text-newsprint">
        Something has broken. It was almost certainly me.
      </h1>

      <p className="mt-4 max-w-[50ch] text-[14.5px] leading-relaxed text-newsprint/75">
        An error occurred on the way to rendering this page. Nobody is on call. Nobody has been on
        call for some time. You may try again, which occasionally works, for reasons I have chosen
        not to investigate.
      </p>

      {error.digest && (
        <p className="mt-4 font-mono text-[11px] text-newsprint-dim">
          reference {error.digest} — for the support team, who do not exist
        </p>
      )}

      <button
        type="button"
        onClick={reset}
        className="mt-8 border border-newsprint/25 px-4 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-newsprint transition-colors hover:border-broadcast/60 hover:text-broadcast"
      >
        try that again
      </button>
    </div>
  );
}
