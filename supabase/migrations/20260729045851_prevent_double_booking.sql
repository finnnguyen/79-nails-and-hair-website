-- The real guarantee: no two active bookings for the same staff member at the
-- same date+time, regardless of any race condition in application code.
create unique index bookings_no_double_booking
  on bookings (staff_id, appointment_date, appointment_time)
  where status <> 'cancelled';

-- Narrow public view so the booking wizard can filter out already-taken slots
-- without exposing customer name/email/phone from the underlying table.
create view public.booked_slots as
  select staff_id, appointment_date, appointment_time
  from bookings
  where status <> 'cancelled';

grant select on public.booked_slots to anon, authenticated;
