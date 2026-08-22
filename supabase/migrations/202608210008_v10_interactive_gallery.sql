-- M&M Fotografias v10: perfis públicos e organização interativa da galeria.
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists instagram_handle text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists public_profile boolean not null default false;
alter table public.photos add column if not exists category text not null default 'Geral';
alter table public.photos add column if not exists captured_at timestamptz;
create index if not exists photos_event_category_idx on public.photos(event_id, category) where deleted_at is null;
