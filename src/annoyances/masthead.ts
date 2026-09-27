import type { Ctx } from './config.ts';

const IST = 'Asia/Kolkata';

function stampDate() {
  const el = document.querySelector<HTMLElement>('[data-masthead-date]');
  if (!el) return;
  const now = new Date();
  const d = now.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric', timeZone: IST });
  const t = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: IST });
  el.textContent = `${d} | Updated ${t} IST`;
}

async function meerutTemperature() {
  const el = document.querySelector<HTMLElement>('[data-masthead-temp]');
  if (!el) return;
  try {
    // Open-Meteo: no key, no tracking. Meerut, UP.
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=28.9845&longitude=77.7064&current=temperature_2m', { cache: 'no-store' });
    const j = (await r.json()) as { current?: { temperature_2m?: number } };
    const t = j.current?.temperature_2m;
    el.textContent = typeof t === 'number' ? `${Math.round(t)}°C` : '--°C';
  } catch {
    el.textContent = '--°C';
  }
}

export function init(_ctx: Ctx) {
  stampDate();
  void meerutTemperature();
}

export function initSane() {
  stampDate();
}
