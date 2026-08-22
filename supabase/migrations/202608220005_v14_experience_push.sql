alter table public.purchase_reviews add column if not exists response_text text;
alter table public.purchase_reviews add column if not exists response_at timestamptz;
alter table public.purchase_reviews add column if not exists response_by uuid references public.profiles(id);
alter table public.purchase_reviews add column if not exists featured boolean not null default false;

create table if not exists public.push_subscriptions(
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique, p256dh text not null, auth text not null, user_agent text,
  created_at timestamptz not null default now(), last_used_at timestamptz
);
create table if not exists public.client_notifications(
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null, body text, href text, read_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.event_follows(
  event_id uuid not null references public.events(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(event_id,user_id)
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions(user_id);
create index if not exists client_notifications_user_idx on public.client_notifications(user_id,created_at desc);
alter table public.push_subscriptions enable row level security;
alter table public.client_notifications enable row level security;
alter table public.event_follows enable row level security;
revoke all on public.push_subscriptions,public.client_notifications,public.event_follows from anon,authenticated;
grant select,insert,delete on public.push_subscriptions to authenticated;
grant select,update on public.client_notifications to authenticated;
grant select,insert,delete on public.event_follows to authenticated;
drop policy if exists "own push subscriptions" on public.push_subscriptions;
create policy "own push subscriptions" on public.push_subscriptions for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists "own client notifications" on public.client_notifications;
create policy "own client notifications" on public.client_notifications for select to authenticated using(user_id=auth.uid());
create policy "read own client notifications" on public.client_notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists "own event follows" on public.event_follows;
create policy "own event follows" on public.event_follows for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
