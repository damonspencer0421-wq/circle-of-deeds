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

`.env.example` points at the shared sandbox project `circle-of-deeds-sandbox` in us-east-2. Local development and tests must use that sandbox. The publishable key is safe in the browser, but a create, accept, or journal entry still writes to the project named in `.env.local`.

Production keys live only in Vercel. Do not copy them into `.env.local` or `.env.example`.

`NEXT_PUBLIC_SITE_URL` in the example is `http://localhost:3000`, so a code created locally opens on your machine. Vercel sets `https://circleofdeeds.app` for the live site.

## Fresh database

The shared sandbox already has migrations 001, 002, and 003 applied. Use it for local dev. Do not run these files there again, and do not run them on production.

Run these once, in order, only in the Supabase SQL editor of another **empty** project. Then put that project's URL and publishable key in `.env.local`.

1. `supabase/001_schema.sql` — tables, deed catalog, row access, `create_link`, and `accept_link`. This file was missing from the repo and is restored separately. Do not run it on the live project; those tables already exist. Parts that could not be read from the catalog are marked `INFERRED` in the file.
2. `supabase/002_journal_policy_and_miles.sql` — lets anyone add a journal entry, and keeps circle miles current.
3. `supabase/003_app_events.sql` — insert-only usage events. The app still works if this has not been applied. As of Oct 18, 2026 it has **not** been applied to production. It is applied on the sandbox.

Journal entries cannot be saved until step 2. The app ignores a missing `app_events` table until step 3.

## Deploy

Import the repo in Vercel, set the three `NEXT_PUBLIC_*` variables there to the production values, deploy, and attach `circleofdeeds.app`. Production already has this setup. Changing `main` deploys the live site. Do not put the sandbox key in Vercel.
