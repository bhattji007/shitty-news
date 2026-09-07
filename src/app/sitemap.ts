import type { MetadataRoute } from 'next';
import { prisma } from './../lib/db';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await prisma.article
    .findMany({
      where: { published: true },
      select: { slug: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
      take: 500,
    })
    .catch(() => []);

  return [
    { url: SITE, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE}/about`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    ...articles.map((a) => ({
      url: `${SITE}/story/${a.slug}`,
      lastModified: a.publishedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
