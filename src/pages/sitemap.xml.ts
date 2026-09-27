import type { APIRoute } from 'astro';
import { allArticles, loadNews, categoriesPresent } from '../lib/news/load.ts';
import { SITE } from '../lib/seo.ts';
import products from '../../data/products.json';

export const GET: APIRoute = () => {
  const now = loadNews().fetchedAt;
  const url = (path: string, lastmod: string, changefreq: string, priority: string) =>
    `<url><loc>${SITE}${path}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
  const items = [
    url('/', now, 'hourly', '1.0'),
    url('/about', now, 'monthly', '0.6'),
    url('/subscribe', now, 'monthly', '0.3'),
    url('/preferences', now, 'monthly', '0.2'),
    ...categoriesPresent().map((c) => url(`/category/${c}`, now, 'hourly', '0.8')),
    ...allArticles().filter((a) => !a.live).map((a) => url(`/article/${a.slug}`, a.publishedAt, 'daily', '0.7')),
    ...products.map((p) => url(`/sponsored/${p.id}`, now, 'monthly', '0.2')),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
