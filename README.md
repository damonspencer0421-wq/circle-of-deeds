# Circle of Deeds

A Random Good Deeds Society project. Next.js 15 + Supabase.

- `app/` pages: `/` landing, `/start` pass a deed (code + QR), `/d` enter a code, `/d/[code]` receive, `/circle/[id]`, `/journal`, `/impact`
- `supabase/` database changes. Production already has the original schema; its missing `001` source file still needs to be recovered before a brand-new environment can be reproduced.
- Run `002_journal_policy_and_miles.sql`, then `003_app_events.sql`. Migration 003 adds insert-only, privacy-safe funnel events; the app continues working if it has not been applied yet.
- Environment: copy `.env.example` to `.env.local` (values are publishable, safe in the browser)

Deploy on Vercel: import this repo, add the three `NEXT_PUBLIC_*` environment variables, deploy, then add `circleofdeeds.app` as the domain.
