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

Row Level Security is on for every table:
- `services`, `staff`, `staff_specialties`: public read
- `bookings`, `booking_services`: public **insert only** (booking wizard) — no public read, since bookings hold customer name/email/phone
- `reviews`: public read where `approved = true`, public insert (starts unapproved)
- Signed-in staff (`authenticated` role): full read on bookings/booking_services/reviews, plus update on bookings (status) and update/delete on reviews (moderation)

Schema changes should go through Supabase migrations (via the Supabase MCP tools or dashboard SQL editor), not ad-hoc edits — keeps `lib/supabase/database.types.ts` regeneratable and in sync.

## Staff Admin Area

- `/admin/login` — staff sign-in (Supabase Auth)
- `/admin/bookings` — all bookings with an inline status dropdown (pending/confirmed/completed/cancelled)
- `/admin/reviews` — moderation queue: approve/unapprove or delete submitted reviews

**Creating a staff login:** there's no self-serve sign-up. In the [Supabase dashboard → Authentication → Users](https://supabase.com/dashboard/project/chzoisvirymqgtsbnheu/auth/users), click **Add user → Create new user**, set an email/password, and toggle **Auto Confirm User** on.

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
