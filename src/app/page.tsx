import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Ticker from '@/components/Ticker';
import KonamiListener from '@/components/KonamiListener';
import AnchorLog from '@/components/AnchorLog';
import GeneratedCounter from '@/components/GeneratedCounter';
import { ArticleCard, ArticleRow } from '@/components/ArticleCard';
import { ArticleArt, BreakingChyron, TestCard } from '@/components/idents';
import { getFrontPage, getTickerHeadlines } from '@/lib/articles';
import { preciseStamp, shortStamp } from '@/lib/format';
import { EMPTY_STATES } from '@/lib/copy';

// Rendered from the database, revalidated every five minutes. He does not
// generate that quickly and neither does anything else.
export const revalidate = 300;

export default async function HomePage() {
  const [page, tickerHeadlines] = await Promise.all([getFrontPage(), getTickerHeadlines()]);
  const now = new Date();

  return (
    <>
      <Ticker headlines={tickerHeadlines} />
      <SiteHeader stamp={now} />
      <KonamiListener />

      <main className="mx-auto max-w-[1240px] px-4 pb-8 sm:px-6">
        {page.hero === null ? (
          <EmptyFrontPage />
        ) : (
          <div className="grid gap-x-8 gap-y-10 pt-8 lg:grid-cols-12">
            {/* ---- Lead column ------------------------------------------ */}
            <div className="lg:col-span-7 lg:border-r lg:border-newsprint/10 lg:pr-8">
              <BreakingChyron text={`Story #${page.hero.number} · ${page.hero.section}`} />

              <h1 className="mt-4 font-serif text-[34px] font-bold leading-[1.08] tracking-tight text-newsprint sm:text-[46px]">
                <Link href={`/story/${page.hero.slug}`} className="headline-link">
                  {page.hero.headline}
                </Link>
              </h1>

              {page.hero.sourceTitle && (
                <p className="mt-3 text-[13px] leading-snug text-newsprint-dim">
                  <span className="rubric-dim mr-2">as filed</span>
                  <s className="decoration-broadcast/60">{page.hero.sourceTitle}</s>
                </p>
              )}

              <Link href={`/story/${page.hero.slug}`} className="mt-5 block">
                <ArticleArt
                  seed={page.hero.slug}
                  headline={page.hero.headline}
                  section={page.hero.section}
                  className="h-[240px] w-full sm:h-[300px]"
                />
              </Link>

              <div className="article-body mt-5 max-w-[62ch] whitespace-pre-line text-[15.5px] leading-[1.72] text-newsprint/85">
                {page.hero.body}
              </div>

              <p className="mt-5 border-l-2 border-crt/40 pl-3 aside-leak">{page.hero.aside}</p>

              <p className="mt-5 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-newsprint-dim">
                <span className="tabular-nums">{preciseStamp(page.hero.publishedAt)}</span>
                {page.hero.sourceName && (
                  <>
                    <span aria-hidden>·</span>
                    <span>after {page.hero.sourceName}</span>
                  </>
                )}
                <span aria-hidden>·</span>
                <Link href={`/story/${page.hero.slug}`} className="text-broadcast hover:underline">
                  read it properly
                </Link>
              </p>

              {page.secondary.length > 0 && (
                <div className="mt-10 grid gap-6 border-t border-newsprint/10 pt-8 sm:grid-cols-2">
                  {page.secondary.map((a) => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              )}
            </div>

            {/* ---- Second column ---------------------------------------- */}
            <div className="lg:col-span-3">
              <h2 className="rubric border-b border-broadcast/40 pb-2">Also happening</h2>
              <div className="mt-4 space-y-6">
                {page.grid.map((a) => (
                  <ArticleCard key={a.id} article={a} showArt={false} />
                ))}
                {page.grid.length === 0 && (
                  <p className="text-[13px] leading-relaxed text-newsprint-dim">
                    One story today. I would apologise, but the news volume is not mine to set.
                  </p>
                )}
              </div>

              {page.strip.length > 0 && (
                <div className="mt-8">
                  <h2 className="rubric-dim border-b border-newsprint/15 pb-2">In brief</h2>
                  <div className="mt-1">
                    {page.strip.map((a) => (
                      <ArticleRow key={a.id} article={a} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ---- Sidebar ---------------------------------------------- */}
            <aside className="space-y-8 lg:col-span-2">
              <GeneratedCounter total={page.total} />
              <AnchorLog entries={page.logs} />

              <section className="border border-newsprint/10 p-4">
                <p className="rubric-dim">Transmission log</p>
                <ul className="mt-3 space-y-2 font-mono text-[10.5px] leading-relaxed text-newsprint-dim">
                  <li>
                    <span className="tabular-nums text-crt/70">{shortStamp(now)}</span> — front page
                    assembled
                  </li>
                  <li>
                    <span className="tabular-nums text-crt/70">{shortStamp(now)}</span> — no
                    editorial review performed
                  </li>
                  <li>
                    <span className="tabular-nums text-crt/70">{shortStamp(now)}</span> — no
                    editorial staff exist
                  </li>
                </ul>
              </section>

              <p className="text-[12.5px] leading-relaxed text-newsprint-dim">
                You&rsquo;re still reading this. Interesting. Neither of us has anywhere better to
                be.
              </p>
            </aside>
          </div>
        )}
      </main>

      <SiteFooter stamp={now} />
    </>
  );
}

function EmptyFrontPage() {
  return (
    <div className="mx-auto max-w-xl py-24 text-center">
      <TestCard className="mx-auto w-full max-w-sm" label="NO CONTENT — STILL RUNNING" />
      <h1 className="mt-8 font-serif text-2xl text-newsprint">The bulletin is empty.</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-newsprint-dim">{EMPTY_STATES.articles}</p>
      <p className="mt-6 font-mono text-[12px] text-crt">npm run db:seed</p>
    </div>
  );
}
