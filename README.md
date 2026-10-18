# Circle of Deeds

A Random Good Deeds Society project. Next.js 15 + Supabase. The live site is [circleofdeeds.app](https://circleofdeeds.app). Merging to `main` deploys it.

Pages: `/` landing, `/start` pass a deed (code + QR), `/d` enter a code, `/d/[code]` receive, `/circle/[id]`, `/journal`, `/impact`.

Where things stand, including the Oct 14 continuation flow, is in [docs/HANDOFF.md](docs/HANDOFF.md). A phone-size review from Oct 18 is in [docs/mobile-audit-2026-10-18.md](docs/mobile-audit-2026-10-18.md).

## Run it locally

Node 20 or newer, and pnpm (the lockfile is `pnpm-lock.yaml`).

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000.

`.env.example` points at the **live** Supabase project. The three `NEXT_PUBLIC_*` values are the publishable ones and are safe in the browser, but creating or accepting a code from a local dev server writes to production. Use a fresh database if you want a sandbox.

## Fresh database

Run these once, in order, in the Supabase SQL editor of an **empty** project. Then put that project's URL and publishable key in `.env.local`.

1. `supabase/001_schema.sql` — tables, deed catalog, row access, `create_link`, and `accept_link`. This file was missing from the repo and is restored separately. Do not run it on the live project; those tables already exist. Parts that could not be read from the catalog are marked `INFERRED` in the file.
2. `supabase/002_journal_policy_and_miles.sql` — lets anyone add a journal entry, and keeps circle miles current.
3. `supabase/003_app_events.sql` — insert-only usage events. The app still works if this has not been applied. As of Oct 18, 2026 it has **not** been applied to production.

Journal entries cannot be saved until step 2. The app ignores a missing `app_events` table until step 3.

## Deploy

Import the repo in Vercel, set the three `NEXT_PUBLIC_*` variables, deploy, and attach `circleofdeeds.app`. Production already has this setup. Changing `main` deploys the live site.
