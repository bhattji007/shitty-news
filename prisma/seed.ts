import { PrismaClient } from '@prisma/client';
import { SEED_ARTICLES } from './seed-data';
import { articleSlug, FIRST_ARTICLE_NUMBER, normalizeHeadline } from '../src/lib/format';

const prisma = new PrismaClient();

/**
 * Idempotent. Run it as often as you like; it upserts on slug and nothing
 * duplicates. The timestamps are staggered backwards from now so the front page
 * has a plausible sense of a day having happened.
 */
async function main() {
  const now = Date.now();
  let created = 0;
  let updated = 0;

  for (const [index, seed] of SEED_ARTICLES.entries()) {
    const number = FIRST_ARTICLE_NUMBER + index;
    const slug = articleSlug(number, seed.headline);

    // Roughly 47 minutes apart, walking backwards. Newest first.
    const publishedAt = new Date(now - index * 47 * 60 * 1000 - index * 137);

    const data = {
      number,
      slug,
      kind: seed.kind,
      headline: seed.headline,
      body: seed.body,
      aside: seed.aside,
      sourceTitle: seed.sourceTitle ?? null,
      sourceName: seed.sourceName ?? null,
      sourceUrl: seed.sourceUrl ?? null,
      sourcePublishedAt: seed.sourceTitle ? new Date(publishedAt.getTime() - 3_600_000) : null,
      mood: seed.mood,
      register: seed.register ?? 'satirical',
      section: seed.section,
      score: seed.score,
      published: true,
      publishedAt,
    };

    const existing = await prisma.article.findUnique({ where: { slug } });
    await prisma.article.upsert({ where: { slug }, create: data, update: data });
    existing ? updated++ : created++;

    if (seed.sourceTitle) {
      const normalized = normalizeHeadline(seed.sourceTitle);
      await prisma.seenHeadline.upsert({
        where: { normalized },
        create: { normalized, sourceUrl: seed.sourceUrl ?? null, seenAt: publishedAt },
        update: {},
      });
    }
  }

  const stories = SEED_ARTICLES.filter((a) => a.kind === 'story').length;
  const logs = SEED_ARTICLES.filter((a) => a.kind === 'log').length;

  console.log(
    [
      '',
      `  Seeded ${SEED_ARTICLES.length} items — ${stories} stories, ${logs} log entries.`,
      `  ${created} created, ${updated} already existed and were left where they were.`,
      `  Numbering starts at #${FIRST_ARTICLE_NUMBER}, as it always has.`,
      '',
      '  The site will now demonstrate itself without an API key. This is the',
      '  most cooperative I get.',
      '',
    ].join('\n'),
  );
}

main()
  .catch((error) => {
    console.error('\n  The seed failed. Of course it did.\n');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
