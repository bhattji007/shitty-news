import type { Ctx } from './config.ts';
import type { Article } from '../lib/news/types.ts';

const SIX_H = 6 * 3600 * 1000;
const seen = new Set<string>();

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function tickerItem(a: Article): string {
  // Title text is inserted verbatim (escaped for HTML only). The "JUST IN" pill is a sibling node.
  return `<span class="item" data-live-id="${esc(a.id)}" data-ts="${new Date(a.publishedAt).getTime()}"><span class="pill-justin">JUST IN</span><a href="${esc(a.url)}" rel="nofollow noopener" target="_blank" style="color:#fff">${esc(a.title)}</a></span>`;
}

function prune(track: HTMLElement) {
  const cutoff = Date.now() - SIX_H;
  track.querySelectorAll<HTMLElement>('[data-live-id]').forEach((el) => {
    if (Number(el.dataset.ts) < cutoff) el.remove();
  });
}

function renderLiveBox(items: Article[]) {
  const box = document.querySelector<HTMLElement>('[data-livebox]');
  if (!box) return;
  const list = box.querySelector('ul')!;
  const empty = box.querySelector<HTMLElement>('.empty')!;
  const fresh = items.filter((a) => Date.now() - new Date(a.publishedAt).getTime() < SIX_H).slice(0, 5);
  if (!fresh.length) { list.innerHTML = ''; empty.hidden = false; return; }
  empty.hidden = true;
  list.innerHTML = fresh.map((a) => `<li><a href="${esc(a.url)}" rel="nofollow noopener" target="_blank">${esc(a.title)}</a></li>`).join('');
}

async function poll(track: HTMLElement) {
  try {
    const r = await fetch('/live', { cache: 'no-store' });
    if (!r.ok) throw new Error(String(r.status));
    const items = (await r.json()) as Article[];
    if (!Array.isArray(items)) throw new Error('bad body');
    // Newest first; prepend so the marquee shows them next.
    const cutoff = Date.now() - SIX_H;
    for (const a of [...items].reverse()) {
      if (seen.has(a.id) || new Date(a.publishedAt).getTime() < cutoff) continue;
      seen.add(a.id);
      track.insertAdjacentHTML('afterbegin', tickerItem(a));
    }
    prune(track);
    renderLiveBox(items);
  } catch {
    renderLiveBox([]);
  }
}

export function init(ctx: Ctx) {
  const track = document.querySelector<HTMLElement>('.ticker__track');
  if (!track) return;
  // The marquee never pauses: no hover handler is registered, on purpose.
  if (!ctx.stream) return;
  void poll(track);
  setInterval(() => void poll(track), 60_000);
}
