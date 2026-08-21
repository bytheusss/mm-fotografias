-- M&M Fotografias v3.1/v3.2. Idempotente e sem remoção de dados.
create table if not exists public.pricing_packages (
  id uuid primary key default gen_random_uuid(),
  min_quantity integer not null unique check (min_quantity > 0),
  unit_price numeric(10,2) not null check (unit_price > 0),
  label text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.pricing_packages (min_quantity, unit_price, label)
values (1, 15, 'Preço padrão'), (5, 12, 'Pacote 5+ fotos'), (10, 10, 'Pacote 10+ fotos')
on conflict (min_quantity) do nothing;

create table if not exists public.abandoned_carts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  whatsapp text,
  photos jsonb not null default '[]'::jsonb,
  quantity integer not null default 0,
  estimated_total numeric(10,2) not null default 0,
  status text not null default 'open' check (status in ('open', 'recovered', 'dismissed')),
  recovery_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists abandoned_carts_email_status_idx on public.abandoned_carts (lower(email), status);
alter table public.pricing_packages enable row level security;
alter table public.abandoned_carts enable row level security;
revoke all on public.pricing_packages, public.abandoned_carts from anon, authenticated;
