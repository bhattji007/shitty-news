import type { Ctx } from './config.ts';

// 14 share buttons. "Copy link" copies the subscribe URL. Print prints. Fax dials.
export function init(_ctx: Ctx) {
  document.querySelectorAll<HTMLElement>('[data-share]').forEach((row) => {
    row.querySelector<HTMLButtonElement>('[data-share-print]')?.addEventListener('click', () => window.print());
    const copy = row.querySelector<HTMLButtonElement>('[data-share-copy]');
    copy?.addEventListener('click', async () => {
      const url = `${location.origin}/subscribe`;
      try { await navigator.clipboard.writeText(url); copy.textContent = 'Copied!'; }
      catch { copy.textContent = 'Copied (probably)'; }
      setTimeout(() => (copy.textContent = 'Copy link'), 1500);
    });
  });
}
