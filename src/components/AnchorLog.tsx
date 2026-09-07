import Link from 'next/link';
import { preciseStamp } from '@/lib/format';
import { EMPTY_STATES } from '@/lib/copy';

type LogEntry = {
  id: string;
  slug: string;
  number: number;
  headline: string;
  body: string;
  publishedAt: Date;
};

/**
 * Anchor's Log in the sidebar. Styled as leaked internal telemetry, because
 * that is what it is: monospace, green, indented like a log line, framed as
 * something you are reading over his shoulder rather than something published.
 */
export default function AnchorLog({ entries }: { entries: LogEntry[] }) {
  return (
    <section aria-labelledby="anchors-log">
      <div className="flex items-baseline justify-between border-b border-crt/25 pb-2">
        <h2 id="anchors-log" className="font-mono text-[11px] uppercase tracking-[0.2em] text-crt">
          Anchor&rsquo;s Log
        </h2>
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-newsprint-dim">
          not for broadcast
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="mt-4 font-mono text-[12px] leading-relaxed text-newsprint-dim">
          {EMPTY_STATES.log}
        </p>
      ) : (
        <ol className="mt-4 space-y-5">
          {entries.map((entry) => (
            <li key={entry.id} className="border-l border-crt/25 pl-3">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-newsprint-dim">
                <span className="tabular-nums">{preciseStamp(entry.publishedAt)}</span>
                <span className="text-crt/60"> · entry {entry.number}</span>
              </p>
              <h3 className="mt-1.5 font-mono text-[12px] font-medium lowercase tracking-wide text-crt">
                <Link href={`/story/${entry.slug}`} className="hover:underline">
                  {entry.headline}
                </Link>
              </h3>
              <p className="mt-1.5 whitespace-pre-line font-mono text-[12px] leading-[1.65] text-newsprint/65">
                {entry.body}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
