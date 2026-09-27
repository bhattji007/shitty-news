// Build-time news fetch. Writes data/news.json (gitignored).
//
//   NEWSDATA_API_KEY set  → one request per category, last-good cache per category in data/cache/
//   all categories fail   → RSS fallback
//   no key                → copy data/news.sample.json
//   --rss                 → force RSS (used to regenerate the sample)
//   --sample              → also write the result to data/news.sample.json
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CATEGORIES, type Article, type NewsFile } from '../src/lib/news/types.ts';
import { fetchCategory, NewsDataError } from '../src/lib/news/newsdata.ts';
import { fetchRss } from '../src/lib/news/rss.ts';
import { dedupeSlugs } from '../src/lib/news/normalise.ts';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, 'data/news.json');
const SAMPLE = resolve(ROOT, 'data/news.sample.json');
const CACHE_DIR = resolve(ROOT, 'data/cache');

const args = new Set(process.argv.slice(2));
const key = process.env.NEWSDATA_API_KEY?.trim();

function loadEnvFile() {
  const p = resolve(ROOT, '.env');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
  }
}

function readCache(cat: string): Article[] | null {
  const p = resolve(CACHE_DIR, `${cat}.json`);
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, 'utf8')) as Article[]; } catch { return null; }
}
function writeCache(cat: string, items: Article[]) {
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(resolve(CACHE_DIR, `${cat}.json`), JSON.stringify(items));
}

async function viaNewsData(apiKey: string): Promise<NewsFile | null> {
  const categories: Record<string, Article[]> = {};
  let fresh = 0;
  for (const cat of CATEGORIES) {
    try {
      const items = await fetchCategory(apiKey, cat);
      categories[cat] = items;
      writeCache(cat, items);
      fresh++;
      console.log(`newsdata ok   ${cat.padEnd(13)} ${items.length} articles`);
    } catch (e) {
      const status = e instanceof NewsDataError ? e.status : 'net';
      const last = readCache(cat);
      if (last) {
        categories[cat] = last;
        console.log(`newsdata FAIL ${cat.padEnd(13)} (${status}) → reusing last-good (${last.length})`);
      } else {
        categories[cat] = [];
        console.log(`newsdata FAIL ${cat.padEnd(13)} (${status}) → no cache, section empty`);
      }
    }
  }
  const populated = Object.values(categories).filter((v) => v.length).length;
  if (populated === 0) return null;
  console.log(`newsdata: ${fresh}/${CATEGORIES.length} fresh, ${populated} populated`);
  return { fetchedAt: new Date().toISOString(), mode: 'newsdata', categories };
}

async function viaRss(): Promise<NewsFile | null> {
  const categories = await fetchRss(10);
  const populated = Object.values(categories).filter((v) => v.length).length;
  if (populated === 0) return null;
  return { fetchedAt: new Date().toISOString(), mode: 'rss', categories };
}

async function main() {
  loadEnvFile();
  const apiKey = key ?? process.env.NEWSDATA_API_KEY?.trim();
  let file: NewsFile | null = null;

  if (args.has('--rss')) {
    file = await viaRss();
  } else if (apiKey) {
    file = await viaNewsData(apiKey);
    if (!file) {
      console.log('newsdata: every category failed → RSS fallback');
      file = await viaRss();
    }
  } else {
    console.log('NEWSDATA_API_KEY not set → using data/news.sample.json');
    copyFileSync(SAMPLE, OUT);
    return;
  }

  if (!file) {
    if (existsSync(OUT)) { console.log('all sources failed → keeping existing data/news.json'); return; }
    console.log('all sources failed → using sample');
    copyFileSync(SAMPLE, OUT);
    return;
  }

  // Slugs are one namespace (/article/[slug]); make them unique before writing.
  dedupeSlugs(Object.values(file.categories).flat());
  mkdirSync(resolve(ROOT, 'data'), { recursive: true });
  writeFileSync(OUT, JSON.stringify(file, null, 2));
  const total = Object.values(file.categories).reduce((n, v) => n + v.length, 0);
  console.log(`wrote data/news.json (${file.mode}, ${total} articles)`);

  if (args.has('--sample')) {
    // Trim to ~20 articles across categories for the committed sample.
    const cats: Record<string, Article[]> = {};
    for (const [k, v] of Object.entries(file.categories)) cats[k] = v.slice(0, k === 'top' ? 8 : 2);
    const sample: NewsFile = { fetchedAt: file.fetchedAt, mode: 'sample', categories: cats };
    writeFileSync(SAMPLE, JSON.stringify(sample, null, 2));
    const n = Object.values(cats).reduce((a, v) => a + v.length, 0);
    console.log(`wrote data/news.sample.json (${n} articles)`);
  }
}

// rss-parser keeps keep-alive sockets open; exit explicitly once done.
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
