// NewsData.io real-time stream → ring buffer of 50 → Cloudflare KV (`live:latest`).
//
// Protocol (from NewsData's official client, python-client/src/newsdataapi/websocket.py):
//   1. POST https://newsdata.io/api/1/websocket/register?apikey=…&country=in&language=en&news_type=latest
//      → { results: { registration_id } }   (409 = already registered; id is in the body)
//   2. wss://ws.newsdata.io/ws/event?apikey=…&registration_id=…
//      messages: { results: Article[] }      keepalive ping every 20 s
//   Handshake 401/403 or close code 1008 = permanent (bad key / no WebSocket entitlement) → exit.
//
// Deps: ws only. Runs anywhere that keeps a process alive. Not on Workers.
import WebSocket from 'ws';
import { normaliseNewsData } from '../src/lib/news/normalise.ts';
import { isBlocked } from '../src/lib/news/blocklist.ts';
import type { Article } from '../src/lib/news/types.ts';

const env = (k: string, required = true) => {
  const v = process.env[k]?.trim();
  if (!v && required) { console.error(`missing env ${k}`); process.exit(2); }
  return v ?? '';
};
const API_KEY = env('NEWSDATA_API_KEY');
const CF_ACCOUNT_ID = env('CF_ACCOUNT_ID');
const CF_KV_NAMESPACE_ID = env('CF_KV_NAMESPACE_ID');
const CF_API_TOKEN = env('CF_API_TOKEN');
const REGISTRATION_ID = env('NEWSDATA_REGISTRATION_ID', false);
const WS_URL = env('NEWSDATA_WS_URL', false) || 'wss://ws.newsdata.io/ws/event';
const REST = 'https://newsdata.io/api/1';
const RING = 50;

const log = (...a: unknown[]) => console.log(new Date().toISOString(), ...a);

const buffer: Article[] = [];
let flushTimer: NodeJS.Timeout | null = null;

async function kvPut(key: string, value: string) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  const r = await fetch(url, { method: 'PUT', headers: { authorization: `Bearer ${CF_API_TOKEN}`, 'content-type': 'text/plain' }, body: value });
  if (!r.ok) throw new Error(`KV PUT ${key} → ${r.status} ${await r.text()}`);
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(async () => {
    flushTimer = null;
    try {
      await kvPut('live:latest', JSON.stringify(buffer));
      await kvPut('live:updated', new Date().toISOString());
      log(`kv: wrote ${buffer.length} items`);
    } catch (e) { log('kv error', (e as Error).message); }
  }, 2000);
}

function ingest(results: unknown) {
  if (!Array.isArray(results)) return;
  let added = 0;
  for (const r of results) {
    const a = normaliseNewsData(r, 'top', true);
    if (!a || isBlocked(a.title) || buffer.some((b) => b.id === a.id)) continue;
    buffer.unshift(a);
    added++;
  }
  if (buffer.length > RING) buffer.length = RING;
  if (added) { log(`+${added} live (buffer ${buffer.length})`); scheduleFlush(); }
}

async function register(): Promise<string> {
  if (REGISTRATION_ID) return REGISTRATION_ID;
  const url = `${REST}/websocket/register?apikey=${encodeURIComponent(API_KEY)}&country=in&language=en&removeduplicate=1&news_type=latest`;
  const r = await fetch(url, { method: 'POST' });
  const body = (await r.json().catch(() => ({}))) as { results?: { registration_id?: string }; message?: unknown };
  const id = body.results?.registration_id;
  if ((r.ok || r.status === 409) && id) { log(`registered query ${id}${r.status === 409 ? ' (existing)' : ''}`); return id; }
  throw Object.assign(new Error(`register failed: ${r.status} ${JSON.stringify(body.message ?? body)}`), { permanent: r.status === 401 || r.status === 403 });
}

function connect(regId: string, delay = 1000) {
  const url = `${WS_URL}?apikey=${encodeURIComponent(API_KEY)}&registration_id=${encodeURIComponent(regId)}`;
  log('connecting', WS_URL);
  const ws = new WebSocket(url);
  let ping: NodeJS.Timeout | null = null;
  let alive = true;

  ws.on('open', () => {
    log('connected');
    delay = 1000;
    ping = setInterval(() => { if (!alive) return ws.terminate(); alive = false; ws.ping(); }, 20_000);
  });
  ws.on('pong', () => { alive = true; });
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString()) as { results?: unknown };
      ingest(msg.results);
    } catch (e) { log('bad message', (e as Error).message); }
  });
  ws.on('unexpected-response', (_req, res) => {
    log(`handshake rejected: HTTP ${res.statusCode}`);
    if (res.statusCode === 401 || res.statusCode === 403) { log('permanent: bad key or no WebSocket entitlement on this plan. exiting.'); process.exit(3); }
  });
  ws.on('error', (e) => log('ws error', e.message));
  ws.on('close', (code, reason) => {
    if (ping) clearInterval(ping);
    if (code === 1008) { log(`closed 1008 policy violation: ${reason.toString()} — permanent. exiting.`); process.exit(3); }
    const next = Math.min(60_000, delay);
    log(`closed ${code}; reconnecting in ${next / 1000}s`);
    setTimeout(() => connect(regId, Math.min(60_000, delay * 2)), next);
  });
}

(async () => {
  try {
    const id = await register();
    connect(id);
  } catch (e) {
    log((e as Error).message);
    process.exit((e as { permanent?: boolean }).permanent ? 3 : 1);
  }
})();
