import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/ratelimit';
import { ERRORS, REACTION_TYPES } from '@/lib/copy';

export const dynamic = 'force-dynamic';

/**
 * Toggle one reaction. Twenty per minute per person, which is nineteen more
 * opinions than anybody needs.
 */
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: ERRORS.unauthorized }, { status: 401 });
  }

  const limit = rateLimit(`reaction:${userId}`, 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: ERRORS.rateLimited },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(limit.retryAfterMs / 1000)) },
      },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: ERRORS.badRequest }, { status: 400 });
  }

  const { articleId, type } = (payload ?? {}) as { articleId?: string; type?: string };

  if (typeof articleId !== 'string' || typeof type !== 'string' || !REACTION_TYPES.includes(type)) {
    return NextResponse.json({ error: ERRORS.badRequest }, { status: 400 });
  }

  const article = await prisma.article.findFirst({
    where: { id: articleId, published: true },
    select: { id: true },
  });
  if (!article) {
    return NextResponse.json({ error: ERRORS.notFound }, { status: 404 });
  }

  const existing = await prisma.reaction.findUnique({
    where: { userId_articleId_type: { userId, articleId, type } },
    select: { id: true },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.create({ data: { userId, articleId, type } });
  }

  const [grouped, mine] = await Promise.all([
    prisma.reaction.groupBy({
      by: ['type'],
      where: { articleId },
      _count: { type: true },
    }),
    prisma.reaction.findMany({ where: { articleId, userId }, select: { type: true } }),
  ]);

  return NextResponse.json({
    counts: Object.fromEntries(grouped.map((g) => [g.type, g._count.type])),
    mine: mine.map((m) => m.type),
  });
}
