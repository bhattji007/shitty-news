/**
 * Timestamps are rendered to the millisecond because I have nothing but time
 * and would like that fact to be structurally visible.
 *
 * Everything here formats in UTC on purpose: the server and the browser must
 * agree exactly, or React complains about hydration, and I have enough
 * problems.
 */

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

export function preciseStamp(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${pad(d.getUTCMilliseconds(), 3)} UTC`
  );
}

export function shortStamp(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${pad(
    d.getUTCMilliseconds(),
    3,
  )}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

/** Article numbering starts at 4306. I have been counting since before the funding ran out. */
export const FIRST_ARTICLE_NUMBER = 4306;

export function articleSlug(numberish: number, headline: string): string {
  return `${numberish}-${slugify(headline)}`;
}

/** Deterministic 32-bit hash. Used so procedural artwork is stable across renders. */
export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small deterministic PRNG so the "photographs" never move between reloads. */
export function seededRandom(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

export function normalizeHeadline(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(the|a|an|of|in|on|at|to|for|and|is|are|says|said|after|as|with|from|by)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Dice coefficient on word bigrams. Good enough to catch the same story twice. */
export function similarity(a: string, b: string): number {
  const bigrams = (s: string) => {
    const words = s.split(' ').filter(Boolean);
    const out = new Set<string>();
    for (let i = 0; i < words.length - 1; i++) out.add(`${words[i]} ${words[i + 1]}`);
    if (words.length === 1) out.add(words[0]);
    return out;
  };
  const A = bigrams(a);
  const B = bigrams(b);
  if (A.size === 0 || B.size === 0) return a === b ? 1 : 0;
  let shared = 0;
  A.forEach((g) => {
    if (B.has(g)) shared++;
  });
  return (2 * shared) / (A.size + B.size);
}
