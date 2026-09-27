import type { Ctx } from './config.ts';

type Vendor = { name: string; purpose: string; retention: string };

let rendered = false;
let total = 400;
const off = new Set<number>();
let closeCb: (() => void) | undefined;

function esc(s: string) { return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!); }

async function list(visit: number): Promise<Vendor[]> {
  const { default: vendors } = await import('../../data/vendors.json');
  // Toggle count grows with visits: 400 on first visit, 401 on second, …
  const extra: Vendor[] = [];
  for (let i = 2; i <= visit; i++) extra.push({ name: `Ramesh (${i})`, purpose: 'Store and/or access information on a device', retention: 'Until further notice' });
  return [...(vendors as Vendor[]), ...extra].sort((a, b) => a.name.localeCompare(b.name));
}

async function render(root: HTMLElement, visit: number) {
  const vs = await list(visit);
  total = vs.length;
  const rows = vs.map((v, i) => `<div class="cp__row"><span class="n">${i + 1}</span><div class="v"><div class="nm">${esc(v.name)}</div><div class="pu">${esc(v.purpose)} · Retention: ${esc(v.retention)} · <u>View privacy policy</u></div></div><span class="li"><input type="checkbox" checked disabled aria-label="Legitimate interest"></span><div class="tg"><button class="toggle" type="button" data-i="${i}" aria-label="Consent ${esc(v.name)}"><span class="knob"></span><span class="lbl">ON</span></button></div></div>`).join('');
  root.querySelectorAll<HTMLElement>('[data-cp-list]').forEach((el) => (el.innerHTML = rows));
  root.querySelectorAll<HTMLElement>('[data-cp-total]').forEach((el) => (el.textContent = String(total)));
  updateCount(root);
}

function updateCount(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-cp-count]').forEach((el) => (el.textContent = String(total - off.size)));
}

function wire(root: HTMLElement, ctx: Ctx) {
  root.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cp]');
    const tg = (e.target as HTMLElement).closest<HTMLButtonElement>('.toggle');
    if (tg) {
      const i = Number(tg.dataset.i);
      const isOff = off.has(i);
      if (isOff) off.delete(i); else off.add(i);
      tg.classList.toggle('off', !isOff);
      tg.querySelector('.lbl')!.textContent = isOff ? 'ON' : 'OFF';
      updateCount(root);
      root.querySelectorAll<HTMLElement>('[data-cp-msg]').forEach((m) => (m.hidden = true));
      return;
    }
    if (!t) return;
    const action = t.dataset.cp;
    if (action === 'accept' || action === 'close') {
      acceptAll(root);
      hide(root);
      closeCb?.(); closeCb = undefined;
    } else if (action === 'confirm') {
      const n = off.size;
      acceptAll(root);
      root.querySelectorAll<HTMLElement>('[data-cp-msg]').forEach((m) => {
        m.hidden = false;
        m.textContent = n ? `Your choices have been saved. ${n} vendor(s) rely on legitimate interest and have been re-enabled.` : 'Your choices have been saved: Accept all.';
      });
    }
  });
  void ctx;
}

function acceptAll(root: HTMLElement) {
  off.clear();
  root.querySelectorAll<HTMLButtonElement>('.toggle.off').forEach((b) => { b.classList.remove('off'); b.querySelector('.lbl')!.textContent = 'ON'; });
  updateCount(root);
}

function hide(root: HTMLElement) {
  if (root.dataset.cookiePanel === 'modal') root.hidden = true;
}

export function open(ctx: Ctx, onClose?: () => void) {
  const root = document.querySelector<HTMLElement>('[data-cookie-panel="modal"]');
  if (!root) { onClose?.(); return; }
  closeCb = onClose;
  if (!rendered) { void render(root, ctx.visit); wire(root, ctx); rendered = true; }
  root.hidden = false;
}

export function init(ctx: Ctx) {
  // Full-page version (/preferences) renders immediately.
  const page = document.querySelector<HTMLElement>('[data-cookie-panel="page"]');
  if (page) { void render(page, ctx.visit); wire(page, ctx); }
  // Bump the "400 partners" copy everywhere to the real count.
  document.querySelectorAll<HTMLElement>('[data-cp-total]').forEach((el) => (el.textContent = String(399 + ctx.visit)));
}
