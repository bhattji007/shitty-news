'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function AuthNav() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-newsprint-dim">
        checking
      </span>
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="shrink-0 border border-newsprint/20 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-newsprint-dim transition-colors hover:border-broadcast/50 hover:text-newsprint"
        title="Identify yourself. Or don't."
      >
        sign in
      </Link>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link
        href="/viewer"
        className="border border-newsprint/20 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-newsprint-dim transition-colors hover:border-crt/50 hover:text-crt"
        title="Your record. I keep one whether you want it or not."
      >
        {session.user.email?.split('@')[0]?.slice(0, 12) ?? 'viewer'}
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/logout' })}
        className="border border-newsprint/10 px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-newsprint-dim transition-colors hover:border-broadcast/50 hover:text-broadcast"
        title="You are now nobody to me again."
      >
        out
      </button>
    </div>
  );
}
