type Env = { LIVE?: KVNamespace };
type KVNamespace = { get(key: string, type: 'text'): Promise<string | null> };

export const onRequestGet = async ({ env }: { env: Env }): Promise<Response> => {
  let lastUpdate: string | null = null;
  try { lastUpdate = (await env.LIVE?.get('live:updated', 'text')) ?? null; } catch { /* none */ }
  return new Response(JSON.stringify({ ok: true, lastUpdate }), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
};
