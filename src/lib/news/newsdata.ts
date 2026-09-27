import type { Article } from './types.ts';
import { isBlocked } from './blocklist.ts';
import { normaliseNewsData, type NewsDataResult } from './normalise.ts';

const BASE = 'https://newsdata.io/api/1/latest';

export class NewsDataError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// One request per category. No nextPage follow-ups: free tier = ~200 credits/day,
// 7 categories × 24 hourly builds = 168.
export async function fetchCategory(apiKey: string, category: string, timeoutMs = 15000): Promise<Article[]> {
  const url = new URL(BASE);
  url.searchParams.set('apikey', apiKey);
  url.searchParams.set('country', 'in');
  url.searchParams.set('language', 'en');
  url.searchParams.set('category', category);
  url.searchParams.set('removeduplicate', '1');
  url.searchParams.set('size', '10'); // max allowed on the free plan

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/json' } });
    if (!res.ok) throw new NewsDataError(res.status, `NewsData ${res.status} for ${category}`);
    const body = (await res.json()) as { status?: string; results?: NewsDataResult[]; message?: unknown };
    if (body.status !== 'success' || !Array.isArray(body.results)) {
      throw new NewsDataError(500, `NewsData bad body for ${category}: ${JSON.stringify(body.message ?? body.status)}`);
    }
    const out: Article[] = [];
    for (const r of body.results) {
      const a = normaliseNewsData(r, category);
      if (a && !isBlocked(a.title)) out.push(a);
    }
    return out;
  } finally {
    clearTimeout(t);
  }
}
