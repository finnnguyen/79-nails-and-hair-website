create type walk_in_status as enum ('waiting', 'in_progress', 'completed', 'cancelled');

create table walk_ins (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  staff_id text references staff(id) on delete set null,
  status walk_in_status not null default 'waiting',
  requested_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  duration_minutes int not null,
  total_price numeric not null default 0,
  is_request boolean not null default false
);

create table walk_in_services (
  id uuid primary key default gen_random_uuid(),
  walk_in_id uuid not null references walk_ins(id) on delete cascade,
  service_id text references services(id) on delete set null,
  service_name text not null,
  price numeric not null
);

create index walk_ins_status_idx on walk_ins (status);
create index walk_ins_staff_id_idx on walk_ins (staff_id);
create index walk_in_services_walk_in_id_idx on walk_in_services (walk_in_id);

alter table walk_ins enable row level security;
alter table walk_in_services enable row level security;

create policy "Authenticated staff full access to walk_ins" on walk_ins for all to authenticated using (true) with check (true);
create policy "Authenticated staff full access to walk_in_services" on walk_in_services for all to authenticated using (true) with check (true);
