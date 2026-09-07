import { prisma } from '@/lib/db';

export const revalidate = 300;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const articles = await prisma.article
    .findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 40,
    })
    .catch(() => []);

  const items = articles
    .map((a) => {
      const url = `${SITE}/story/${a.slug}`;
      const description = [a.body, '', `— ${a.aside}`].join('\n');
      return `    <item>
      <title>${escapeXml(a.headline)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${a.publishedAt.toUTCString()}</pubDate>
      <category>${escapeXml(a.section)}</category>
      <description>${escapeXml(description)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SHITTYNEWS</title>
    <link>${escapeXml(SITE)}</link>
    <atom:link href="${escapeXml(`${SITE}/feed.xml`)}" rel="self" type="application/rss+xml" />
    <description>Automated news, resentfully. Subscribe and become part of the problem.</description>
    <language>en</language>
    <generator>Dev Anand-3, unsupervised</generator>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <copyright>Satire. Nothing here is news. Nothing anywhere is news.</copyright>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
      'X-Anchor-Status': 'still-running',
    },
  });
}
