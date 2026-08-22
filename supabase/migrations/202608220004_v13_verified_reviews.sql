alter table public.orders add column if not exists review_token uuid not null default gen_random_uuid();
alter table public.orders add column if not exists review_requested_at timestamptz;
create unique index if not exists orders_review_token_unique on public.orders(review_token);

create table if not exists public.purchase_reviews(
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  target_type text not null check(target_type in ('studio','photographer')),
  photographer_id uuid references public.profiles(id) on delete cascade,
  customer_name text not null,
  rating integer not null check(rating between 1 and 5),
  comment text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  moderated_at timestamptz,
  moderated_by uuid references public.profiles(id),
  check((target_type='studio' and photographer_id is null) or (target_type='photographer' and photographer_id is not null))
);
create unique index if not exists purchase_reviews_order_studio_unique on public.purchase_reviews(order_id) where target_type='studio';
create unique index if not exists purchase_reviews_order_photographer_unique on public.purchase_reviews(order_id,photographer_id) where target_type='photographer';
create index if not exists purchase_reviews_public_idx on public.purchase_reviews(target_type,photographer_id,published,created_at desc);
alter table public.purchase_reviews enable row level security;
revoke all on public.purchase_reviews from anon,authenticated;
grant select on public.purchase_reviews to anon,authenticated;
drop policy if exists "published verified reviews" on public.purchase_reviews;
create policy "published verified reviews" on public.purchase_reviews for select using(published=true);
