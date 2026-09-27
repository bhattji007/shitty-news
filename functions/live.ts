// Cloudflare Pages Function: GET /live → last 50 live articles from KV (written by stream/).
// Returns [] when the stream is off or the KV binding is absent, so the client never breaks.
type Env = { LIVE?: KVNamespace };
type KVNamespace = { get(key: string, type: 'text'): Promise<string | null> };

export const onRequestGet = async ({ env }: { env: Env }): Promise<Response> => {
  let body = '[]';
  try {
    const v = await env.LIVE?.get('live:latest', 'text');
    if (v) body = v;
  } catch { /* fall through to [] */ }
  return new Response(body, {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=60' },
  });
};
