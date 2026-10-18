# Circle of Deeds handoff

Updated Oct 18, 2026. This is the current state of the repo and the live site. It is not a feature spec.

The live site is https://circleofdeeds.app. The repo is `damonspencer0421-wq/circle-of-deeds`. Merging to `main` deploys on Vercel. Supabase holds the data. Only the publishable key is in the app.

## What has shipped

Three commits are on `main`.

| When | Commit | What changed |
|---|---|---|
| Sept 3, 2026, 9:12 PM CT | `fb325e8` Circle of Deeds: Phase 1 web app | First Next.js app: home, give, enter a code, receive, circle, journal, impact. Database changes lived in `supabase/002_journal_policy_and_miles.sql`. The original schema file was never committed. |
| Sept 5, 2026, 8:05 PM CT | `bbe2cde` Handoff clarity | After a code is created, the page polls every 4 seconds and flips to "Accepted!" when the other person accepts. The main button is "Text them the link". The receive page asked for a coarse area immediately. |
| Oct 14, 2026, 8:52 PM CT | `524c1b2` Upgrade continuation flow and friendly v2 experience | The update below. It is on `main`, and the live site is serving it. It was not written down in the project notes. |

### Oct 14 update (live)

Confirmed by reading that commit and by loading the live site on Oct 18.

- Friendlier copy on the homepage, the give page, the receive page, and impact. The homepage headline is "Kindness has legs."
- After someone accepts, the same browser shows a countdown plus a **Pick an easy win** card (`components/ContinuationCard.js`). The three ideas are hold the door, help with bags, and cover a coffee. The choice is stored in that browser only.
- **Add a calendar nudge** downloads an `.ics` reminder. No email is collected for it.
- Coming back to the same code on the same device restores the countdown and the card. A different device is told the code was already accepted.
- City capture is optional and closed until the person opens it. The Sept 5 automatic location prompt was removed in this commit.
- `lib/analytics.js` records steps such as `link_created`, `deed_accepted`, `continuation_plan_selected`, and `reminder_downloaded`. Writes go to `app_events` and fail quietly if that table is missing.
- `supabase/003_app_events.sql` was added for that table. **It has not been applied to production.** On Oct 18 the live API returned "Could not find the table 'public.app_events'". The deed flow still works. Events are not being stored.
- `pnpm-lock.yaml` was added in this commit.

The post-accept card was reviewed from the code. It was not clicked through on production, because accepting a code would write live data.

## Live data, read on Oct 18

These are public counters and shape checks, not a full activity report.

- `public_stats` still reads 0 circles alive this week, 2 cities, 1 state, longest circle 1. The view also has `miles_total`, which the homepage does not show. It was 0.
- The publishable key can read `deed_types`, `circles`, `links` (including guest ids), `guests`, and `public_stats`. It cannot read journal rows, founding emails, or reports back.
- `create_link` and `accept_link` are the two database functions the app calls. A new code lasts 24 hours. Accepting it moves that same deadline forward 24 hours from the acceptance. The app calls the new deadline `pass_by`. There is no `pass_by` column.
- A journal deed cannot be turned into a code (`deed type not chainable`). A continuation requires the parent code to be accepted (`parent link not accepted`). The database does **not** reject a continuation just because the 24-hour window has already closed, and it does not require the new code's creator to be the person who accepted the parent. The browser only offers "pass it on" while its saved deadline is still open.
- Whether someone can accept their own code is still unknown. Every unused live code is already expired, and the expiry error is returned before any later check would run.

## Database files

| File | Production |
|---|---|
| `supabase/001_schema.sql` | Already applied, but the file was missing from the repo. Restored so a new project can be built. Do not run it on the live database. Anything marked `INFERRED` in that file still needs a look in the Supabase SQL editor (`pg_get_functiondef`, and the table definitions). |
| `supabase/002_journal_policy_and_miles.sql` | Applied. Journal insert works, and circle miles recompute when a link is accepted. |
| `supabase/003_app_events.sql` | **Not applied.** Safe to run once in the SQL editor when you want usage events. It does not change the deed flow. |

The shared sandbox `circle-of-deeds-sandbox` in us-east-2 already has all three files applied. Local development uses that project. Do not re-run the files there, and do not run them on production.

Setup commands for a laptop and for an empty database are in the [README](../README.md).

## Needs a decision or a login

- Confirm `001_schema.sql` against the live function source before anyone uses it to rebuild production. The publishable key cannot read function bodies.
- Run `003_app_events.sql` on production if usage tracking should start there. That is still an owner step. The sandbox already has this table.
- One empty journal row was inserted on Oct 18 while checking that journal writes are private. It has no guest, no deed, and no note, and it cannot be deleted with the publishable key. Remove it in the SQL editor if you want the table clean:

```sql
delete from journal_entries
where guest_id is null
  and deed_type_id is null
  and note is null
  and created_at >= '2026-10-18'
  and created_at < '2026-10-19';
```

- `.env.example` points local development and tests at the shared sandbox `circle-of-deeds-sandbox` in us-east-2 (`https://wdvrtfbobcdjoayxipmn.supabase.co`). Migrations 001, 002, and 003 are already applied there. Production keys live only in Vercel. Do not copy them into `.env.local`.
- Phone-size findings are in [mobile-audit-2026-10-18.md](mobile-audit-2026-10-18.md). The highest one: at phone width the header hides Impact, Journal, and Got a code, and nothing replaces them.
