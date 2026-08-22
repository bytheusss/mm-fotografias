-- M&M Fotografias v12: múltiplos cargos e fotos de perfil da equipe.
alter table public.profiles add column if not exists roles text[] not null default '{}';
update public.profiles set roles = array[role] where cardinality(roles) = 0;
alter table public.profiles add constraint profiles_roles_valid check (roles <@ array['owner','admin','support','photographer','client']::text[]);
create index if not exists profiles_roles_idx on public.profiles using gin(roles);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public reads profile photos" on storage.objects;
create policy "public reads profile photos" on storage.objects for select using (bucket_id = 'profile-photos');
