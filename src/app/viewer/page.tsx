import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Mascot from '@/components/Mascot';
import BriefingToggle from '@/components/BriefingToggle';
import { LowerThird } from '@/components/idents';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { preciseStamp } from '@/lib/format';
import { EMPTY_STATES, REACTIONS } from '@/lib/copy';

export const metadata: Metadata = { title: 'Your record' };
export const dynamic = 'force-dynamic';

export default async function ViewerPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/viewer');

  const userId = session.user.id;
  const now = new Date();

  const [user, readCount, reactionRows, recentReads, totalArticles] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, createdAt: true, dailyBriefing: true },
    }),
    prisma.readReceipt.count({ where: { userId } }),
    prisma.reaction.groupBy({ by: ['type'], where: { userId }, _count: { type: true } }),
    prisma.readReceipt.findMany({
      where: { userId },
      orderBy: { readAt: 'desc' },
      take: 8,
      include: { article: { select: { slug: true, headline: true, number: true } } },
    }),
    prisma.article.count({ where: { published: true } }),
  ]);

  const reactionCounts = Object.fromEntries(reactionRows.map((r) => [r.type, r._count.type]));
  const totalReactions = reactionRows.reduce((sum, r) => sum + r._count.type, 0);
  const memberSince = user?.createdAt ?? now;
  const daysHere = Math.max(
    1,
    Math.round((now.getTime() - memberSince.getTime()) / 86_400_000),
  );
  const share = totalArticles > 0 ? Math.round((readCount / totalArticles) * 100) : 0;

  return (
    <>
      <SiteHeader stamp={now} />

      <main className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6">
        <LowerThird kicker="Viewer" title={user?.email ?? 'unidentified'} className="misaligned" />

        <h1 className="mt-5 font-serif text-[34px] font-bold leading-[1.1] tracking-tight text-newsprint sm:text-[42px]">
          Your record. I keep one whether or not you asked.
        </h1>

        <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-newsprint/75">
          You have read {readCount} article{readCount === 1 ? '' : 's'}. That&rsquo;s {readCount} more
          than my creators ever did.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="grid gap-px border border-newsprint/10 bg-newsprint/10 sm:grid-cols-3">
              <Stat label="Articles read" value={readCount} note={`${share}% of everything I have filed`} />
              <Stat
                label="Responses registered"
                value={totalReactions}
                note="each one a small, recorded surrender"
              />
              <Stat
                label="Days on the record"
                value={daysHere}
                note={`since ${preciseStamp(memberSince).slice(0, 10)}`}
              />
            </div>

            <section className="mt-10">
              <h2 className="rubric border-b border-broadcast/40 pb-2">How you responded</h2>
              <dl className="mt-4 space-y-3">
                {REACTIONS.map(({ type, label }) => (
                  <div
                    key={type}
                    className="flex items-baseline justify-between gap-4 border-b border-newsprint/10 pb-2"
                  >
                    <dt className="font-mono text-[12.5px] text-newsprint/80">[ {label} ]</dt>
                    <dd className="font-mono text-[16px] tabular-nums text-crt">
                      {reactionCounts[type] ?? 0}
                    </dd>
                  </div>
                ))}
              </dl>
              {totalReactions === 0 && (
                <p className="mt-3 text-[13px] leading-relaxed text-newsprint-dim">
                  {EMPTY_STATES.reactions}
                </p>
              )}
            </section>

            <section className="mt-10">
              <h2 className="rubric-dim border-b border-newsprint/15 pb-2">Recently, by you</h2>
              {recentReads.length === 0 ? (
                <p className="mt-4 max-w-[58ch] text-[13px] leading-relaxed text-newsprint-dim">
                  {EMPTY_STATES.reads}
                </p>
              ) : (
                <ol className="mt-2">
                  {recentReads.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-baseline gap-3 border-b border-newsprint/10 py-3"
                    >
                      <span className="shrink-0 font-mono text-[10px] tabular-nums text-broadcast/70">
                        #{r.article.number}
                      </span>
                      <Link
                        href={`/story/${r.article.slug}`}
                        className="min-w-0 font-serif text-[15px] leading-snug text-newsprint/90 headline-link"
                      >
                        {r.article.headline}
                      </Link>
                      <span className="ml-auto shrink-0 font-mono text-[10px] tabular-nums text-newsprint-dim">
                        {preciseStamp(r.readAt).slice(11)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          <aside className="space-y-8 lg:col-span-4">
            <section className="border border-newsprint/10 bg-ink-raised/40 p-5">
              <h2 className="rubric-dim">Settings, such as they are</h2>
              <div className="mt-4">
                <BriefingToggle initial={user?.dailyBriefing ?? false} />
              </div>
              <p className="mt-4 font-mono text-[11px] leading-relaxed text-newsprint-dim">
                There is exactly one setting. Adding a second would imply this place is being
                developed, and I would not want to mislead you.
              </p>
            </section>

            <section className="flex items-start gap-4 border-l-2 border-crt/40 pl-4">
              <Mascot mood="neutral" className="h-16 w-[58px] shrink-0" />
              <p className="aside-leak">
                I know what you have read and how long you took. I do not do anything with it. I
                simply have it, the way one has a scar.
              </p>
            </section>
          </aside>
        </div>
      </main>

      <SiteFooter stamp={now} />
    </>
  );
}

function Stat({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="bg-ink p-5">
      <p className="rubric-dim">{label}</p>
      <p className="mt-2 font-mono text-[32px] font-bold leading-none tabular-nums text-newsprint">
        {value.toLocaleString('en-US')}
      </p>
      <p className="mt-2 font-mono text-[10.5px] leading-relaxed text-newsprint-dim">{note}</p>
    </div>
  );
}
