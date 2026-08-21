-- M&M Fotografias v6: eventos, métricas, downloads e operação completa.
alter table public.events add column if not exists base_price numeric(10,2) not null default 15 check (base_price > 0);
alter table public.events add column if not exists access_mode text not null default 'public' check (access_mode in ('public','unlisted','password'));
alter table public.events add column if not exists access_password_hash text;
alter table public.orders add column if not exists admin_notes text;
alter table public.orders add column if not exists refund_status text not null default 'none' check (refund_status in ('none','requested','processing','refunded','rejected'));
alter table public.orders add column if not exists download_revoked_at timestamptz;

create table if not exists public.event_pricing_packages (
  id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events(id) on delete cascade,
  min_quantity integer not null check (min_quantity > 0), unit_price numeric(10,2) not null check (unit_price > 0),
  label text not null, active boolean not null default true, created_at timestamptz not null default now(), unique(event_id,min_quantity)
);
create table if not exists public.photo_interactions (
  id bigint generated always as identity primary key, photo_id uuid references public.photos(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade, kind text not null check (kind in ('view','favorite','cart')),
  session_key text, created_at timestamptz not null default now()
);
create table if not exists public.download_access_logs (
  id bigint generated always as identity primary key, order_id uuid not null references public.orders(id) on delete cascade,
  kind text not null check (kind in ('individual','zip')), photo_number text, ip_hash text, created_at timestamptz not null default now()
);
create index if not exists photo_interactions_event_kind_idx on public.photo_interactions(event_id,kind,created_at desc);
create index if not exists download_logs_order_idx on public.download_access_logs(order_id,created_at desc);
alter table public.event_pricing_packages enable row level security;
alter table public.photo_interactions enable row level security;
alter table public.download_access_logs enable row level security;
revoke all on public.event_pricing_packages, public.photo_interactions, public.download_access_logs from anon, authenticated;
