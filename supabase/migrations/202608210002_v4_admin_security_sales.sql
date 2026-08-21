-- M&M Fotografias v4: administração, segurança e divulgação. Idempotente.
-- Inclui os pré-requisitos comerciais para bancos em que v2/v3 ainda não foram executadas.
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(), code text not null unique,
  kind text not null check (kind in ('percent', 'fixed')),
  value numeric(10,2) not null check (value > 0), active boolean not null default true,
  expires_at timestamptz, max_uses integer, uses integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.pricing_packages (
  id uuid primary key default gen_random_uuid(), min_quantity integer not null unique check (min_quantity > 0),
  unit_price numeric(10,2) not null check (unit_price > 0), label text not null,
  active boolean not null default true, created_at timestamptz not null default now()
);
insert into public.pricing_packages (min_quantity, unit_price, label)
values (1, 15, 'Preço padrão'), (5, 12, 'Pacote 5+ fotos'), (10, 10, 'Pacote 10+ fotos')
on conflict (min_quantity) do nothing;
create table if not exists public.abandoned_carts (
  id uuid primary key default gen_random_uuid(), email text not null, name text, whatsapp text,
  photos jsonb not null default '[]'::jsonb, quantity integer not null default 0,
  estimated_total numeric(10,2) not null default 0,
  status text not null default 'open' check (status in ('open', 'recovered', 'dismissed')),
  recovery_sent_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists discount_amount numeric(10,2) not null default 0;
alter table public.events add column if not exists archived boolean not null default false;
alter table public.photos add column if not exists plate_text text;
create index if not exists abandoned_carts_email_status_idx on public.abandoned_carts (lower(email), status);
alter table public.coupons enable row level security;
alter table public.pricing_packages enable row level security;
alter table public.abandoned_carts enable row level security;
revoke all on public.coupons, public.pricing_packages, public.abandoned_carts from anon, authenticated;

create table if not exists public.admin_audit_logs (
  id bigint generated always as identity primary key,
  admin_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.promotion_settings (
  id boolean primary key default true check (id),
  active boolean not null default false,
  message text not null default '',
  link_url text,
  link_label text,
  updated_at timestamptz not null default now()
);
insert into public.promotion_settings (id) values (true) on conflict (id) do nothing;

alter table public.events add column if not exists view_count bigint not null default 0;
alter table public.photos add column if not exists view_count bigint not null default 0;
alter table public.coupons add column if not exists event_id uuid references public.events(id) on delete set null;
create unique index if not exists photos_event_number_unique on public.photos(event_id, number);
create index if not exists audit_logs_created_at_idx on public.admin_audit_logs(created_at desc);
create index if not exists coupons_event_id_idx on public.coupons(event_id);

alter table public.admin_audit_logs enable row level security;
alter table public.promotion_settings enable row level security;
revoke all on public.admin_audit_logs, public.promotion_settings from anon, authenticated;

create or replace function public.increment_event_view(target_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.events set view_count = view_count + 1 where id = target_id;
$$;
create or replace function public.increment_photo_view(target_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.photos set view_count = view_count + 1 where id = target_id;
$$;
revoke all on function public.increment_event_view(uuid), public.increment_photo_view(uuid) from public, anon, authenticated;
grant execute on function public.increment_event_view(uuid), public.increment_photo_view(uuid) to service_role;
