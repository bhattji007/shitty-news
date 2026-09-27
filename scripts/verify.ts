// Acceptance checks against dist/ + data/news.json. Run after `npm run build`.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { isBlocked } from '../src/lib/news/blocklist.ts';
import type { NewsFile, Article } from '../src/lib/news/types.ts';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = resolve(ROOT, 'dist');
const newsPath = existsSync(resolve(ROOT, 'data/news.json')) ? resolve(ROOT, 'data/news.json') : resolve(ROOT, 'data/news.sample.json');
const news = JSON.parse(readFileSync(newsPath, 'utf8')) as NewsFile;
const articles: Article[] = Object.values(news.categories).flat();

let fails = 0;
const ok = (name: string, pass: boolean, detail = '') => { console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); if (!pass) fails++; };
// Astro's HTML escaping: & < > " ' — text content is otherwise untouched.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
function walk(dir: string): string[] { return readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : []; }); }

const pages = walk(DIST);
ok('dist has pages', pages.length > 10, `${pages.length} html files`);

// ≥5 categories populated
const populated = Object.values(news.categories).filter((v) => v.length).length;
ok(`news.json (${news.mode}) has ≥5 categories populated`, populated >= 5, `${populated}`);

// Every headline byte-identical: each article page must contain <h1>{escaped title}</h1>
let h1Bad = 0, h1Checked = 0;
for (const a of articles) {
  const p = join(DIST, 'article', `${a.slug}.html`);
  if (!existsSync(p)) continue;
  h1Checked++;
  const html = readFileSync(p, 'utf8');
  if (!html.includes(`<h1>${esc(a.title)}</h1>`)) { h1Bad++; if (h1Bad < 4) console.log('   mismatch:', a.slug); }
}
ok('every article <h1> is byte-identical to source title', h1Bad === 0 && h1Checked > 0, `${h1Checked} checked`);

// Blocklist: no blocked title in data, nor anywhere in dist as an <h1> or card title
const blockedInData = articles.filter((a) => isBlocked(a.title));
ok('no blocklisted titles in data', blockedInData.length === 0, blockedInData.map((a) => a.title).join(' | '));
let blockedInDist = 0;
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  for (const m of html.matchAll(/class="card__title">([^<]+)</g)) if (isBlocked(m[1]!)) blockedInDist++;
}
ok('no blocklisted card titles in dist', blockedInDist === 0);

// Descriptions verbatim on article pages
let descBad = 0;
for (const a of articles) {
  const p = join(DIST, 'article', `${a.slug}.html`);
  if (!existsSync(p) || !a.description) continue;
  if (!readFileSync(p, 'utf8').includes(esc(a.description))) descBad++;
}
ok('descriptions verbatim on article pages', descBad === 0);

// Read-full-story links carry rel="nofollow noopener"
const sampleArticle = articles.find((a) => existsSync(join(DIST, 'article', `${a.slug}.html`)));
if (sampleArticle) {
  const html = readFileSync(join(DIST, 'article', `${sampleArticle.slug}.html`), 'utf8');
  ok('read-full-story link is nofollow noopener', html.includes(`href="${esc(sampleArticle.url)}" rel="nofollow noopener"`));
  ok('article page has "Read in 30 seconds"', html.includes('Read in 30 seconds'));
  ok('article page has Ad 1 of 47', html.includes('Ad 1 of 47'));
  ok('article page has 14 share buttons', (html.match(/class="share"[\s\S]*?<\/div>/)?.[0].match(/<a |<button /g) ?? []).length === 14);
  ok('article page has Orkut and Fax', html.includes('>Orkut<') && html.includes('>Fax<') && html.includes('href="tel:'));
  ok('null description → placeholder copy present somewhere', articles.some((a) => !a.description) ? pages.some((p) => readFileSync(p, 'utf8').includes('This article has no content. Read in 30 seconds anyway.')) : true);
}

const home = readFileSync(join(DIST, 'index.html'), 'utf8');
ok('homepage ticker has "BREAKING: Nothing happened"', /BREAKING:<\/span>Nothing happened/.test(home));
ok('homepage trending repeats top story 5×', (home.match(/class="n">[1-5]</g) ?? []).length === 5);
ok('homepage has LIVE box', home.includes('LIVE: nothing yet'));
ok('footer has Powered by NewsData.io', home.includes('Powered by <a href="https://newsdata.io"'));
ok('footer has sane copy', home.includes('This is what the site could have been.'));
ok('masthead footnote exists in DOM but display:none', home.includes('class="footnote"') && home.includes('.utility .footnote{display:none}'));
ok('paywall copy: all 5 strings present in order', ['Support quality journalism', "You've read 1 free article. Wow.", 'We noticed you have money.', 'Your neighbour subscribed.', 'Fine.'].every((s, i, arr) => home.indexOf(s) > -1 && (i === 0 || home.indexOf(s) > home.indexOf(arr[i - 1]!))));
ok('Reject all is disabled with title="Coming soon"', /disabled title="Coming soon"/.test(home));
ok('no analytics / third-party scripts', !/googletagmanager|google-analytics|gtag\(|facebook\.net|hotjar|segment\.com|plausible|umami|clarity\.ms/.test(home) && (home.match(/<script[^>]+src="https?:/g) ?? []).length === 0);

// Data files
const vendors = JSON.parse(readFileSync(resolve(ROOT, 'data/vendors.json'), 'utf8')) as { name: string }[];
ok('vendors.json has exactly 400 entries incl. Ramesh', vendors.length === 400 && vendors.some((v) => v.name === 'Ramesh'));
ok('products.json has 6 products', (JSON.parse(readFileSync(resolve(ROOT, 'data/products.json'), 'utf8')) as unknown[]).length === 6);
ok('lite hero ≥ 2 MB', existsSync(resolve(ROOT, 'public/lite-hero.bmp')) && statSync(resolve(ROOT, 'public/lite-hero.bmp')).size >= 2_000_000);
ok('/live function exists', existsSync(resolve(ROOT, 'functions/live.ts')));

// SEO
const jsonLdBlocks = (html: string) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]!));
try {
  const homeLd = jsonLdBlocks(home).flat();
  ok('homepage JSON-LD parses and has WebSite + NewsMediaOrganization + CollectionPage', ['WebSite', 'NewsMediaOrganization', 'CollectionPage'].every((t) => homeLd.some((x: { '@type': string }) => x['@type'] === t)));
  if (sampleArticle) {
    const ah = readFileSync(join(DIST, 'article', `${sampleArticle.slug}.html`), 'utf8');
    const ald = jsonLdBlocks(ah).flat();
    const na = ald.find((x: { '@type': string }) => x['@type'] === 'NewsArticle') as { headline: string; isBasedOn: string } | undefined;
    ok('article JSON-LD NewsArticle has verbatim headline + isBasedOn source url', !!na && na.headline === sampleArticle.title && na.isBasedOn === sampleArticle.url);
    ok('article has canonical, og:image/type=article, published_time, breadcrumbs', ah.includes(`<link rel="canonical" href="https://shittynews.com/article/${sampleArticle.slug}"`) && ah.includes('<meta property="og:type" content="article"') && ah.includes('article:published_time') && ald.some((x: { '@type': string }) => x['@type'] === 'BreadcrumbList'));
  }
} catch (e) { ok('JSON-LD parses', false, (e as Error).message); }
ok('homepage has exactly one h1', (home.match(/<h1[\s>]/g) ?? []).length === 1);
ok('canonical URLs are clean (no .html)', !pages.some((p) => /<link rel="canonical" href="[^"]+\.html"/.test(readFileSync(p, 'utf8'))));
ok('joke pages are noindex (lite, maintenance, e-paper, 404)', ['lite', 'maintenance', 'e-paper', '404'].every((n) => readFileSync(join(DIST, `${n}.html`), 'utf8').includes('content="noindex, nofollow"')));
const sm = existsSync(join(DIST, 'sitemap.xml')) ? readFileSync(join(DIST, 'sitemap.xml'), 'utf8') : '';
ok('sitemap.xml lists every article page', sm.includes('<urlset') && articles.filter((a) => !a.live).every((a) => sm.includes(`<loc>https://shittynews.com/article/${a.slug}</loc>`)));
const feed = existsSync(join(DIST, 'feed.xml')) ? readFileSync(join(DIST, 'feed.xml'), 'utf8') : '';
ok('feed.xml is RSS with source attribution', feed.includes('<rss version="2.0"') && feed.includes('<source url=') && (feed.match(/<item>/g) ?? []).length > 0);
ok('llms.txt describes the site and lists headlines', existsSync(join(DIST, 'llms.txt')) && readFileSync(join(DIST, 'llms.txt'), 'utf8').includes('# ShittyNews') && readFileSync(join(DIST, 'llms.txt'), 'utf8').includes('/article/'));
ok('about page exists with h1', existsSync(join(DIST, 'about.html')) && readFileSync(join(DIST, 'about.html'), 'utf8').includes('<h1>About ShittyNews</h1>'));
ok('og-default.png shipped', existsSync(join(DIST, 'og-default.png')));
ok('robots.txt allows AI crawlers and points at sitemap', readFileSync(join(DIST, 'robots.txt'), 'utf8').includes('User-agent: GPTBot') && readFileSync(join(DIST, 'robots.txt'), 'utf8').includes('Sitemap: https://shittynews.com/sitemap.xml'));

console.log(fails ? `\n${fails} check(s) failed` : '\nall checks passed');
process.exit(fails ? 1 : 0);
