# Circle of Deeds

A Random Good Deeds Society project. Next.js 15 + Supabase.

- `app/` pages: `/` landing, `/start` pass a deed (code + QR), `/d` enter a code, `/d/[code]` receive, `/circle/[id]`, `/journal`, `/impact`
- `supabase/` database changes. Production already has the original schema; its missing `001` source file still needs to be recovered before a brand-new environment can be reproduced.
- Run `002_journal_policy_and_miles.sql`, then `003_app_events.sql` only on an empty project. Migration 003 adds insert-only, privacy-safe funnel events; the app continues working if it has not been applied yet. Do not run these against production.

## Local development

Copy `.env.example` to `.env.local`, then run `pnpm dev`.

`.env.example` points at the shared sandbox project `circle-of-deeds-sandbox` in us-east-2 (`https://wdvrtfbobcdjoayxipmn.supabase.co`). Local development and tests must use that sandbox. Migrations 001, 002, and 003 are already applied there.

Production keys live only in Vercel. Do not copy them into `.env.local`, `.env.example`, or a test. Creating or accepting a code writes to whichever project the env file names.

`NEXT_PUBLIC_SITE_URL` in the example is `http://localhost:3000`, so a code created locally opens on your machine. Vercel sets `https://circleofdeeds.app` for the live site.

## Deploy

Import the repo in Vercel, set the three `NEXT_PUBLIC_*` variables there (the production values, not the sandbox), deploy, and attach `circleofdeeds.app`. Changing `main` deploys the live site.
