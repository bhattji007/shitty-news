import type { Ctx } from './config.ts';

// Infinite spinner, "Ad 1 of 47", volume slider that only increases, mute that unmutes.
export function init(_ctx: Ctx) {
  document.querySelectorAll<HTMLElement>('[data-video]').forEach((v) => {
    const vol = v.querySelector<HTMLInputElement>('input[type=range]');
    const mute = v.querySelector<HTMLButtonElement>('[data-mute]');
    let last = vol ? Number(vol.value) : 0;
    vol?.addEventListener('input', () => {
      const n = Number(vol.value);
      if (n < last) vol.value = String(last); else last = n;
    });
    mute?.addEventListener('click', () => {
      mute.textContent = '🔊';
      mute.title = 'Unmuted';
      if (vol) { last = Math.min(100, last + 10); vol.value = String(last); }
    });
  });
}
