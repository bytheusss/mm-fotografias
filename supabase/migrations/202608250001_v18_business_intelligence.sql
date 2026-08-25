-- V18: inteligência operacional, CRM, campanhas, custos e segurança.
create table if not exists public.event_tasks (
 id uuid primary key default gen_random_uuid(), event_id uuid references public.events(id) on delete cascade,
 title text not null, details text, status text not null default 'open' check(status in('open','doing','done','cancelled')),
 priority text not null default 'normal' check(priority in('low','normal','high','urgent')),
 assigned_to uuid references public.profiles(id) on delete set null, due_at timestamptz, created_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.event_expenses (
 id uuid primary key default gen_random_uuid(), event_id uuid references public.events(id) on delete set null,
 category text not null default 'Outros', description text not null, amount numeric(12,2) not null check(amount>=0), expense_date date not null default current_date,
 receipt_url text, created_by uuid references public.profiles(id), created_at timestamptz not null default now()
);
create table if not exists public.crm_notes (
 id uuid primary key default gen_random_uuid(), customer_email text not null, customer_name text, tags text[] not null default '{}', note text not null,
 communication_consent boolean, created_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.marketing_campaigns (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, event_id uuid references public.events(id) on delete set null,
 source text not null default 'manual', message text, coupon_code text, active boolean not null default true, expires_at timestamptz,
 created_by uuid references public.profiles(id), created_at timestamptz not null default now()
);
create table if not exists public.campaign_visits (
 id bigint generated always as identity primary key, campaign_id uuid not null references public.marketing_campaigns(id) on delete cascade,
 session_key text, user_id uuid references public.profiles(id) on delete set null, referrer text, created_at timestamptz not null default now()
);
create table if not exists public.account_devices (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, device_key text not null,
 label text, user_agent text, last_seen_at timestamptz not null default now(), created_at timestamptz not null default now(), unique(user_id,device_key)
);
alter table public.orders add column if not exists campaign_id uuid references public.marketing_campaigns(id) on delete set null;
alter table public.orders add column if not exists acquisition_source text;
create index if not exists event_tasks_event_status_idx on public.event_tasks(event_id,status,due_at);
create index if not exists event_expenses_event_date_idx on public.event_expenses(event_id,expense_date desc);
create index if not exists crm_notes_email_idx on public.crm_notes(lower(customer_email));
create index if not exists campaign_visits_campaign_idx on public.campaign_visits(campaign_id,created_at desc);
create index if not exists account_devices_user_seen_idx on public.account_devices(user_id,last_seen_at desc);
alter table public.event_tasks enable row level security;alter table public.event_expenses enable row level security;alter table public.crm_notes enable row level security;alter table public.marketing_campaigns enable row level security;alter table public.campaign_visits enable row level security;alter table public.account_devices enable row level security;
revoke all on public.event_tasks,public.event_expenses,public.crm_notes,public.marketing_campaigns,public.campaign_visits,public.account_devices from anon,authenticated;
grant select on public.account_devices to authenticated;
create policy "own devices read" on public.account_devices for select to authenticated using(auth.uid()=user_id);
