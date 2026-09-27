import { config, type AnnoyanceName, type Ctx } from './config.ts';
import * as degrade from './degrade.ts';
import * as masthead from './masthead.ts';
import * as ticker from './ticker.ts';
import * as cookie400 from './cookie400.ts';
import * as paywall from './paywall.ts';
import * as overlays from './overlays.ts';
import * as banner from './banner.ts';
import * as video from './video.ts';
import * as chumbox from './chumbox.ts';
import * as comments from './comments.ts';
import * as poll from './poll.ts';
import * as share from './share.ts';

const modules: Record<AnnoyanceName, { init(ctx: Ctx): void }> = {
  degrade, masthead, ticker, cookie400, paywall, overlays, banner, video, chumbox, comments, poll, share,
  maintenance: { init() {} }, // handled inline in <head> so the redirect beats first paint
};

const html = document.documentElement;
const sane = html.hasAttribute('data-sane');

const ctx: Ctx = {
  page: html.dataset.page ?? 'other',
  stream: html.dataset.stream === '1',
  visit: 1,
  openPaywall: () => paywall.open(ctx),
  openCookiePanel: (onClose) => cookie400.open(ctx, onClose),
};

// Hide markup for gags that are switched off in config (sane mode hides all via CSS).
for (const [name, on] of Object.entries(config)) {
  if (!on) document.querySelectorAll(`[data-annoy="${name}"]`).forEach((el) => el.setAttribute('hidden', ''));
}

if (!sane) {
  // Order matters: degrade first (sets visit count), masthead/ticker next, overlays last.
  const order: AnnoyanceName[] = ['degrade', 'masthead', 'ticker', 'cookie400', 'paywall', 'banner', 'video', 'chumbox', 'comments', 'poll', 'share', 'overlays'];
  for (const name of order) {
    if (!config[name]) continue;
    try { modules[name].init(ctx); } catch (e) { console.warn(`[shittynews] ${name} failed`, e); }
  }
} else {
  // Even sane readers get real dates and a working copy-link button.
  masthead.initSane();
}
