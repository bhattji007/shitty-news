import type { Ctx } from './config.ts';
import { getCookie, setCookie } from './cookies.ts';

// First-load stack. Each dismiss reveals the next:
// cookie banner → Chrome-style "Allow notifications?" → the site's own prompt →
// a third apologising for the first two → app-install bar. Cookie `ov` = once per session.
export function init(ctx: Ctx) {
  if (getCookie('ov')) return;
  const q = (s: string) => document.querySelector<HTMLElement>(s);
  const cookie = q('[data-ov="cookie"]');
  const chrome = q('[data-ov="notif-chrome"]');
  const site = q('[data-ov="notif-site"]');
  const sorry = q('[data-ov="notif-sorry"]');
  const appbar = q('[data-ov="appbar"]');
  const steps = [cookie, chrome, site, sorry, appbar].filter(Boolean) as HTMLElement[];
  let i = -1;

  const next = () => {
    if (i >= 0) steps[i]!.hidden = true;
    i += 1;
    if (i >= steps.length) return;
    const el = steps[i]!;
    el.hidden = false;
    if (el === appbar) setCookie('ov', '1'); // session cookie; the bar is the last stage
  };

  cookie?.querySelector('[data-ov-accept]')?.addEventListener('click', next);
  cookie?.querySelector('[data-ov-manage]')?.addEventListener('click', () => {
    cookie.hidden = true;
    ctx.openCookiePanel(() => { i -= 1; cookie.hidden = false; next(); });
  });

  for (const n of [chrome, site, sorry]) {
    if (!n) continue;
    n.querySelector('[data-ov-allow]')?.addEventListener('click', next);
    n.querySelectorAll('[data-ov-block]').forEach((b) => b.addEventListener('click', () => {
      const ask = n.querySelector<HTMLElement>('.ask');
      const blocked = n.querySelector<HTMLElement>('.blocked');
      if (ask && blocked) { ask.hidden = true; blocked.hidden = false; setTimeout(next, 2200); }
      else next();
    }));
  }
  appbar?.querySelectorAll('[data-ov-dismiss]').forEach((b) => b.addEventListener('click', () => { appbar.hidden = true; }));

  next();
}
