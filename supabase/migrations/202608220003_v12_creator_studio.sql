-- V12.1-12.3: estúdio público, metas, comissões e solicitações.
alter table public.profiles add column if not exists public_title text;
alter table public.profiles add column if not exists public_whatsapp text;
alter table public.profiles add column if not exists availability_text text;
alter table public.profiles add column if not exists team_display_order integer not null default 0;
alter table public.profiles add column if not exists monthly_goal numeric(12,2) not null default 0;
alter table public.profiles add column if not exists featured_photo_ids uuid[] not null default '{}';
alter table public.event_photographers add column if not exists commission_rate numeric(5,2) check (commission_rate between 0 and 100);

create table if not exists public.payout_requests(id uuid primary key default gen_random_uuid(),photographer_id uuid not null references public.profiles(id) on delete cascade,amount numeric(12,2) not null check(amount>0),pix_key text,notes text,status text not null default 'pending' check(status in('pending','approved','paid','rejected')),created_at timestamptz not null default now(),reviewed_at timestamptz,reviewed_by uuid references public.profiles(id));
create table if not exists public.photographer_testimonials(id uuid primary key default gen_random_uuid(),photographer_id uuid not null references public.profiles(id) on delete cascade,client_name text not null,content text not null,rating integer not null default 5 check(rating between 1 and 5),published boolean not null default false,created_at timestamptz not null default now());
create table if not exists public.team_notifications(id uuid primary key default gen_random_uuid(),user_id uuid references public.profiles(id) on delete cascade,title text not null,body text,href text,read_at timestamptz,created_at timestamptz not null default now());
alter table public.payout_requests enable row level security; alter table public.photographer_testimonials enable row level security; alter table public.team_notifications enable row level security;
revoke all on public.payout_requests,public.photographer_testimonials,public.team_notifications from anon,authenticated;
grant select,insert on public.payout_requests to authenticated; grant select on public.team_notifications to authenticated; grant select on public.photographer_testimonials to anon,authenticated;
create policy "own payout requests" on public.payout_requests for select to authenticated using(photographer_id=auth.uid());
create policy "create own payout requests" on public.payout_requests for insert to authenticated with check(photographer_id=auth.uid());
create policy "own notifications" on public.team_notifications for select to authenticated using(user_id=auth.uid());
create policy "published testimonials" on public.photographer_testimonials for select using(published=true);
