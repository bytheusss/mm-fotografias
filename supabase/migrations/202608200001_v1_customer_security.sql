-- M&M Fotografias v1.0: execute no SQL Editor do Supabase após revisar.
-- Não remove nem migra arquivos/dados. O vínculo retroativo só preenche user_id nulo.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  role text not null default 'client',
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.orders add column if not exists paid_email_sent_at timestamptz;
create index if not exists orders_user_id_idx on public.orders(user_id);
create unique index if not exists orders_download_token_unique on public.orders(download_token) where download_token is not null;
update public.orders set download_token = gen_random_uuid()::text where status = 'paid' and download_token is null;

insert into public.profiles (id, email, full_name, phone)
select id, email, coalesce(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name'), coalesce(raw_user_meta_data->>'whatsapp', raw_user_meta_data->>'phone') from auth.users
on conflict (id) do nothing;

-- Associa compras antigas somente quando há correspondência inequívoca por e-mail.
update public.orders o set user_id = u.id
from auth.users u
where o.user_id is null and lower(o.email) = lower(u.email);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'), coalesce(new.raw_user_meta_data->>'whatsapp', new.raw_user_meta_data->>'phone'))
  on conflict (id) do nothing;
  update public.orders set user_id = new.id where user_id is null and lower(email) = lower(new.email);
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id and role = 'client');
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id);

revoke update on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- Originais deixam de ser públicos. Downloads continuam pelo servidor/service role.
update storage.buckets set public = false where id = 'originals';
drop policy if exists "public originals read" on storage.objects;
drop policy if exists "Public Access originals" on storage.objects;
