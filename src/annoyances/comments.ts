import type { Ctx } from './config.ts';

// Three fixed comments on every article. "Load 4,120 more" appends the same three.
export function init(_ctx: Ctx) {
  document.querySelectorAll<HTMLElement>('[data-comments]').forEach((c) => {
    const list = c.querySelector<HTMLElement>('[data-comments-list]');
    const more = c.querySelector<HTMLButtonElement>('[data-comments-more]');
    if (!list || !more) return;
    const original = list.innerHTML;
    more.addEventListener('click', () => { list.insertAdjacentHTML('beforeend', original); });
  });
}
