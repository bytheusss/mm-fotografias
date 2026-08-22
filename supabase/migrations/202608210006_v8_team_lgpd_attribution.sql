-- M&M Fotografias v8: equipe, autoria, lixeira e solicitações LGPD.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('client','photographer','support','admin','owner'));
alter table public.profiles add column if not exists commission_rate numeric(5,2) not null default 0 check (commission_rate between 0 and 100);
update public.profiles set role = 'owner' where lower(email) = 'eigenheermatheus@gmail.com';
alter table public.photos add column if not exists photographer_id uuid references public.profiles(id) on delete set null;
alter table public.photos add column if not exists deleted_at timestamptz;
alter table public.photos add column if not exists deleted_by uuid references public.profiles(id) on delete set null;
create index if not exists photos_photographer_idx on public.photos(photographer_id) where deleted_at is null;
create table if not exists public.data_subject_requests (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  request_type text not null check (request_type in ('access','correction','deletion','portability','consent')),
  details text, status text not null default 'open' check (status in ('open','reviewing','completed','rejected')),
  response_notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.data_subject_requests enable row level security;
drop policy if exists "data_requests_own_select" on public.data_subject_requests;
create policy "data_requests_own_select" on public.data_subject_requests for select using (auth.uid() = user_id);
drop policy if exists "data_requests_own_insert" on public.data_subject_requests;
create policy "data_requests_own_insert" on public.data_subject_requests for insert with check (auth.uid() = user_id);
grant select, insert on public.data_subject_requests to authenticated;
