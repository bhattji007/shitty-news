import type { Ctx } from './config.ts';
import { getCookie, setCookie } from './cookies.ts';

// Cookie `v` = visit count. Per visit: body font −0.25px (floor 10px via CSS max()),
// +1 ad row on the homepage, +1 cookie toggle (read by cookie400). Reset by ?sane=1.
export function init(ctx: Ctx) {
  let v = Number(getCookie('v') ?? 0) || 0;
  if (!sessionStorage.getItem('sn.visit')) {
    v += 1;
    setCookie('v', String(v), 365);
    sessionStorage.setItem('sn.visit', '1');
  }
  ctx.visit = Math.max(1, v);
  const shrink = (ctx.visit - 1) * 0.25;
  document.documentElement.style.setProperty('--degrade', `${shrink}px`);

  if (ctx.page === 'home' || ctx.page === 'lite') {
    const slot = document.querySelector<HTMLElement>('[data-slot="ad-rows"]');
    if (!slot) return;
    const copies = ['Home loans @ 8.4%* · Apply in 2 minutes*', 'Personal loan in 10 seconds*. *Approval in 10 days', 'Buy 1 Get 0 Free · Limited period', 'Term insurance for ₹0/month* · *T&C apply', 'Learn coding in 3 days. Placement in 3 years.', 'Villas in Noida Extension starting ₹0.9 Cr*'];
    for (let i = 1; i < ctx.visit && i <= 12; i++) {
      const ad = document.createElement('div');
      ad.className = 'ad ad--row';
      ad.setAttribute('data-annoy', 'degrade');
      ad.innerHTML = `<small>ADVERTISEMENT</small><b>${copies[i % copies.length]}</b>`;
      slot.appendChild(ad);
    }
  }
}
