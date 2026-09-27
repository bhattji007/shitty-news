import type { Ctx } from './config.ts';
import { getCookie, setCookie } from './cookies.ts';

// Fires when the reader scrolls past the first paragraph. Dismiss count in cookie `pw`.
// Copy escalates through 5 levels; after 5 it is suppressed for 24 h (the cookie expires).
const MAX = 5;
let firedThisPage = false;

function count() { return Math.min(MAX, Number(getCookie('pw') ?? 0) || 0); }
function bump() { setCookie('pw', String(Math.min(MAX, count() + 1)), 1); }

function modal() { return document.querySelector<HTMLElement>('[data-paywall]'); }

function show(level: number) {
  const m = modal();
  if (!m) return;
  m.querySelectorAll<HTMLElement>('.pw').forEach((el) => el.classList.toggle('on', Number(el.dataset.level) === level));
  m.hidden = false;
  document.body.style.overflow = 'hidden';
}

function close() {
  const m = modal();
  if (!m) return;
  m.hidden = true;
  document.body.style.overflow = '';
}

export function open(_ctx: Ctx) {
  const c = count();
  if (c >= MAX) { show(MAX); return; } // "Fine." — harmless, doesn't count further
  show(c + 1);
}

export function init(ctx: Ctx) {
  const m = modal();
  if (!m) return;
  m.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-pw]');
    if (!t) return;
    if (t.dataset.pw === 'dismiss') { bump(); close(); }
    if (t.dataset.pw === 'ok') { bump(); close(); } // "Fine." counts too → suppressed for 24 h
  });

  // Explicit triggers: subscribe CTAs, "Buy now", "Next →".
  document.querySelectorAll<HTMLElement>('[data-open-paywall]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (el.hasAttribute('data-pager-next')) {
        // "1/12 · Next →": all 12 pages show the same paragraph.
        const n = document.querySelector<HTMLElement>('[data-pager-n]');
        if (n) n.textContent = String((Number(n.textContent) % 12) + 1);
        document.querySelector('[data-first-paragraph]')?.scrollIntoView({ block: 'start' });
      }
      open(ctx);
    });
  });

  if (ctx.page !== 'article') return;
  const p = document.querySelector<HTMLElement>('[data-first-paragraph]');
  if (!p || count() >= MAX) return;
  // Scroll check rather than IntersectionObserver: a fast scroll can jump the paragraph
  // straight past the viewport without ever "intersecting", and we still want to fire.
  let ticking = false;
  const check = () => {
    ticking = false;
    if (firedThisPage) return;
    if (p.getBoundingClientRect().bottom < 0) {
      firedThisPage = true;
      window.removeEventListener('scroll', onScroll);
      open(ctx);
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  check();
}
