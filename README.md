# 79 Nails & Hair

Website and online booking for 79 Nails & Hair Salon — service/staff browsing, appointment booking, and customer reviews, backed by Supabase. Built on Next.js 16 (App Router). Note: this Next.js version renames `middleware.ts` to `proxy.ts` and a few other conventions — check `node_modules/next/dist/docs/` before assuming APIs from older versions.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local` (already gitignored) with:

```
NEXT_PUBLIC_SUPABASE_URL=https://chzoisvirymqgtsbnheu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>
```

Get the publishable key from the [Supabase dashboard → Project Settings → API](https://supabase.com/dashboard/project/chzoisvirymqgtsbnheu/settings/api).

**For CI**: the same two `NEXT_PUBLIC_SUPABASE_*` values must also be added as repo secrets (Settings → Secrets and variables → Actions) — several pages are statically prerendered and fetch from Supabase at build time, so `npm run build` fails in CI without real values.

## Database (Supabase)

Project: **finnnguyen's 79NailsandHair Project** ([dashboard](https://supabase.com/dashboard/project/chzoisvirymqgtsbnheu)).

| Table | Purpose |
|---|---|
| `services` | Salon service catalog (nail/hair/facial), prices, add-ons |
| `staff` | Staff members, the service categories they cover |
| `staff_specialties` | Per-staff specialty labels shown on the Staff page |
| `bookings` | Customer appointment requests from the booking wizard |
| `booking_services` | Line items (one or more services) per booking |
| `reviews` | Customer feedback — service rating/comment + separate website-experience rating/comment |
| `staff_rotation` | Current-day staff presence, queue order, and partial-turn credit |
| `walk_ins` | Walk-in queue, assignment, timing, and completion records |
| `walk_in_services` | Service and charged-price line items for each walk-in |

Row Level Security is on for every table:
- `services`, `staff`, `staff_specialties`: public read
- `bookings`, `booking_services`: public **insert only** (booking wizard) — no public read, since bookings hold customer name/email/phone
- `reviews`: public read where `approved = true`, public insert (starts unapproved)
- Signed-in staff (`authenticated` role): full read on bookings/booking_services/reviews, plus update on bookings (status) and update/delete on reviews (moderation)

**Migrations are version-controlled** in `supabase/migrations/` — that's the source of truth for the schema, not the live database. To make a schema change:

```bash
supabase login                                      # one-time, opens a browser
supabase link --project-ref chzoisvirymqgtsbnheu    # one-time per machine

supabase migration new some_change_name              # creates a blank migrations/<ts>_some_change_name.sql
# edit the generated file, then:
supabase db push                                     # applies it to the remote project
```

After any schema change, regenerate types so `lib/supabase/database.types.ts` stays in sync:

```bash
supabase gen types typescript --linked > lib/supabase/database.types.ts
```

Don't apply schema changes ad-hoc (dashboard SQL editor, one-off MCP calls) — anything not captured as a migration file here is invisible to anyone rebuilding this project from the repo.

## Staff Admin Area

- `/admin/login` — staff sign-in (Supabase Auth)
- `/admin/bookings` — all bookings with an inline status dropdown (pending/confirmed/completed/cancelled)
- `/admin/reviews` — moderation queue: approve/unapprove or delete submitted reviews
- `/admin/turns` — live walk-in check-in, staff rotation, daily earnings, and turn corrections

**Creating a staff login:** there's no self-serve sign-up. In the [Supabase dashboard → Authentication → Users](https://supabase.com/dashboard/project/chzoisvirymqgtsbnheu/auth/users), click **Add user → Create new user**, set an email/password, and toggle **Auto Confirm User** on.

## Error Tracking (Sentry)

Installed via the Vercel Marketplace, connected to the `79nailsandhair` project (Preview + Production only, not local dev). `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` are provisioned automatically as Vercel env vars — nothing to configure locally, and no DSN means the SDK just no-ops in local dev.

`app/error.tsx` and `app/global-error.tsx` report client/render errors via `Sentry.captureException`; `instrumentation.ts` reports server errors via `onRequestError`. Dashboard: [79-nails-and-hair.sentry.io](https://79-nails-and-hair.sentry.io) (sign in with the same GitHub account as this repo — see Vercel's integration page if login ever needs re-linking).

## Project Structure

- `app/` — routes (App Router). `app/admin/(protected)/` is gated by `proxy.ts` + a per-layout auth check.
- `components/` — UI components (booking wizard, service/staff browsers, review form, admin controls).
- `lib/*-data.ts` — server-side data fetchers (`getServices`, `getStaff`, `getApprovedReviews`), query Supabase directly.
- `lib/actions/` — Server Actions for mutations (booking submission, review submission, admin status/approval updates, auth).
- `lib/supabase/` — Supabase clients (`client.ts` for anon reads/public inserts, `server.ts` for session-aware Server Components/Actions, `middleware.ts` for the proxy session refresh) and generated `database.types.ts`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

## Deploy on Vercel

The easiest way to deploy is the [Vercel Platform](https://vercel.com/new). Remember to set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as environment variables in the Vercel project settings — `.env.local` isn't deployed.
