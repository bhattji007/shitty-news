import Parser from 'rss-parser';
import type { Article } from './types.ts';
import { isBlocked } from './blocklist.ts';
import { normaliseRss, type RssItem } from './normalise.ts';

// Verified live on 2026-09-27. If one dies, the others still fill the page.
export const RSS_FEEDS: { name: string; url: string; category: string }[] = [
  { name: 'PIB', url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3', category: 'top' },
  { name: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss', category: 'top' },
  { name: 'The Indian Express', url: 'https://indianexpress.com/feed/', category: 'top' },
  { name: 'NDTV', url: 'https://feeds.feedburner.com/ndtvnews-top-stories', category: 'top' },
  // Section feeds so category pages are not empty in fallback mode.
  { name: 'The Indian Express', url: 'https://indianexpress.com/section/political-pulse/feed/', category: 'politics' },
  { name: 'The Indian Express', url: 'https://indianexpress.com/section/business/feed/', category: 'business' },
  { name: 'The Indian Express', url: 'https://indianexpress.com/section/technology/feed/', category: 'technology' },
  { name: 'The Indian Express', url: 'https://indianexpress.com/section/entertainment/feed/', category: 'entertainment' },
  { name: 'The Indian Express', url: 'https://indianexpress.com/section/sports/feed/', category: 'sports' },
  { name: 'The Hindu', url: 'https://www.thehindu.com/sci-tech/science/feeder/default.rss', category: 'science' },
];

export async function fetchRss(perFeed = 10): Promise<Record<string, Article[]>> {
  const parser = new Parser<unknown, RssItem>({
    timeout: 15000,
    headers: { 'user-agent': 'shittynews-build/2.0' },
    customFields: { item: [['media:content', 'media'], ['media:thumbnail', 'thumb']] },
  });
  const out: Record<string, Article[]> = {};
  await Promise.all(
    RSS_FEEDS.map(async (f) => {
      try {
        const feed = await parser.parseURL(f.url);
        const items = (feed.items ?? []).slice(0, perFeed);
        for (const it of items) {
          const a = normaliseRss(it, f.name, f.category);
          if (a && !isBlocked(a.title)) (out[f.category] ??= []).push(a);
        }
        console.log(`rss  ok   ${f.name.padEnd(20)} ${f.category.padEnd(13)} ${items.length} items`);
      } catch (e) {
        console.log(`rss  FAIL ${f.name.padEnd(20)} ${f.category.padEnd(13)} ${(e as Error).message}`);
      }
    }),
  );
  return out;
}
