import type { Ctx } from './config.ts';
import chum from '../../data/chumbox.json';
import products from '../../data/products.json';

// 8 tiles from {hook} {city} {subject}, seeded by the page URL so they are stable per page.
function fnv(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry(a: number) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function tiles(seedStr: string, n = 8) {
  const r = mulberry(fnv(seedStr));
  const pick = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)]!;
  const out: { title: string; source: string; caption: string; href: string }[] = [];
  const used = new Set<string>();
  while (out.length < n) {
    const title = `${pick(chum.hooks)} ${pick(chum.cities)} ${pick(chum.subjects)}`;
    if (used.has(title)) continue;
    used.add(title);
    const i = out.length;
    out.push({ title, source: chum.sources[i % chum.sources.length]!, caption: chum.captions[i % chum.captions.length]!, href: `/sponsored/${products[Math.floor(r() * products.length)]!.id}` });
  }
  return out;
}

function esc(s: string) { return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!); }

export function init(_ctx: Ctx) {
  document.querySelectorAll<HTMLElement>('[data-chumbox]').forEach((box) => {
    const grid = box.querySelector<HTMLElement>('.chumbox__grid');
    if (!grid) return;
    grid.innerHTML = tiles(location.pathname).map((t) => `<a class="chum" href="${t.href}"><div class="chum__img">${esc(t.caption)}</div><div class="chum__t">${esc(t.title)}</div><div class="chum__s">${esc(t.source)} | Sponsored</div></a>`).join('');
  });
}
