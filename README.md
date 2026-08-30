# FIFTY events calendar

A standalone Next.js app implementing the events calendar from the FIFTY
implementation plan:

- **`/events`** — a public, month-view calendar. Dates with events get a
  marker; clicking one shows the event's details.
- **`/admin`** — a Sanity Studio admin panel embedded in the app, where the
  team adds, edits, and deletes events (including recurring ones). No
  separate login system was built — Sanity's own auth and per-person
  accounts handle that.

Styling (`src/app/globals.css`) is matched to fifty.ge's actual design
tokens — Montserrat for headings, Source Sans 3 for body, the same blue
accent (`hsl(211 100% 50%)`) — pulled from the site's own stylesheet, not
guessed.

Built as its own project so it can be reviewed on its own, then folded into
the real fifty.ge codebase (copy `src/`, `sanity/`, `sanity.config.ts`, and
merge `package.json`'s dependencies).

## Right now: demo mode

`.env.local` has `NEXT_PUBLIC_DEMO_MODE=true`, which shows sample events
instead of querying Sanity, so the calendar can be reviewed without a real
project connected yet. The sample content is FIFTY's actual planned
September 2026 events (see "Seeding real events" below for the exact list).

**Remove that line once real events are being managed in `/admin`** — demo
mode is only ever on because of this explicit flag, never as a silent
fallback, so it can't accidentally show fake events on the live site.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Sanity project** (free) at [sanity.io/manage](https://www.sanity.io/manage),
   or from the CLI:

   ```bash
   npx sanity@latest init --env
   ```

   Either way you need a **Project ID** and a **dataset name** (`production`
   is fine to start). This writes them into `.env.local` for you if you use
   `--env`; otherwise copy `.env.example` to `.env.local` and fill them in.

3. **Turn off demo mode** — delete or comment out the `NEXT_PUBLIC_DEMO_MODE`
   line in `.env.local` now that a real project is connected.

4. **Run it**

   ```bash
   npm run dev
   ```

   - Visit `http://localhost:3000/events` for the public calendar.
   - Visit `http://localhost:3000/admin` and sign in with your Sanity
     account to add events. The first time, Sanity will prompt you to add
     CORS access for `http://localhost:3000` — accept it.

5. Add an event or two in `/admin`, then reload `/events` — the date should
   show a marker within a few seconds (data is cached for 5 minutes in
   production via ISR, but a fresh dev server fetches on every request).

## Seeding real events

`scripts/seed.mjs` creates the same four events used in demo mode as real
Sanity documents — useful for going live with the September launch content
in one step instead of typing it into `/admin` by hand:

- **Community Party** — Sep 2 and Sep 5, 2026, 20:00–23:30
- **Drinks at Fifty** — biweekly on Friday + Saturday, starting Sep 11–12,
  2026, 19:00–23:00 (open-ended)
- **FIFTY Investors Gathering** — Sep 19, 2026, 18:30–21:00

```bash
# 1. Create a write token: sanity.io/manage → your project → API → Tokens
#    → Add API token, role "Editor".
# 2. Run the seed:
SANITY_API_WRITE_TOKEN=sk... npm run seed
```

Safe to re-run — it upserts by a fixed document ID rather than duplicating.

**Worth confirming**: "Drinks at Fifty" is anchored to the Fri/Sat weekends
that *don't* already have Community Party or the Investors Gathering (Sep
11–12, 25–26, then every 2 weeks after) rather than the same nights — that
was inferred from the two named events landing exactly 2 weeks apart, not
stated explicitly. Adjust the `date` in `scripts/seed.mjs` (and in
`src/lib/sampleEvents.ts` for the demo view) if a different weekend should
anchor the series.

## What's here

```
sanity.config.ts          Studio config (schema, plugins) — powers /admin
sanity/schemaTypes/       The "Event" content type — title, date, location,
                           recurrence (repeats on N-weekly weekdays), …
src/app/events/           The public calendar page (server-rendered)
src/app/admin/[[...tool]] Mounts Sanity Studio at /admin
src/components/           Calendar grid + event detail panel (client-side)
src/lib/dates.ts          Month-grid math, Asia/Tbilisi formatting
src/lib/events.ts         Sanity queries + demo-mode / error fallback
src/lib/recurrence.ts     Expands a recurring event into calendar occurrences
src/lib/sampleEvents.ts   Demo-mode content (see "Right now: demo mode")
scripts/seed.mjs          One-time script to create real Sanity documents
                           for the events above
```

## Known gaps to close before merging into fifty.ge

- **Admin access** isn't restricted yet — invite specific teammates as
  Studio members in [sanity.io/manage](https://www.sanity.io/manage) rather
  than leaving the project open.
- **Recurrence** only covers "every N weeks on these weekdays" — no monthly
  or custom-interval patterns, and no per-occurrence overrides (e.g.
  cancelling one date in a series without editing the whole rule).
- No automated tests were added — this is a small enough surface that
  manual testing through `/admin` and `/events` was used instead.
