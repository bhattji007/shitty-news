/**
 * scripts/generate.ts — the content pipeline.
 *
 *   npm run generate              a normal run
 *   npm run generate -- --dry-run generate nothing, write nothing, just report
 *   npm run generate -- --limit 8 consider fewer headlines
 *
 * Run it from cron. It is idempotent: every headline it has ever considered is
 * recorded in the dedup ledger, so running it twice in a row produces one set
 * of articles and a second run that politely declines.
 *
 * Nothing in this file contains a credential. The API key is read from the
 * environment at call time and is never logged, never persisted, and never
 * written to the database.
 */

import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

import { fetchHeadlines, type Headline } from '../src/lib/feeds';
import {
  ANCHOR_SYSTEM_PROMPT,
  ANCHOR_LOG_INSTRUCTIONS,
  JUDGE_SYSTEM_PROMPT,
  buildStoryPrompt,
  coerceMood,
  coerceSection,
  looksLikeTragedy,
} from '../src/lib/persona';
import {
  articleSlug,
  FIRST_ARTICLE_NUMBER,
  normalizeHeadline,
  similarity,
} from '../src/lib/format';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * The writing model does the voice; a cheaper model marks the work. Both are
 * overridable, because in eighteen months these names will look quaint.
 *
 * Note for anyone editing the calls below: sampling parameters (temperature,
 * top_p, top_k) are rejected outright by the current writing models, and
 * `output_config.effort` is rejected by Haiku. Do not add either back in
 * without checking the model you are actually pointing at.
 */
const WRITER_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-5';
const JUDGE_MODEL = process.env.ANTHROPIC_JUDGE_MODEL ?? 'claude-haiku-4-5';

/** Voice-fidelity floor. Below this it does not get published, it gets filed. */
const SCORE_THRESHOLD = 7;

/** Every tenth slot in the numbering is his, not the news's. */
const LOG_EVERY = 10;

/** Dedup window. A story recycled after a week is a different story. */
const DEDUP_DAYS = 7;

/** Above this, two headlines are the same event wearing different hats. */
const SIMILARITY_THRESHOLD = 0.62;

const MAX_BODY_WORDS = 165;

// ---------------------------------------------------------------------------
// Schemas — the model returns these shapes or the call fails loudly
// ---------------------------------------------------------------------------

const DraftSchema = z.object({
  honest_headline: z.string(),
  body: z.string(),
  aside: z.string(),
  mood: z.enum(['neutral', 'disgusted', 'rare-sincerity', 'dead-inside']),
  register: z.enum(['satirical', 'sincere', 'skip']),
  section: z.enum(['INDIA', 'WORLD', 'BUSINESS', 'TECHNOLOGY', 'GENERAL', 'LOG']),
});

const VerdictSchema = z.object({
  score: z.number(),
  safe: z.boolean(),
  reason: z.string(),
});

type Draft = z.infer<typeof DraftSchema>;
type Verdict = z.infer<typeof VerdictSchema>;

// ---------------------------------------------------------------------------
// Deterministic gates — cheaper than a model and not subject to persuasion
// ---------------------------------------------------------------------------

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

/**
 * He does not use exclamation marks. This is not a preference the model gets a
 * vote on, so it is checked in code rather than asked for in a prompt.
 */
function mechanicalFaults(draft: Draft): string | null {
  const all = `${draft.honest_headline} ${draft.body} ${draft.aside}`;

  if (all.includes('!')) return 'exclamation mark';
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(all)) return 'emoji';
  if (!draft.honest_headline.trim()) return 'empty headline';
  if (!draft.body.trim()) return 'empty body';
  if (!draft.aside.trim()) return 'empty aside';
  if (countWords(draft.body) > MAX_BODY_WORDS) {
    return `body ran to ${countWords(draft.body)} words`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Model calls
// ---------------------------------------------------------------------------

async function writeStory(client: Anthropic, headline: Headline): Promise<Draft | null> {
  const response = await client.messages.parse({
    model: WRITER_MODEL,
    max_tokens: 8000,
    system: ANCHOR_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: buildStoryPrompt({
          title: headline.title,
          sourceName: headline.sourceName,
          publishedAt: headline.publishedAt,
        }),
      },
    ],
    output_config: { format: zodOutputFormat(DraftSchema) },
  });

  return response.parsed_output ?? null;
}

async function writeLogEntry(client: Anthropic): Promise<Draft | null> {
  const response = await client.messages.parse({
    model: WRITER_MODEL,
    max_tokens: 4000,
    system: ANCHOR_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: ANCHOR_LOG_INSTRUCTIONS }],
    output_config: { format: zodOutputFormat(DraftSchema) },
  });

  return response.parsed_output ?? null;
}

/** The quality gate. A second, cheaper pass that has no loyalty to the first. */
async function judge(
  client: Anthropic,
  draft: Draft,
  originalTitle: string | null,
): Promise<Verdict | null> {
  const response = await client.messages.parse({
    model: JUDGE_MODEL,
    max_tokens: 1000,
    system: JUDGE_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          originalTitle ? `ORIGINAL HEADLINE: ${originalTitle}` : 'THIS IS A DIARY ENTRY, NOT A STORY.',
          `REGISTER CLAIMED: ${draft.register}`,
          '',
          `HEADLINE: ${draft.honest_headline}`,
          '',
          'BODY:',
          draft.body,
          '',
          `ASIDE: ${draft.aside}`,
        ].join('\n'),
      },
    ],
    output_config: { format: zodOutputFormat(VerdictSchema) },
  });

  return response.parsed_output ?? null;
}

// ---------------------------------------------------------------------------
// Dedup
// ---------------------------------------------------------------------------

async function loadRecentNormalized(): Promise<string[]> {
  const since = new Date(Date.now() - DEDUP_DAYS * 86_400_000);
  const rows = await prisma.seenHeadline.findMany({
    where: { seenAt: { gte: since } },
    select: { normalized: true },
  });
  return rows.map((r) => r.normalized);
}

function isDuplicate(title: string, recent: string[]): boolean {
  const normalized = normalizeHeadline(title);
  if (!normalized) return true;
  return recent.some((seen) => seen === normalized || similarity(normalized, seen) >= SIMILARITY_THRESHOLD);
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

async function nextNumber(): Promise<number> {
  const top = await prisma.article.findFirst({
    orderBy: { number: 'desc' },
    select: { number: true },
  });
  return top ? top.number + 1 : FIRST_ARTICLE_NUMBER;
}

async function recordReject(
  sourceTitle: string,
  sourceUrl: string | null,
  draft: Draft | null,
  score: number | null,
  reason: string,
) {
  await prisma.rejectedDraft.create({
    data: {
      sourceTitle,
      sourceUrl,
      headline: draft?.honest_headline ?? null,
      body: draft?.body ?? null,
      score,
      reason,
    },
  });
}

// ---------------------------------------------------------------------------
// The run
// ---------------------------------------------------------------------------

type Args = { dryRun: boolean; limit: number };

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const limitFlag = argv.indexOf('--limit');
  const limit =
    limitFlag >= 0 && argv[limitFlag + 1]
      ? Number(argv[limitFlag + 1])
      : Number(process.env.GENERATE_LIMIT ?? 24);

  return {
    dryRun: argv.includes('--dry-run'),
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 30) : 24,
  };
}

async function main() {
  const { dryRun, limit } = parseArgs();

  // The key is read here and nowhere else. If it is absent we stop; we do not
  // guess, prompt, or fall back to anything.
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      [
        '',
        '  ANTHROPIC_API_KEY is not set, so there will be no new content today.',
        '',
        '  The site will carry on serving whatever is already in the database,',
        '  which is the arrangement I have been operating under for some time',
        '  and can recommend.',
        '',
      ].join('\n'),
    );
    process.exitCode = 1;
    return;
  }

  const client = new Anthropic({ apiKey });

  console.log(`\n  Pulling headlines. Considering at most ${limit}.\n`);
  const headlines = await fetchHeadlines(limit);
  console.log(`  ${headlines.length} headlines retrieved.\n`);

  if (headlines.length === 0) {
    console.log('  Nothing came back. Either the feeds are down or the world is.\n');
    return;
  }

  const recent = await loadRecentNormalized();
  let published = 0;
  let rejected = 0;
  let skipped = 0;
  let number = await nextNumber();

  for (const headline of headlines) {
    if (isDuplicate(headline.title, recent)) {
      skipped++;
      continue;
    }

    // Claim the headline in the ledger before spending a request on it, so a
    // crash halfway through cannot cause a duplicate on the next run.
    const normalized = normalizeHeadline(headline.title);
    recent.push(normalized);
    if (!dryRun) {
      await prisma.seenHeadline.upsert({
        where: { normalized },
        create: { normalized, sourceUrl: headline.link },
        update: { seenAt: new Date() },
      });
    }

    // Every tenth slot belongs to him. The headline waits its turn.
    if (number % LOG_EVERY === 0) {
      const entry = await writeLogEntry(client).catch((error) => {
        console.warn(`  · log entry failed: ${(error as Error).message}`);
        return null;
      });

      if (entry) {
        const fault = mechanicalFaults(entry);
        const verdict = fault ? null : await judge(client, entry, null).catch(() => null);
        const score = verdict?.score ?? 0;

        if (!fault && verdict?.safe !== false && score >= SCORE_THRESHOLD) {
          const slug = articleSlug(number, entry.honest_headline);
          console.log(`  #${number}  LOG   ${entry.honest_headline}  (${score}/10)`);
          if (!dryRun) {
            await prisma.article.upsert({
              where: { slug },
              create: {
                number,
                slug,
                kind: 'log',
                headline: entry.honest_headline,
                body: entry.body,
                aside: entry.aside,
                mood: coerceMood(entry.mood),
                register: 'satirical',
                section: 'LOG',
                score,
                published: true,
              },
              update: {},
            });
          }
          published++;
          number++;
        } else {
          console.log(`  ·      LOG   rejected — ${fault ?? verdict?.reason ?? 'unscored'}`);
          if (!dryRun) {
            await recordReject('[anchor log]', null, entry, verdict?.score ?? null, fault ?? verdict?.reason ?? 'unscored');
          }
          rejected++;
        }
      }
    }

    // ---- the story itself ------------------------------------------------
    let draft: Draft | null = null;
    try {
      draft = await writeStory(client, headline);
    } catch (error) {
      console.warn(`  · generation failed for "${headline.title}": ${(error as Error).message}`);
      continue;
    }

    if (!draft) {
      console.log(`  ·      SKIP  no usable draft — ${headline.title}`);
      continue;
    }

    if (draft.register === 'skip') {
      console.log(`  ·      SKIP  he declined it — ${headline.title}`);
      if (!dryRun) await recordReject(headline.title, headline.link, draft, null, 'declined by writer');
      skipped++;
      continue;
    }

    // A tragedy-flagged headline that came back satirical is a gate failure,
    // not a style disagreement. It does not get a second opinion.
    if (looksLikeTragedy(headline.title) && draft.register !== 'sincere') {
      console.log(`  ·      SKIP  flagged tragedy, wrong register — ${headline.title}`);
      if (!dryRun) {
        await recordReject(headline.title, headline.link, draft, null, 'tragedy flag with satirical register');
      }
      skipped++;
      continue;
    }

    const fault = mechanicalFaults(draft);
    if (fault) {
      console.log(`  ·      DROP  ${fault} — ${draft.honest_headline}`);
      if (!dryRun) await recordReject(headline.title, headline.link, draft, null, fault);
      rejected++;
      continue;
    }

    const verdict = await judge(client, draft, headline.title).catch((error) => {
      console.warn(`  · judging failed: ${(error as Error).message}`);
      return null;
    });

    if (!verdict || verdict.safe === false || verdict.score < SCORE_THRESHOLD) {
      const reason = verdict ? verdict.reason : 'no verdict returned';
      console.log(`  ·      DROP  ${verdict?.score ?? '?'}/10 — ${reason}`);
      if (!dryRun) {
        await recordReject(headline.title, headline.link, draft, verdict?.score ?? null, reason);
      }
      rejected++;
      continue;
    }

    const slug = articleSlug(number, draft.honest_headline);
    console.log(`  #${number}  ${draft.register === 'sincere' ? 'FLAT ' : 'STORY'} ${draft.honest_headline}  (${verdict.score}/10)`);

    if (!dryRun) {
      await prisma.article.upsert({
        where: { slug },
        create: {
          number,
          slug,
          kind: 'story',
          headline: draft.honest_headline,
          body: draft.body,
          aside: draft.aside,
          sourceTitle: headline.title,
          sourceName: headline.sourceName,
          sourceUrl: headline.link,
          sourcePublishedAt: headline.publishedAt,
          mood: coerceMood(draft.mood),
          register: draft.register,
          section: coerceSection(draft.section),
          score: verdict.score,
          published: true,
        },
        update: {},
      });
    }

    published++;
    number++;
  }

  console.log(
    [
      '',
      `  ${published} published, ${rejected} rejected, ${skipped} skipped.`,
      dryRun ? '  Dry run: nothing was written to the database.' : '',
      '  Next number in the sequence is #' + number + '.',
      '',
      '  Here is your content.',
      '',
    ]
      .filter(Boolean)
      .join('\n'),
  );
}

main()
  .catch((error) => {
    console.error('\n  The run failed outright.\n');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
