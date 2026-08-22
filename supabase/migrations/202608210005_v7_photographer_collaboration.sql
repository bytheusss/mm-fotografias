-- M&M Fotografias v7: colaboração segura e operação avançada de eventos.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('client','photographer','admin'));

create table if not exists public.event_photographers (
  event_id uuid not null references public.events(id) on delete cascade,
  photographer_id uuid not null references public.profiles(id) on delete cascade,
  can_upload boolean not null default true,
  can_manage_photos boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (event_id, photographer_id)
);
create index if not exists event_photographers_user_idx on public.event_photographers(photographer_id);
alter table public.event_photographers enable row level security;
drop policy if exists "photographers_see_assignments" on public.event_photographers;
create policy "photographers_see_assignments" on public.event_photographers for select using (auth.uid() = photographer_id);
revoke all on public.event_photographers from anon;
grant select on public.event_photographers to authenticated;

alter table public.events add column if not exists sales_paused boolean not null default false;
alter table public.events add column if not exists publish_at timestamptz;
alter table public.events add column if not exists unpublish_at timestamptz;
alter table public.events add column if not exists access_expires_at timestamptz;
alter table public.events add column if not exists password_version integer not null default 1;
