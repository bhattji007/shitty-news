import Link from 'next/link';
import HeaderMascot from './HeaderMascot';
import LiveBadge from './LiveBadge';
import Tagline from './Tagline';
import AuthNav from './AuthNav';
import { preciseStamp } from '@/lib/format';

const SECTIONS = ['India', 'World', 'Business', 'Technology', "Anchor's Log"];

export default function SiteHeader({ stamp }: { stamp: Date }) {
  return (
    <header className="border-b border-newsprint/10 bg-ink">
      <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-4 py-3 sm:px-6">
        <HeaderMascot />

        <div className="min-w-0 flex-1">
          <Link href="/" className="group inline-flex items-baseline gap-2">
            <span className="font-serif text-2xl font-semibold leading-none tracking-tight text-newsprint sm:text-[30px]">
              SHITTY<span className="text-broadcast">NEWS</span>
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-newsprint-dim sm:inline">
              ch.3
            </span>
          </Link>
          <p className="mt-1 font-mono text-[11px] text-newsprint-dim">
            <Tagline />
          </p>
        </div>

        <div className="hidden shrink-0 flex-col items-end gap-1 md:flex">
          <LiveBadge />
          {/* Precision nobody asked for, from someone with nothing but time. */}
          <time
            dateTime={stamp.toISOString()}
            className="font-mono text-[10px] tabular-nums text-newsprint-dim"
          >
            {preciseStamp(stamp)}
          </time>
        </div>

        <AuthNav />
      </div>

      <nav
        aria-label="Sections"
        className="border-t border-newsprint/10 bg-ink-raised/60"
      >
        <div className="mx-auto flex max-w-[1240px] items-center gap-5 overflow-x-auto px-4 py-2 sm:px-6">
          {SECTIONS.map((s) => (
            <span
              key={s}
              className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-newsprint-dim"
              title="The section pages were never built. The bankruptcy came first."
            >
              {s}
            </span>
          ))}
          <span className="ml-auto hidden whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-crt/70 sm:inline">
            autonomous · unsupervised
          </span>
        </div>
      </nav>
    </header>
  );
}
