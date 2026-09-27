# shittynews.com

The site is the parody. Real, boring Indian news headlines are shown exactly as their sources published them. Everything around them is a loving reproduction of Indian news-site dark patterns: the 400-vendor cookie panel, the five-stage paywall for a ₹0 subscription, the sticky banner whose close button runs away, the "Ad 1 of 47" video that never starts, the comments section with the same three comments on every story, and a "Lite" version that loads a 2 MB image first. Under the hood it is a static Astro site that scores ~100 on Lighthouse. That is part of the joke.

No headline or description is ever altered. No LLM is involved anywhere. There is no tracking, no analytics, no third-party scripts, and no data collection. The only cookies are the ones the gags need (`sane`, `v`, `ov`, `pw`, `mt`).

## Setup

```sh
git clone https://github.com/bhattji007/shitty-news.git && cd shitty-news
cp .env.example .env        # optional: add NEWSDATA_API_KEY for live headlines
npm i
npm run fetch-news           # real key → NewsData.io; no key → data/news.sample.json
npm run dev                  # http://localhost:4321
```

Other commands:

| Command | What it does |
| --- | --- |
| `npm run fetch-news` | Writes `data/news.json`. With a key: one NewsData.io request per category, last-good per category cached in `data/cache/`. All categories fail → RSS fallback (PIB, The Hindu, Indian Express, NDTV). No key → copies the committed sample. |
| `npm run fetch-news -- --rss` | Force the RSS path. Add `--sample` to regenerate `data/news.sample.json`. |
| `npm run build` | Static build to `dist/`. Generates the 2 MB `/lite` hero first. |
| `npm run verify` | Acceptance checks against `dist/` (headlines byte-identical, blocklist, paywall copy, no trackers, …). |
| `npm run deploy` | `wrangler pages deploy dist`. CI does this hourly. |

## How it is put together

```
src/pages/          routes: /, /article/[slug], /category/[cat], /subscribe, /sponsored/[id],
                    /preferences, /maintenance, /lite, /e-paper, 404
src/layouts/        Base.astro — head script for ?sane=1 and the 1-in-50 maintenance redirect
src/components/     masthead, ticker, grid, sidebar, overlays, cookie panel, paywalls, …
src/annoyances/     one module per gag; config.ts switches them
src/lib/news/       fetchers, normaliser, blocklist (src/lib/news/blocklist.ts)
data/               vendors.json (400), chumbox.json, products.json (6), news.sample.json (20)
functions/          Cloudflare Pages Functions: GET /live, GET /health
stream/             optional Node service holding the NewsData.io WebSocket → Cloudflare KV
.github/workflows/  build.yml (hourly fetch + build + deploy), stream.yml (Docker image, opt-in)
```

News flows in at build time. `scripts/fetch-news.ts` writes `data/news.json`; pages read it through `src/lib/news/load.ts`. Titles and descriptions pass through untouched apart from whitespace trimming. Titles matching the blocklist (death, violence, disaster words) are dropped: the parody is of the chrome, not of tragedy.

## Adding an annoyance module

1. Create `src/annoyances/your-gag.ts` exporting `init(ctx: Ctx)`. `ctx` gives you the page type, the visit count, and `openPaywall()` / `openCookiePanel()`.
2. Add markup to a component if it needs any, and tag it `data-annoy="your-gag"` so it can be switched off and hidden by `?sane=1`.
3. Register it in `src/annoyances/config.ts` (the flag) and in the `modules` map and run order in `src/annoyances/index.ts`.

Everything in `src/annoyances/` is vanilla TypeScript with no dependencies.

## The escape hatch

`/?sane=1` sets a 30-day cookie that disables every module, resets the degradation counter, and renders a plain readable page with the footer line *"This is what the site could have been."* `/?sane=0` clears it. `/maintenance` is also, accidentally, the most readable page on the site.

## Live layer (off by default)

NewsData.io's WebSocket stream is very likely a paid add-on, so it is built but disabled. To turn it on: create a KV namespace, bind it as `LIVE` in `wrangler.toml` or the Pages dashboard, run the `stream/` container somewhere that keeps a process alive (Fly.io, Railway, a small pod — not Workers), and set the repository variable `STREAM_ENABLED=true`. With it off, `/live` returns `[]` and the homepage LIVE box pulses "nothing yet", forever.

## Attribution

Headlines by their respective publishers. News data powered by [NewsData.io](https://newsdata.io). Weather by [Open-Meteo](https://open-meteo.com) (no key, no tracking).

**No headlines are altered. No tracking. No data collection.** Every headline links back to the original story with `rel="nofollow noopener"`.
