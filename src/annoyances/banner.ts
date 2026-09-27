import type { Ctx } from './config.ts';

// Sticky bottom banner: grows 2px per scroll event, caps at 40% of the viewport.
// Close button moves 10px away on hover. If you do manage to click it, the ad changes.
const COPY = [
  'MEGA FESTIVE SALE · Up to 90%* off on mobiles · SHOP NOW »',
  'Ad closed. Here is another ad. · Up to 91%* off »',
  'You have closed 2 ads. This one is smaller. »',
  'Thank you for your feedback. We will show you more ads like this. »',
];

export function init(ctx: Ctx) {
  const ad = document.querySelector<HTMLElement>('[data-sticky-ad]');
  if (!ad) return;
  if (ctx.page === 'sponsored') { ad.hidden = true; return; } // the landing page is the ad
  const creative = ad.querySelector<HTMLElement>('.sticky-ad__creative')!;
  const close = ad.querySelector<HTMLElement>('.sticky-ad__close')!;
  let h = 70;
  let stage = 0;
  let dx = 0, dy = 0;

  const grow = () => {
    const cap = Math.round(window.innerHeight * 0.4);
    if (h >= cap) return;
    h = Math.min(cap, h + 2);
    ad.style.height = `${h}px`;
    document.body.style.paddingBottom = `${h}px`;
  };
  window.addEventListener('scroll', grow, { passive: true });

  close.addEventListener('mouseenter', () => {
    // Step 10px away, staying inside the banner.
    dx -= 10; dy += 10;
    if (Math.abs(dx) > ad.clientWidth - 60) dx = 0;
    if (dy > h - 20) dy = 0;
    close.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  close.addEventListener('click', (e) => {
    e.preventDefault();
    stage = Math.min(COPY.length - 1, stage + 1);
    creative.textContent = COPY[stage]!;
    if (stage === 2) { h = Math.max(50, Math.round(h * 0.8)); ad.style.height = `${h}px`; }
  });
}
