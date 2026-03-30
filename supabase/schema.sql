create extension if not exists pgcrypto;

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  reference_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  case_type text not null,
  status text not null default 'مفتوحة',
  opening_date date not null,
  court text,
  case_number text,
  total_fees numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  amount numeric not null,
  payment_date date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists case_files (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_url text,
  mime_type text,
  file_size bigint,
  uploaded_at timestamptz not null default now()
);

create table if not exists case_notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists qr_share_links (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null unique references cases(id) on delete cascade,
  token text not null unique,
  is_active boolean not null default true,
  allow_download boolean not null default false,
  show_client_name boolean not null default true,
  show_case_title boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  action_type text not null,
  description text not null,
  created_at timestamptz not null default now()
);

alter table clients enable row level security;
alter table cases enable row level security;
alter table payments enable row level security;
alter table case_files enable row level security;
alter table case_notes enable row level security;
alter table qr_share_links enable row level security;
alter table activity_logs enable row level security;

create policy "open clients" on clients for all using (true) with check (true);
create policy "open cases" on cases for all using (true) with check (true);
create policy "open payments" on payments for all using (true) with check (true);
create policy "open files" on case_files for all using (true) with check (true);
create policy "open notes" on case_notes for all using (true) with check (true);
create policy "open qr" on qr_share_links for all using (true) with check (true);
create policy "open activity" on activity_logs for all using (true) with check (true);

insert into clients (full_name, phone, email) values ('أحمد علي', '01000000000', 'ahmed@example.com') on conflict do nothing;
