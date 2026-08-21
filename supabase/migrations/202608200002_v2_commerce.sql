-- Recursos comerciais v2. Idempotente e sem remoção de dados.
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  kind text not null check (kind in ('percent', 'fixed')),
  value numeric(10,2) not null check (value > 0),
  active boolean not null default true,
  expires_at timestamptz,
  max_uses integer,
  uses integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists discount_amount numeric(10,2) not null default 0;
alter table public.events add column if not exists archived boolean not null default false;
alter table public.photos add column if not exists plate_text text;

alter table public.coupons enable row level security;
revoke all on public.coupons from anon, authenticated;
create index if not exists photos_plate_text_idx on public.photos using gin (to_tsvector('simple', coalesce(plate_text,'')));
