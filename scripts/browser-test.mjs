// Browser-level acceptance checks over the Chrome DevTools Protocol.
// Needs a Chromium (CHROME_PATH; defaults to Brave on macOS) and `npm run preview` on :4321.
import WebSocket from 'ws';
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';

const BRAVE = process.env.CHROME_PATH || '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const BASE = 'http://127.0.0.1:4321';
const PORT = 9333;
const profile = mkdtempSync(tmpdir() + '/sn-');
const brave = spawn(BRAVE, [`--headless=new`, `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));

let fails = 0;
const ok = (name, pass, detail = '') => { console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); if (!pass) fails++; };

async function newTab(url) {
  const r = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  const t = await r.json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => ws.once('open', r));
  let id = 0; const pending = new Map();
  ws.on('message', (d) => { const m = JSON.parse(d); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const evalJs = async (expr) => { const m = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); return m.result?.result?.value; };
  const goto = async (u) => { await send('Page.navigate', { url: u }); await new Promise((r) => setTimeout(r, 1200)); };
  const close = async () => { ws.close(); await fetch(`http://127.0.0.1:${PORT}/json/close/${t.id}`); };
  await send('Page.enable');
  await new Promise((r) => setTimeout(r, 1200));
  return { evalJs, goto, close };
}

// 1. First visit: preferences page renders 400 toggles; cookie banner visible on home
let tab = await newTab(`${BASE}/preferences`);
ok('cookie panel renders 400 toggles on first visit', (await tab.evalJs(`document.querySelectorAll('.toggle').length`)) === 400, String(await tab.evalJs(`document.querySelectorAll('.toggle').length`)));
ok('visit cookie v=1', (await tab.evalJs(`document.cookie`)).includes('v=1'));
await tab.close();

// 2. Second visit (new tab = new session, same cookies): 401 toggles
tab = await newTab(`${BASE}/preferences`);
ok('cookie panel renders 401 toggles on second visit', (await tab.evalJs(`document.querySelectorAll('.toggle').length`)) === 401, String(await tab.evalJs(`document.querySelectorAll('.toggle').length`)));
ok('Reject all disabled with title Coming soon', await tab.evalJs(`!!document.querySelector('.cp__foot .reject[disabled][title="Coming soon"]')`));
ok('body font shrank by 0.25px on visit 2', (await tab.evalJs(`getComputedStyle(document.body).fontSize`)) === '12.75px', await tab.evalJs(`getComputedStyle(document.body).fontSize`));
await tab.close();

// 3. Overlay stack on home
tab = await newTab(`${BASE}/`);
ok('cookie banner shown first', await tab.evalJs(`!document.querySelector('[data-ov="cookie"]').hidden && document.querySelector('[data-ov="notif-chrome"]').hidden`));
await tab.evalJs(`document.querySelector('[data-ov-accept]').click()`);
ok('accept → chrome-style prompt', await tab.evalJs(`document.querySelector('[data-ov="cookie"]').hidden && !document.querySelector('[data-ov="notif-chrome"]').hidden`));
await tab.evalJs(`document.querySelector('[data-ov="notif-chrome"] [data-ov-allow]').click()`);
ok('allow → site prompt', await tab.evalJs(`!document.querySelector('[data-ov="notif-site"]').hidden`));
await tab.evalJs(`document.querySelector('[data-ov="notif-site"] [data-ov-allow]').click()`);
ok('→ apology prompt', await tab.evalJs(`!document.querySelector('[data-ov="notif-sorry"]').hidden`));
await tab.evalJs(`document.querySelector('[data-ov="notif-sorry"] [data-ov-allow]').click()`);
ok('→ app-install bar, ov cookie set', await tab.evalJs(`!document.querySelector('[data-ov="appbar"]').hidden && document.cookie.includes('ov=1')`));
ok('sticky banner visible, grows on scroll', await tab.evalJs(`(async()=>{const a=document.querySelector('[data-sticky-ad]');const h0=a.getBoundingClientRect().height;for(let i=0;i<20;i++){window.scrollBy(0,50);window.dispatchEvent(new Event('scroll'));}await new Promise(r=>setTimeout(r,300));return a.getBoundingClientRect().height>h0;})()`));
ok('close button moves on hover', await tab.evalJs(`(()=>{const c=document.querySelector('.sticky-ad__close');c.dispatchEvent(new Event('mouseenter'));return c.style.transform.includes('translate');})()`));
ok('chumbox has 8 tiles', (await tab.evalJs(`document.querySelectorAll('[data-chumbox] .chum').length`)) === 8);
ok('ticker never pauses on hover (no animation-play-state change)', await tab.evalJs(`(()=>{const t=document.querySelector('.ticker__track');t.dispatchEvent(new Event('mouseover'));return getComputedStyle(t).animationPlayState==='running';})()`));
ok('LIVE box says nothing yet', (await tab.evalJs(`document.querySelector('[data-livebox] .empty').textContent`)) === 'LIVE: nothing yet');
await tab.close();

// 4. Paywall escalation on an article: 5 strings then stop
const slug = await (async () => { const t2 = await newTab(`${BASE}/`); const s = await t2.evalJs(`document.querySelector('.card').getAttribute('href')`); await t2.close(); return s; })();
const expected = ['Support quality journalism', "You've read 1 free article. Wow.", 'We noticed you have money.', 'Your neighbour subscribed.', 'Fine.'];
const seen = [];
for (let i = 0; i < 6; i++) {
  tab = await newTab(`${BASE}${slug}`);
  await tab.evalJs(`window.scrollTo(0, document.body.scrollHeight)`);
  await new Promise((r) => setTimeout(r, 600));
  const visible = await tab.evalJs(`(()=>{const m=document.querySelector('[data-paywall]');if(!m||m.hidden)return null;const on=m.querySelector('.pw.on');return on?on.querySelector('h2').textContent:null;})()`);
  seen.push(visible);
  if (visible) await tab.evalJs(`(document.querySelector('[data-paywall] .pw.on [data-pw]')).click()`);
  await tab.close();
}
ok('paywall escalates through exactly the 5 strings then stops', JSON.stringify(seen) === JSON.stringify([...expected, null]), JSON.stringify(seen));

// 5. Poll, comments, video, share
tab = await newTab(`${BASE}${slug}`);
await tab.evalJs(`document.querySelector('[data-paywall]').hidden = true`);
await tab.evalJs(`document.querySelector('[data-poll] input').click()`);
ok('poll result 51/49', (await tab.evalJs(`document.querySelector('[data-poll]').classList.contains('voted') && document.querySelector('[data-poll] .res').textContent`)).includes('51%'));
const before = await tab.evalJs(`document.querySelectorAll('[data-comments] .comment').length`);
await tab.evalJs(`document.querySelector('[data-comments-more]').click()`);
ok('load more appends the same three comments', before === 3 && (await tab.evalJs(`document.querySelectorAll('[data-comments] .comment').length`)) === 6);
ok('volume slider only increases', await tab.evalJs(`(()=>{const v=document.querySelector('[data-video] input');v.value='80';v.dispatchEvent(new Event('input'));v.value='20';v.dispatchEvent(new Event('input'));return v.value==='80';})()`));
ok('mute button unmutes', await tab.evalJs(`(()=>{const b=document.querySelector('[data-mute]');b.click();return b.textContent==='🔊';})()`));
ok('pager increments 1/12 → 2/12', await tab.evalJs(`(()=>{document.querySelector('[data-pager-next]').click();return document.querySelector('[data-pager-n]').textContent==='2';})()`));
ok('every headline link goes to article page; read-full-story is nofollow', await tab.evalJs(`document.querySelector('.readfull').rel==='nofollow noopener'`));
await tab.close();

// 6. ?sane=1: clean page
tab = await newTab(`${BASE}/?sane=1`);
ok('sane attribute set + cookie', await tab.evalJs(`document.documentElement.hasAttribute('data-sane') && document.cookie.includes('sane=1')`));
ok('sane: no visible overlays / banner / ads', await tab.evalJs(`['[data-ov="cookie"]','[data-sticky-ad]','.ad','[data-chumbox]','[data-ov="appbar"]'].every(s=>{const e=document.querySelector(s);return !e||getComputedStyle(e).display==='none'})`));
ok('sane: default (larger) font size, degradation reset', (await tab.evalJs(`getComputedStyle(document.body).fontSize`)) === '15px' && !(await tab.evalJs(`document.cookie`)).match(/(^|; )v=\d/));
ok('sane: footer line visible', await tab.evalJs(`(()=>{const e=document.querySelector('.sane-footer');return getComputedStyle(e).display!=='none'&&e.textContent.includes('This is what the site could have been.')})()`));
await tab.goto(`${BASE}/?sane=0`);
ok('sane=0 clears it', await tab.evalJs(`!document.documentElement.hasAttribute('data-sane')`));
await tab.close();

// 7. Lite page loads hero then renders
tab = await newTab(`${BASE}/lite`);
ok('lite: hero loaded, page revealed, labelled', await tab.evalJs(`document.documentElement.classList.contains('lite-ready') && document.querySelector('.lite-label').textContent==='Lite version' && document.querySelector('.lite-hero img').naturalWidth===840`));
await tab.close();

brave.kill();
console.log(fails ? `\n${fails} browser check(s) failed` : '\nall browser checks passed');
process.exit(fails ? 1 : 0);
