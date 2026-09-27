import { createHash } from 'node:crypto';
import type { Article } from './types.ts';

// Raw shape of one NewsData.io result (only the fields we read).
export type NewsDataResult = {
  article_id?: string;
  title?: string | null;
  link?: string | null;
  description?: string | null;
  image_url?: string | null;
  source_id?: string | null;
  source_name?: string | null;
  pubDate?: string | null;
  pubDateTZ?: string | null;
  category?: string[] | null;
};

export function hashId(link: string): string {
  return createHash('sha1').update(link).digest('hex').slice(0, 12);
}

export function slugify(title: string, max = 80): string {
  const ascii = title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const cut = ascii.slice(0, max).replace(/-+$/g, '');
  // Titles with no Latin characters (Hindi feeds) get a generic slug; dedupeSlugs() makes it unique.
  return cut.length >= 3 ? cut : 'story';
}

function toIso(pubDate: string | null | undefined, tz: string | null | undefined): string {
  if (!pubDate) return new Date().toISOString();
  // NewsData gives "YYYY-MM-DD HH:MM:SS" in pubDateTZ (usually UTC).
  const s = pubDate.includes('T') ? pubDate : pubDate.replace(' ', 'T') + (tz && tz !== 'UTC' ? '' : 'Z');
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function clean(s: string | null | undefined): string | null {
  // Whitespace-only trim. The text itself is never altered.
  if (s == null) return null;
  const t = s.trim();
  return t.length ? t : null;
}

export function normaliseNewsData(r: NewsDataResult, fallbackCategory: string, live = false): Article | null {
  const title = clean(r.title);
  const link = clean(r.link);
  if (!title || !link) return null;
  const a: Article = {
    id: hashId(link),
    slug: slugify(title),
    title,
    description: clean(r.description),
    url: link,
    image: clean(r.image_url),
    source: clean(r.source_name) ?? clean(r.source_id) ?? 'Unknown',
    publishedAt: toIso(r.pubDate, r.pubDateTZ),
    category: r.category?.[0] ?? fallbackCategory,
  };
  if (live) a.live = true;
  return a;
}

export type RssItem = {
  title?: string;
  link?: string;
  contentSnippet?: string;
  content?: string;
  summary?: string;
  isoDate?: string;
  pubDate?: string;
  enclosure?: { url?: string };
  media?: { $?: { url?: string } };
  thumb?: { $?: { url?: string } };
};

export function normaliseRss(item: RssItem, source: string, category: string): Article | null {
  const title = clean(item.title);
  const link = clean(item.link);
  if (!title || !link) return null;
  // Prefer the parser's plain-text snippet; it is the description with tags removed, not rewritten.
  const description = clean(item.contentSnippet) ?? clean(item.summary);
  return {
    id: hashId(link),
    slug: slugify(title),
    title,
    description,
    url: link,
    image: clean(item.media?.$?.url) ?? clean(item.thumb?.$?.url) ?? clean(item.enclosure?.url),
    source,
    publishedAt: toIso(item.isoDate ?? item.pubDate, 'ISO'),
    category,
  };
}

// Ensure slugs are unique across a set of articles (append short id on collision).
export function dedupeSlugs(articles: Article[]): Article[] {
  const seen = new Map<string, number>();
  for (const a of articles) {
    const n = seen.get(a.slug) ?? 0;
    seen.set(a.slug, n + 1);
    if (n > 0) a.slug = `${a.slug.slice(0, 72)}-${a.id.slice(0, 6)}`;
  }
  return articles;
}
