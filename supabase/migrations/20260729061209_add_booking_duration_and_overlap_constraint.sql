create extension if not exists btree_gist;

alter table bookings add column duration_minutes int;
alter table bookings add column starts_at timestamptz;
alter table bookings add column ends_at timestamptz;

-- Backfill the handful of existing rows (all stale/cancelled test data) with
-- a reasonable default so the NOT NULL constraints below can be applied.
update bookings
set duration_minutes = 30,
    starts_at = to_timestamp(appointment_date::text || ' ' || appointment_time, 'YYYY-MM-DD HH12:MI AM'),
    ends_at = to_timestamp(appointment_date::text || ' ' || appointment_time, 'YYYY-MM-DD HH12:MI AM') + interval '30 minutes'
where duration_minutes is null;

alter table bookings alter column duration_minutes set not null;
alter table bookings alter column starts_at set not null;
alter table bookings alter column ends_at set not null;

drop index bookings_no_double_booking;

alter table bookings add constraint bookings_no_overlap
  exclude using gist (
    staff_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status <> 'cancelled');
