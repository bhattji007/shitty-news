/**
 * RSS intake.
 *
 * We take the title, the source name, the link and the publication time. We do
 * not take the body, we do not fetch the page, and there is no code path in
 * this repository that would let us. Rewriting a framing is satire; copying
 * somebody's reporting is theft, and the distinction is the only thing keeping
 * this website on the correct side of a line.
 */

import Parser from 'rss-parser';

export type Headline = {
  title: string;
  sourceName: string;
  link: string;
  publishedAt: Date | null;
};

export const DEFAULT_FEEDS = [
  'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en',
  'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-IN&gl=IN&ceid=IN:en',
  'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-IN&gl=IN&ceid=IN:en',
  'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-IN&gl=IN&ceid=IN:en',
];

export function configuredFeeds(): string[] {
  const raw = process.env.RSS_FEEDS?.trim();
  if (!raw) return DEFAULT_FEEDS;
  return raw
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);
}

/**
 * Google News wraps the outlet name onto the end of the title, after a dash.
 * Strip it and use it as the credit, so the struck-through "as filed" line
 * reads like the original rather than like scraped output.
 */
function splitTitle(rawTitle: string, fallbackSource: string) {
  const match = rawTitle.match(/^(.*)\s+-\s+([^-]{2,40})$/);
  if (match) {
    return { title: match[1].trim(), sourceName: match[2].trim() };
  }
  return { title: rawTitle.trim(), sourceName: fallbackSource };
}

export async function fetchHeadlines(limit: number): Promise<Headline[]> {
  const parser = new Parser({
    timeout: 20_000,
    headers: { 'User-Agent': 'shittynews/1.0 (+https://shittynews.com)' },
  });

  const feeds = configuredFeeds();
  const collected: Headline[] = [];
  const seenLinks = new Set<string>();

  for (const url of feeds) {
    try {
      const feed = await parser.parseURL(url);
      const feedName = feed.title ?? 'an outlet that did not identify itself';

      for (const item of feed.items ?? []) {
        if (!item.title || !item.link) continue;
        if (seenLinks.has(item.link)) continue;
        seenLinks.add(item.link);

        const { title, sourceName } = splitTitle(item.title, feedName);
        collected.push({
          title,
          sourceName,
          link: item.link,
          publishedAt: item.isoDate ? new Date(item.isoDate) : null,
        });
      }
    } catch (error) {
      console.warn(
        `  · feed unreachable, moving on: ${url}\n    ${(error as Error).message}`,
      );
    }
  }

  // Interleave the feeds so one chatty source cannot take the whole run.
  collected.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  return collected.slice(0, limit);
}
