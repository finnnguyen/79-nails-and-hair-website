# 79 Nails & Hair

[![CI](https://github.com/finnnguyen/79-nails-and-hair-website/workflows/CI/badge.svg)](https://github.com/finnnguyen/79-nails-and-hair-website/actions/workflows/ci.yml)

**Live:** [79nailsandhair.vercel.app](https://79nailsandhair.vercel.app)

A production booking platform for a real nail & hair salon — service/staff browsing, a booking wizard with real-time availability, customer reviews, and a staff-facing admin console for managing bookings, moderating reviews, and running the daily walk-in queue and stylist rotation.

Built on Next.js 16 (App Router, Server Actions) and Supabase (Postgres, Row Level Security, Auth), deployed on Vercel.

## Engineering Highlights

The parts of this project built the way a real production system needs to work, not just the way that ships fastest:

- **Correctness enforced in the database, not the app.** No-double-booking is a Postgres `EXCLUDE` constraint on a time-range column (`bookings_no_overlap`), not an application-level check — a race condition cannot double-book a stylist, regardless of what the request-handling code does.
- **Row Level Security as the actual authorization model.** Every table's access rules live in Postgres policies (public read/insert where appropriate, `authenticated`-only elsewhere) — not scattered `if` checks in route handlers that are easy to miss on the next endpoint.
- **Schema as code.** All 18 migrations are tracked in `supabase/migrations/` and applied through the Supabase CLI. The schema is reproducible from the repo alone, not reconstructed from memory of what changed when.
- **Input validated at the actual trust boundary.** Server Actions are public HTTP endpoints regardless of what the client UI allows — every one validates its input with Zod before it reaches the database.
- **CI on every push** — lint, typecheck, unit tests, and a full production build gate `main` (badge above is live, not decorative).
- **Rate limiting on public write endpoints** (bookings, reviews), backed by a `SECURITY DEFINER` Postgres function rather than pulling in an external service the project doesn't need at this scale.
- **Real error tracking in production**, not `console.log` — Sentry wired through `error.tsx` / `global-error.tsx` / `instrumentation.ts`, verified end-to-end against a live deployment (forced a real error, confirmed it landed in Sentry) before calling it done.
- **Tests that were mutation-checked, not just written.** The turn-rotation credit math and the booking-overlap filter each had their core logic broken on purpose to confirm the suite actually fails when it should, then reverted.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 — App Router, Server Actions, Turbopack |
| Database | Supabase — Postgres, Row Level Security, Auth |
| Validation | Zod |
| Styling | Tailwind CSS |
| Testing | Vitest |
| Error tracking | Sentry (native Vercel Marketplace integration) |
| Email | Resend |
| CI/CD | GitHub Actions + Vercel |

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

## Testing

```bash
npm run test
```

Pure-logic unit tests (Vitest — no jsdom or React Testing Library, since nothing here renders a component) covering the two places business logic was genuinely easy to get subtly wrong:

- `lib/booking-availability.test.ts` — slot generation (closed Mondays, Sunday vs. weekday close times, duration-aware last-start-time) and the overlap filter that removes already-booked slots from what's shown as available.
- `lib/rotation-math.test.ts` — turn-credit accumulation and the reset threshold for by-request visits.

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
- `lib/booking-availability.ts`, `lib/rotation-math.ts` — pure business logic, unit tested in isolation from the Supabase/React code around them.

Note: this Next.js version renames `middleware.ts` to `proxy.ts` and has a few other conventions that differ from older docs/training data — check `node_modules/next/dist/docs/` before assuming an API.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

## Deploy on Vercel

The easiest way to deploy is the [Vercel Platform](https://vercel.com/new). Remember to set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as environment variables in the Vercel project settings — `.env.local` isn't deployed.
