create or replace function bookings_set_time_range() returns trigger as $$
begin
  new.starts_at := (
    new.appointment_date::text || ' ' ||
    to_char(to_timestamp(new.appointment_time, 'HH12:MI AM'), 'HH24:MI')
  )::timestamp at time zone 'America/Los_Angeles';
  new.ends_at := new.starts_at + (new.duration_minutes || ' minutes')::interval;
  return new;
end;
$$ language plpgsql;

create trigger bookings_set_time_range_trigger
before insert or update of appointment_date, appointment_time, duration_minutes on bookings
for each row execute function bookings_set_time_range();
