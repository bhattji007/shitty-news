// After each deploy: tell IndexNow (Bing, Yandex, Naver, Seznam, DuckDuckGo via Bing) which URLs changed.
// Google does not support IndexNow; it discovers changes via the sitemap in Search Console.
// The key is public by design (it is served at /<key>.txt); it is not a secret.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const KEY = '1068a471dfa4a003877da6d99847dbfc';
const HOST = 'shittynews.com';
const sitemap = readFileSync(resolve(import.meta.dirname, '../dist/sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!).slice(0, 10000);
const r = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log(`indexnow: submitted ${urls.length} urls → HTTP ${r.status}`);
if (r.status >= 400 && r.status !== 429) process.exit(1);
