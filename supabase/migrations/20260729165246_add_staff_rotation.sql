create table staff_rotation (
  staff_id text primary key references staff(id) on delete cascade,
  turn_credit numeric not null default 0 check (turn_credit >= 0),
  last_turn_at timestamptz not null default now(),
  present boolean not null default true,
  rotation_date date not null default current_date
);

insert into staff_rotation (staff_id) select id from staff;

alter table staff_rotation enable row level security;
create policy "Authenticated staff can read rotation" on staff_rotation for select to authenticated using (true);
create policy "Authenticated staff can update rotation" on staff_rotation for update to authenticated using (true) with check (true);
