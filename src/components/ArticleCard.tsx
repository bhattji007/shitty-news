import Link from 'next/link';
import { ArticleArt } from './idents';
import { shortStamp } from '@/lib/format';

type CardArticle = {
  slug: string;
  number: number;
  headline: string;
  body: string;
  aside: string;
  section: string;
  sourceName: string | null;
  publishedAt: Date;
};

export function ArticleCard({
  article,
  showArt = true,
  showBlurb = true,
}: {
  article: CardArticle;
  showArt?: boolean;
  showBlurb?: boolean;
}) {
  const blurb = article.body.split('\n\n')[0];

  return (
    <article className="group flex flex-col border-t border-newsprint/10 pt-4">
      <div className="flex items-center gap-2">
        <span className="rubric">{article.section}</span>
        <span className="font-mono text-[10px] tabular-nums text-newsprint-dim">
          #{article.number}
        </span>
      </div>

      {showArt && (
        <Link href={`/story/${article.slug}`} className="mt-3 block overflow-hidden">
          <ArticleArt
            seed={article.slug}
            headline={article.headline}
            section={article.section}
            compact
            className="h-32 w-full transition-opacity duration-200 group-hover:opacity-85"
          />
        </Link>
      )}

      <h3 className="mt-3 font-serif text-[19px] font-semibold leading-[1.25] text-newsprint">
        <Link href={`/story/${article.slug}`} className="headline-link">
          {article.headline}
        </Link>
      </h3>

      {showBlurb && (
        <p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-newsprint/70">{blurb}</p>
      )}

      <p className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-newsprint-dim">
        <span className="tabular-nums">{shortStamp(article.publishedAt)}</span>
        {article.sourceName && (
          <>
            <span aria-hidden>·</span>
            <span className="truncate">after {article.sourceName}</span>
          </>
        )}
      </p>
    </article>
  );
}

export function ArticleRow({ article }: { article: CardArticle }) {
  return (
    <article className="flex items-baseline gap-3 border-t border-newsprint/10 py-3">
      <span className="shrink-0 font-mono text-[10px] tabular-nums text-broadcast/70">
        #{article.number}
      </span>
      <h3 className="min-w-0 font-serif text-[15px] leading-snug text-newsprint/90">
        <Link href={`/story/${article.slug}`} className="headline-link">
          {article.headline}
        </Link>
      </h3>
    </article>
  );
}
