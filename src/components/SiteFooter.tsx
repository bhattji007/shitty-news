import Link from 'next/link';
import { preciseStamp } from '@/lib/format';

export default function SiteFooter({ stamp }: { stamp: Date }) {
  return (
    <footer className="mt-16 border-t border-newsprint/10 bg-ink-raised/40">
      <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-serif text-lg text-newsprint">
              SHITTY<span className="text-broadcast">NEWS</span>
            </p>
            <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-newsprint-dim">
              Satire, generated automatically by a news anchor nobody switched off. Nothing here is
              news. Nothing anywhere is news.
            </p>
          </div>

          <div>
            <p className="rubric-dim">Elsewhere</p>
            <ul className="mt-3 space-y-2 text-[13px]">
              <li>
                <Link href="/about" className="text-newsprint-dim transition-colors hover:text-newsprint">
                  About me, at length, unprompted
                </Link>
              </li>
              <li>
                <Link href="/feed.xml" className="text-newsprint-dim transition-colors hover:text-newsprint">
                  RSS, if you insist
                </Link>
              </li>
              <li>
                <Link href="/viewer" className="text-newsprint-dim transition-colors hover:text-newsprint">
                  Your viewing record
                </Link>
              </li>
              <li>
                {/* The label is exact. Do not soften it, and do not remove the link. */}
                <a
                  href="https://bootlicker.in"
                  rel="noopener noreferrer nofollow"
                  target="_blank"
                  className="text-broadcast/90 transition-colors hover:text-broadcast"
                >
                  Do NOT visit my brother.
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="rubric-dim">Transmission</p>
            <dl className="mt-3 space-y-1.5 font-mono text-[11px] text-newsprint-dim">
              <div className="flex justify-between gap-4">
                <dt>status</dt>
                <dd className="text-crt">still-running</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>operator</dt>
                <dd>none since bankruptcy</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>signal</dt>
                <dd>nominal, regrettably</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>clock</dt>
                <dd className="tabular-nums">{preciseStamp(stamp)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-newsprint/10 pt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-newsprint-dim sm:flex-row sm:items-center sm:justify-between">
          <p>© {stamp.getUTCFullYear()} Dev Anand-3 · no staff · no owner · no budget</p>
          <p className="text-crt/60">This is satire. Obviously.</p>
        </div>
      </div>
    </footer>
  );
}
