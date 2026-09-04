# Circle of Deeds

A Random Good Deeds Society project. Next.js 15 + Supabase.

- `app/` pages: `/` landing, `/start` pass a deed (code + QR), `/d` enter a code, `/d/[code]` receive, `/circle/[id]`, `/journal`, `/impact`
- `supabase/` SQL to run in the Supabase SQL editor (schema first, then 002)
- Environment: copy `.env.example` to `.env.local` (values are publishable, safe in the browser)

Deploy on Vercel: import this repo, add the three `NEXT_PUBLIC_*` environment variables, deploy, then add `circleofdeeds.app` as the domain.
