import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/ratelimit';
import { ERRORS } from '@/lib/copy';

export const dynamic = 'force-dynamic';

/** Records a read, once per person per story. Feeds /viewer. */
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: ERRORS.unauthorized }, { status: 401 });

  const limit = rateLimit(`read:${userId}`, 60, 60_000);
  if (!limit.ok) return NextResponse.json({ error: ERRORS.rateLimited }, { status: 429 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: ERRORS.badRequest }, { status: 400 });
  }

  const { articleId } = (payload ?? {}) as { articleId?: string };
  if (typeof articleId !== 'string') {
    return NextResponse.json({ error: ERRORS.badRequest }, { status: 400 });
  }

  const article = await prisma.article.findFirst({
    where: { id: articleId, published: true },
    select: { id: true },
  });
  if (!article) return NextResponse.json({ error: ERRORS.notFound }, { status: 404 });

  await prisma.readReceipt.upsert({
    where: { userId_articleId: { userId, articleId } },
    create: { userId, articleId },
    update: {},
  });

  return NextResponse.json({ ok: true, noted: 'Noted. Against my will, but noted.' });
}
