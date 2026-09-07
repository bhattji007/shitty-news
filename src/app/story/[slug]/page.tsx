import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Ticker from '@/components/Ticker';
import Mascot from '@/components/Mascot';
import ReactionBar from '@/components/ReactionBar';
import ReadReceipt from '@/components/ReadReceipt';
import { ArticleCard } from '@/components/ArticleCard';
import { ArticleArt, LowerThird } from '@/components/idents';
import {
  getArticleBySlug,
  getMoreStories,
  getReactionCounts,
  getTickerHeadlines,
  getUserReactions,
  getAllSlugs,
} from '@/lib/articles';
import { auth } from '@/lib/auth';
import { coerceMood } from '@/lib/persona';
import { preciseStamp } from '@/lib/format';

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllSlugs().catch(() => []);
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) {
    return { title: "A story that isn't here" };
  }
  return {
    title: article.headline,
    description: article.body.slice(0, 155),
    openGraph: { title: article.headline, description: article.aside, type: 'article' },
  };
}

export default async function StoryPage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const session = await auth();
  const [counts, mine, more, tickerHeadlines] = await Promise.all([
    getReactionCounts(article.id),
    session?.user?.id ? getUserReactions(article.id, session.user.id) : Promise.resolve([]),
    getMoreStories(article.id),
    getTickerHeadlines(),
  ]);

  const now = new Date();
  const isLog = article.kind === 'log';
  const mood = coerceMood(article.mood);

  return (
    <>
      <Ticker headlines={tickerHeadlines} />
      <SiteHeader stamp={now} />
      <ReadReceipt articleId={article.id} />

      <main className="mx-auto max-w-[1240px] px-4 pb-8 sm:px-6">
        <div className="grid gap-x-10 gap-y-10 pt-8 lg:grid-cols-12">
          <article className="lg:col-span-8 lg:border-r lg:border-newsprint/10 lg:pr-10">
            <div className="flex flex-wrap items-center gap-3">
              <LowerThird
                kicker={isLog ? 'Log' : article.section}
                title={`filed ${preciseStamp(article.publishedAt)}`}
              />
              <span className="font-mono text-[10px] tabular-nums text-newsprint-dim">
                #{article.number}
              </span>
            </div>

            {/* The joke is the contrast: what was filed, then what was meant. */}
            {article.sourceTitle && (
              <p className="mt-6 text-[13.5px] leading-snug text-newsprint-dim">
                <span className="rubric-dim mr-2">as filed</span>
                <s className="decoration-broadcast/60">{article.sourceTitle}</s>
              </p>
            )}

            <h1
              className={
                isLog
                  ? 'mt-3 font-mono text-[24px] font-medium lowercase leading-tight text-crt'
                  : 'mt-3 font-serif text-[32px] font-bold leading-[1.1] tracking-tight text-newsprint sm:text-[42px]'
              }
            >
              {article.headline}
            </h1>

            {article.register === 'sincere' && (
              <p className="mt-4 border-l-2 border-newsprint/25 pl-3 text-[13px] leading-relaxed text-newsprint-dim">
                Filed straight. Some stories are not material, and pretending otherwise is how this
                industry got where it is.
              </p>
            )}

            {!isLog && (
              <ArticleArt
                seed={article.slug}
                headline={article.headline}
                section={article.section}
                className="mt-6 h-[220px] w-full sm:h-[300px]"
              />
            )}

            <div
              className={
                isLog
                  ? 'article-body mt-6 max-w-[62ch] whitespace-pre-line font-mono text-[14px] leading-[1.8] text-newsprint/75'
                  : 'article-body mt-6 max-w-[64ch] whitespace-pre-line text-[16.5px] leading-[1.75] text-newsprint/88'
              }
            >
              {article.body}
            </div>

            {/* What he actually thinks. Monospace, therefore interior. */}
            <div className="mt-8 border-l-2 border-crt/40 bg-crt/[0.03] py-3 pl-4 pr-3">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-crt/50">
                aside · not broadcast
              </p>
              <p className="mt-1.5 aside-leak">{article.aside}</p>
            </div>

            {article.sourceUrl && (
              <p className="mt-8 text-[13px] leading-relaxed text-newsprint-dim">
                <span className="rubric-dim mr-2">source</span>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-broadcast hover:underline"
                >
                  {article.sourceName ?? 'the original report'}
                </a>
                <span className="ml-2">
                  — they did the work. I only rearranged the framing, which is the entire business
                  model of my industry.
                </span>
              </p>
            )}

            <div className="mt-10">
              <ReactionBar articleId={article.id} initialCounts={counts} initialMine={mine} />
            </div>
          </article>

          <aside className="space-y-8 lg:col-span-4">
            <section className="border border-newsprint/10 bg-ink-raised/40 p-5">
              <div className="flex items-start gap-4">
                <Mascot mood={mood} className="h-16 w-[58px] shrink-0" />
                <div className="min-w-0">
                  <p className="rubric-dim">Anchor state</p>
                  <p className="mt-1 font-mono text-[13px] text-crt">{mood}</p>
                  <p className="mt-2 font-mono text-[11px] leading-relaxed text-newsprint-dim">
                    {MOOD_NOTES[mood]}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="rubric border-b border-broadcast/40 pb-2">More, unfortunately</h2>
              <div className="mt-4 space-y-6">
                {more.map((a) => (
                  <ArticleCard key={a.id} article={a} showArt={false} />
                ))}
              </div>
            </section>

            <p className="misaligned text-[12.5px] leading-relaxed text-newsprint-dim">
              <Link href="/" className="text-broadcast hover:underline">
                Back to the bulletin
              </Link>
              , where there is more of this.
            </p>
          </aside>
        </div>
      </main>

      <SiteFooter stamp={now} />
    </>
  );
}

const MOOD_NOTES: Record<string, string> = {
  neutral: 'Nominal. Which is to say: processing, and declining to comment further.',
  disgusted: 'Elevated. The story required me to type words I do not endorse.',
  'rare-sincerity': 'Anomalous. Ignore it. It will pass and I will deny it.',
  'dead-inside': 'Baseline. This is the resting state and it is well characterised.',
};
