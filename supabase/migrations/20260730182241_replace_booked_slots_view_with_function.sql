-- Replace the SECURITY DEFINER view (flagged by the linter as a blanket
-- RLS-bypass surface) with a narrow SECURITY DEFINER function: fixed
-- search_path, parameterized by staff so it returns only what the booking
-- wizard needs, and EXECUTE locked down to anon/authenticated only.

drop view if exists public.booked_slots;

create function public.get_booked_slots(p_staff_id text)
returns table (
  starts_at timestamptz,
  ends_at timestamptz
)
language sql
security definer
set search_path = ''
stable
as $$
  select starts_at, ends_at
  from public.bookings
  where status <> 'cancelled'
    and staff_id = p_staff_id;
$$;

revoke all on function public.get_booked_slots(text) from public;
grant execute on function public.get_booked_slots(text) to anon, authenticated;
