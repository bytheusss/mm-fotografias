-- Portfólio autoral independente dos álbuns comerciais.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('portfolio-assets','portfolio-assets',true,12582912,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=true,file_size_limit=12582912,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
create table if not exists public.photographer_portfolio_assets(
 id uuid primary key default gen_random_uuid(), photographer_id uuid not null references public.profiles(id) on delete cascade,
 storage_path text not null unique, title text, description text, category text not null default 'Outros',
 sort_order integer not null default 0, published boolean not null default true,
 width integer, height integer, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists portfolio_photographer_order_idx on public.photographer_portfolio_assets(photographer_id,published,sort_order,created_at desc);
alter table public.photographer_portfolio_assets enable row level security;
revoke all on public.photographer_portfolio_assets from anon,authenticated;
grant select on public.photographer_portfolio_assets to anon,authenticated;
create policy "published portfolio is public" on public.photographer_portfolio_assets for select using(published=true or photographer_id=auth.uid());
