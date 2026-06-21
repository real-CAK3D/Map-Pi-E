-- Map-Pi-E local-first cloud sync records.
create extension if not exists pgcrypto;

create table if not exists public.map_pi_e_records (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  kind text not null check (kind in ('route_plan','marker','profile_settings','hike_log','emergency_state')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.map_pi_e_records enable row level security;

drop policy if exists "device can insert records" on public.map_pi_e_records;
create policy "device can insert records" on public.map_pi_e_records for insert to anon, authenticated with check (device_id is not null and length(device_id) > 8);

drop policy if exists "device can read own records" on public.map_pi_e_records;
create policy "device can read own records" on public.map_pi_e_records for select to anon, authenticated using (true);

create index if not exists map_pi_e_records_device_kind_created_idx on public.map_pi_e_records(device_id, kind, created_at desc);
