-- M&M Fotografias v11: perfis profissionais, repasses e rastreabilidade de downloads.
create table if not exists public.photographer_payouts (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references public.profiles(id) on delete cascade,
  period_start date,
  period_end date,
  gross_amount numeric(12,2) not null default 0 check (gross_amount >= 0),
  commission_amount numeric(12,2) not null default 0 check (commission_amount >= 0),
  status text not null default 'pending' check (status in ('pending','paid','cancelled')),
  receipt_url text,
  notes text,
  paid_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders add column if not exists download_limit integer;
alter table public.orders add column if not exists download_count integer not null default 0;
alter table public.orders add column if not exists download_expires_at timestamptz;

create table if not exists public.client_error_logs (
  id bigint generated always as identity primary key,
  message text not null,
  path text,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.client_error_logs enable row level security;
revoke all on public.client_error_logs from anon, authenticated;
create index if not exists client_error_logs_created_idx on public.client_error_logs(created_at desc);

create index if not exists photographer_payouts_owner_idx on public.photographer_payouts(photographer_id, created_at desc);
alter table public.photographer_payouts enable row level security;
revoke all on public.photographer_payouts from anon;
revoke all on public.photographer_payouts from authenticated;
grant select on public.photographer_payouts to authenticated;

drop policy if exists "photographers read own payouts" on public.photographer_payouts;
create policy "photographers read own payouts" on public.photographer_payouts for select to authenticated
using (photographer_id = auth.uid() or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','admin')
));

create or replace function public.touch_v11_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists photographer_payouts_touch on public.photographer_payouts;
create trigger photographer_payouts_touch before update on public.photographer_payouts
for each row execute function public.touch_v11_updated_at();
