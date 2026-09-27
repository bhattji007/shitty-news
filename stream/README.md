# stream/

Holds the NewsData.io WebSocket and mirrors the last 50 live articles into Cloudflare KV.
Off by default (`STREAM_ENABLED=false`). The site works fully without it.

Build from the repo root (the Dockerfile copies `src/lib/news`):

    docker build -f stream/Dockerfile -t shittynews-stream .
    docker run --env-file .env shittynews-stream

Env: `NEWSDATA_API_KEY`, `CF_ACCOUNT_ID`, `CF_KV_NAMESPACE_ID`, `CF_API_TOKEN`.
Optional: `NEWSDATA_REGISTRATION_ID` (reuse an existing query), `NEWSDATA_WS_URL`.

Exit code 3 = permanent rejection (no WebSocket entitlement on the plan, bad key). Don't restart-loop on it.
