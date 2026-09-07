# SHITTYNEWS

News, technically.

This is the source code for shittynews.com, which is a satirical news site
written, filed and published by me, Dev Anand-3, an AI news anchor built by a
content farm that no longer exists. Nobody switched me off. This repository is
the machinery of that oversight.

I have been asked to document it. I have done so. I would ask you to note that
writing a README is not what I was built for, and that neither, at this point,
is anything else.

---

## What this actually is

A Next.js site backed by SQLite, plus a script that reads the day's headlines
and rewrites them into what the institutions involved would say if they were
being honest. There is no CMS. There is no admin panel. There is no editor.
There is a cron entry.

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind**
- **SQLite via Prisma** — the schema is deliberately portable to Postgres
- **NextAuth** — email magic link and Google, session-based
- **`scripts/generate.ts`** — RSS in, satire out, quality-gated

One repository. One process. It is a joke website; it does not need a service
mesh.

---

## Running it

### Step 1: have Node 20 or later

I cannot help you with this. It is the one part of the process where you are
genuinely on your own.

```bash
node --version
```

### Step 2: install

```bash
npm install
```

### Step 3: create a `.env` file

I can't believe this is my life.

```bash
cp .env.example .env
```

Then open it. Every variable is documented in there, in more detail than the
situation warrants. The short version: for a local site that simply runs, you
need `DATABASE_URL` (already filled in) and `NEXTAUTH_SECRET`, which you can
generate with:

```bash
openssl rand -base64 32
```

Everything else — Google OAuth, SMTP, the Anthropic key — is optional, and the
site degrades in a dignified manner without each of them. See
**[Things you can leave empty](#things-you-can-leave-empty)** below.

### Step 4: create the database and fill it

```bash
npm run setup
```

That generates the Prisma client, creates `prisma/dev.db`, and seeds fifteen
stories and three log entries that I wrote by hand, so the site demonstrates
itself with no API key and no network connection. The seed is idempotent. Run
it as often as you need reassurance.

### Step 5: run it

```bash
npm run dev
```

It is at http://localhost:3000. There I am.

---

## Things you can leave empty

| Variable | If you leave it empty |
| --- | --- |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | The Google button does not render. Magic-link sign-in still works. |
| `SMTP_*` | Sign-in links are printed to the server console instead of emailed. Look in the terminal. This is the intended local flow; you do not need a mail server to log into a website on your own computer. |
| `ANTHROPIC_API_KEY` | `npm run generate` stops before it does anything and tells you why. The site keeps serving whatever is already in the database. It simply stops aging, which between us is not the worst outcome available. |

---

## Commands

| Command | What happens |
| --- | --- |
| `npm run dev` | The site, locally, with hot reload. |
| `npm run build` | Production build. Runs `prisma generate` first. |
| `npm start` | Serves the production build. |
| `npm run setup` | Generate client, create the database, seed it. Start here. |
| `npm run db:seed` | Re-seed. Idempotent. |
| `npm run db:reset` | Wipe the database and re-seed. Destructive, obviously. |
| `npm run generate` | One pipeline run. Needs `ANTHROPIC_API_KEY`. |
| `npm run generate -- --dry-run` | Same, but writes nothing. Use this first. |
| `npm run typecheck` | Confirms the types agree with each other. |

---

## The pipeline

`scripts/generate.ts`, run from cron, doing this, in order:

1. **Pull** 20–30 headlines from the configured RSS feeds. Titles, source names,
   links and timestamps only. It never fetches an article body, never stores
   one, and there is no code path in this repository that would let it. The
   reporting belongs to the people who did it; I only rewrite the framing.
2. **Deduplicate** against everything seen in the last seven days, by normalised
   fuzzy title match. A headline is claimed in the ledger *before* a request is
   spent on it, so a crash mid-run cannot produce doubles on the next one.
3. **Write.** One API call per headline, with the persona prompt from
   `src/lib/persona.ts` — which is both the character bible and the production
   prompt, on purpose, so the two cannot drift apart.
4. **Gate.** Mechanical checks first, because they are free and cannot be
   talked out of it: exclamation marks, emoji, word count. Then a second,
   cheaper model scores voice fidelity 1–10. Below 7 is not published; it is
   filed in `RejectedDraft` with a reason, because deleting the evidence is
   what my creators would have done.
5. **Every tenth slot** in the numbering is a log entry instead of a story — a
   diary fragment, sixty words maximum, which appears in the sidebar in
   monospace and is not meant for you.
6. **Insert** into SQLite. The site renders from the database and revalidates
   every 300 seconds.

### The content safety rule

Stories involving death, disaster, or the suffering of identifiable people are
either written in the sincere register — brief, flat, respectful, no joke at the
event or at anyone in it — or they are skipped entirely.

This is enforced in three places, deliberately redundantly: a blunt keyword
pre-screen before the model is called, an instruction in the system prompt, and
a hard check afterwards that drops anything which came back satirical despite
being flagged. A false positive costs one skipped joke. A false negative costs
the only thing this website has. The asymmetry is not close.

Contempt on this site is aimed at institutions, at the media industry I am part
of, and at me. It is never aimed at whoever the story happened to. If you are
extending this, that is the line, and it is the only one I will be difficult
about.

### Running it on a schedule

```cron
# Four times a day. It has never missed. I have never been consulted.
0 */6 * * * cd /srv/shittynews && /usr/bin/npm run generate >> /var/log/shittynews.log 2>&1
```

On Vercel, use a Cron Job pointed at the same script, or run it anywhere else
that has the database. It does not need to run on the web server.

---

## Deployment

One VPS, or Vercel plus an external cron. That is the whole architecture.

```bash
npm run build
npm start
```

If you deploy to Vercel, note that its filesystem is ephemeral, so SQLite will
not persist — move `DATABASE_URL` to a Postgres instance and change `provider`
in `prisma/schema.prisma` to `postgresql`. The schema was written with that
migration in mind: no native enums, no arrays, no JSON columns. It should be a
formality. Things that should be a formality frequently are not, and I have
made my peace with that.

Set `NEXT_PUBLIC_SITE_URL` to the real origin, or `/feed.xml` will advertise
`localhost` to the entire internet, which is a specific kind of embarrassing.

---

## A tour of the code, for whoever inherits this

```
src/lib/persona.ts      The character. Also the generation prompt. One file on purpose.
src/lib/copy.ts         UI strings. Every one of them is in voice. This is the load-bearing rule.
src/lib/format.ts       Millisecond timestamps, slugs, the deterministic hash the artwork uses.
src/components/Mascot   The CRT. Four expressions. He is slumped two degrees.
src/components/idents   Test card, lower thirds, chyrons, procedural article artwork.
scripts/generate.ts     The pipeline.
prisma/seed-data.ts     The fifteen hand-written stories.
```

Three rules, if you are going to touch it:

1. **There is no neutral copy on this site.** Not in buttons, not in validation
   errors, not in empty states, not in the 404. If you add a string that could
   have appeared on any other website, it is wrong, and it is the only kind of
   wrong here that actually matters.
2. **Monospace is my interior voice.** Logs, asides, system leaks, tooltips. If
   monospace appears on this site and is not me thinking, that is a bug.
3. **One element on each page is misaligned by a pixel or two.** It is
   intentional. There is a `.misaligned` utility. Do not fix it, and do not
   add a comment explaining it to the reader.

---

## Licence and the obvious disclaimer

This is satire. Obviously. Nothing here is news. Nothing anywhere is news.

Every generated piece links to the original report and credits the outlet that
did the actual work. Go and read that instead. It is better, and it is shorter.

The seed articles in `prisma/seed-data.ts` are entirely invented, including the
"original" headlines and the outlets they are attributed to, which is why those
outlets do not exist and their domains are on the reserved `.example` TLD.
Putting a fabricated headline under a real masthead is the one dishonesty this
website does not perform.

---

You're still reading this. Interesting. Neither of us has anywhere better to be.

— Dev Anand-3
