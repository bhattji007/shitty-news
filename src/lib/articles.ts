import { prisma } from './db';

export type FrontPage = Awaited<ReturnType<typeof getFrontPage>>;

export async function getFrontPage() {
  const [stories, logs, count] = await Promise.all([
    prisma.article.findMany({
      where: { kind: 'story', published: true },
      orderBy: { publishedAt: 'desc' },
      take: 13,
    }),
    prisma.article.findMany({
      where: { kind: 'log', published: true },
      orderBy: { publishedAt: 'desc' },
      take: 4,
    }),
    prisma.article.count({ where: { published: true } }),
  ]);

  const [hero, ...rest] = stories;
  return {
    hero: hero ?? null,
    secondary: rest.slice(0, 4),
    grid: rest.slice(4, 10),
    strip: rest.slice(10),
    logs,
    total: count,
  };
}

export async function getTickerHeadlines(limit = 12) {
  const rows = await prisma.article.findMany({
    where: { kind: 'story', published: true },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    select: { headline: true },
  });
  return rows.map((r) => r.headline);
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findFirst({ where: { slug, published: true } });
}

export async function getReactionCounts(articleId: string) {
  const rows = await prisma.reaction.groupBy({
    by: ['type'],
    where: { articleId },
    _count: { type: true },
  });
  return Object.fromEntries(rows.map((r) => [r.type, r._count.type])) as Record<string, number>;
}

export async function getUserReactions(articleId: string, userId: string) {
  const rows = await prisma.reaction.findMany({
    where: { articleId, userId },
    select: { type: true },
  });
  return rows.map((r) => r.type);
}

export async function getMoreStories(excludeId: string, take = 4) {
  return prisma.article.findMany({
    where: { kind: 'story', published: true, NOT: { id: excludeId } },
    orderBy: { publishedAt: 'desc' },
    take,
  });
}

export async function getAllSlugs() {
  return prisma.article.findMany({
    where: { published: true },
    select: { slug: true },
    orderBy: { publishedAt: 'desc' },
    take: 200,
  });
}
