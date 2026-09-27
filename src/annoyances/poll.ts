import type { Ctx } from './config.ts';

// "Do you agree?" Yes / Absolutely. Result is always 51 / 49.
export function init(_ctx: Ctx) {
  document.querySelectorAll<HTMLElement>('[data-poll]').forEach((p) => {
    p.querySelectorAll('input[type=radio]').forEach((r) => r.addEventListener('change', () => p.classList.add('voted')));
  });
}
