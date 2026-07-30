drop view booked_slots;

create view public.booked_slots as
  select staff_id, appointment_date, appointment_time, starts_at, ends_at
  from bookings
  where status <> 'cancelled';

grant select on public.booked_slots to anon, authenticated;
