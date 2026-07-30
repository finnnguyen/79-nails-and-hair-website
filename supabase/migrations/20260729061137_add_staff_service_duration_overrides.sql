create table staff_service_durations (
  id uuid primary key default gen_random_uuid(),
  staff_id text not null references staff(id) on delete cascade,
  service_id text not null references services(id) on delete cascade,
  duration_minutes int not null check (duration_minutes > 0),
  unique (staff_id, service_id)
);

create index staff_service_durations_staff_id_idx on staff_service_durations (staff_id);
create index staff_service_durations_service_id_idx on staff_service_durations (service_id);

alter table staff_service_durations enable row level security;
create policy "Public read staff_service_durations" on staff_service_durations for select using (true);
