import type { APIRoute } from 'astro';
import { allArticles, loadNews } from '../lib/news/load.ts';
import { SITE, SITE_NAME, DEFAULT_DESCRIPTION } from '../lib/seo.ts';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = () => {
  const items = allArticles()
    .filter((a) => !a.live)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 50)
    .map((a) => `<item>
  <title>${esc(a.title)}</title>
  <link>${SITE}/article/${a.slug}</link>
  <guid isPermaLink="true">${SITE}/article/${a.slug}</guid>
  <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
  <category>${esc(a.category)}</category>
  <source url="${esc(a.url)}">${esc(a.source)}</source>
  <description>${esc(a.description ?? a.title)}</description>${a.image ? `\n  <enclosure url="${esc(a.image)}" type="image/jpeg" length="0" />` : ''}
</item>`);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${SITE_NAME}</title>
  <link>${SITE}/</link>
  <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
  <description>${esc(DEFAULT_DESCRIPTION)}</description>
  <language>en-in</language>
  <lastBuildDate>${new Date(loadNews().fetchedAt).toUTCString()}</lastBuildDate>
  <ttl>60</ttl>
${items.join('\n')}
</channel>
</rss>
`;
  return new Response(body, { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } });
};
