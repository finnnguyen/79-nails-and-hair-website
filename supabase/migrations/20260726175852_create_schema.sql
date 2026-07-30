create type service_category as enum ('Nail Services', 'Hair Services', 'Facial Services');
create type staff_role as enum ('Nail Tech', 'Hair Stylist', 'Hair Stylist & Nail Tech');
create type booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

create table services (
  id text primary key,
  name text not null,
  category service_category not null,
  price numeric(10,2) not null,
  starting_at boolean not null default false,
  note text,
  addon boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table staff (
  id text primary key,
  name text not null,
  role staff_role not null,
  categories service_category[] not null default '{}',
  photo_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table staff_specialties (
  id uuid primary key default gen_random_uuid(),
  staff_id text not null references staff(id) on delete cascade,
  label text not null,
  service_id text references services(id) on delete set null,
  category service_category,
  sort_order int not null default 0
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text,
  customer_phone text,
  staff_id text references staff(id) on delete set null,
  appointment_date date not null,
  appointment_time text not null,
  status booking_status not null default 'pending',
  total_price numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  constraint bookings_contact_check check (customer_email is not null or customer_phone is not null)
);

create table booking_services (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  service_id text references services(id) on delete set null,
  service_name text not null,
  price numeric(10,2) not null
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  staff_id text references staff(id) on delete set null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index staff_specialties_staff_id_idx on staff_specialties (staff_id);
create index booking_services_booking_id_idx on booking_services (booking_id);
create index bookings_appointment_date_idx on bookings (appointment_date);
create index reviews_approved_idx on reviews (approved);

alter table services enable row level security;
alter table staff enable row level security;
alter table staff_specialties enable row level security;
alter table bookings enable row level security;
alter table booking_services enable row level security;
alter table reviews enable row level security;

create policy "Public read services" on services for select using (true);
create policy "Public read staff" on staff for select using (true);
create policy "Public read staff_specialties" on staff_specialties for select using (true);
create policy "Public read approved reviews" on reviews for select using (approved = true);
create policy "Anyone can submit a review" on reviews for insert with check (true);
create policy "Anyone can create a booking" on bookings for insert with check (true);
create policy "Anyone can add booking services" on booking_services for insert with check (true);
