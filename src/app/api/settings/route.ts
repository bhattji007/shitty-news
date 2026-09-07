import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/ratelimit';
import { ERRORS } from '@/lib/copy';

export const dynamic = 'force-dynamic';

/** The daily briefing toggle. Why would you want this. */
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: ERRORS.unauthorized }, { status: 401 });

  const limit = rateLimit(`settings:${userId}`, 12, 60_000);
  if (!limit.ok) return NextResponse.json({ error: ERRORS.rateLimited }, { status: 429 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: ERRORS.badRequest }, { status: 400 });
  }

  const { dailyBriefing } = (payload ?? {}) as { dailyBriefing?: boolean };
  if (typeof dailyBriefing !== 'boolean') {
    return NextResponse.json({ error: ERRORS.badRequest }, { status: 400 });
  }

  await prisma.user.update({ where: { id: userId }, data: { dailyBriefing } });

  return NextResponse.json({
    dailyBriefing,
    note: dailyBriefing
      ? 'Subscribed. I will write to you daily, and you will read perhaps four of them.'
      : 'Unsubscribed. A rare instance of someone on this website making the correct decision.',
  });
}
