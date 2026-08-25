-- V20: contratação de ensaios e coberturas, propostas, contratos, agenda e entrega.
create table if not exists public.service_requests (
 id uuid primary key default gen_random_uuid(), protocol text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
 user_id uuid references public.profiles(id) on delete set null, service_slug text not null, package_slug text,
 client_name text not null, email text not null, whatsapp text not null, event_date date, alternate_date date,
 city text, venue text, guests integer, notes text, budget numeric(12,2), contact_preference text default 'whatsapp',
 status text not null default 'new' check(status in('new','contacted','qualifying','proposal','approved','declined','booked','completed','cancelled')),
 assigned_to uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.service_proposals (
 id uuid primary key default gen_random_uuid(), request_id uuid not null references public.service_requests(id) on delete cascade,
 token uuid not null unique default gen_random_uuid(), title text not null, description text, items jsonb not null default '[]',
 subtotal numeric(12,2) not null default 0, discount numeric(12,2) not null default 0, total numeric(12,2) not null default 0,
 deposit_amount numeric(12,2) not null default 0, valid_until date, terms text, status text not null default 'draft' check(status in('draft','sent','viewed','accepted','declined','expired')),
 accepted_name text, accepted_ip text, accepted_at timestamptz, created_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.service_jobs (
 id uuid primary key default gen_random_uuid(), request_id uuid unique references public.service_requests(id) on delete set null,
 proposal_id uuid references public.service_proposals(id) on delete set null, client_user_id uuid references public.profiles(id) on delete set null,
 title text not null, service_slug text not null, event_date date, start_time time, end_time time, city text, venue text,
 status text not null default 'scheduled' check(status in('scheduled','preparing','shooting','editing','review','delivered','completed','cancelled')),
 total numeric(12,2) not null default 0, paid_amount numeric(12,2) not null default 0, delivery_due date, private_notes text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.service_job_team (
 job_id uuid references public.service_jobs(id) on delete cascade, user_id uuid references public.profiles(id) on delete cascade,
 role_label text not null default 'Fotógrafo', commission_type text default 'fixed', commission_value numeric(12,2) default 0,
 primary key(job_id,user_id)
);
create table if not exists public.service_job_tasks (
 id uuid primary key default gen_random_uuid(), job_id uuid not null references public.service_jobs(id) on delete cascade,
 title text not null, stage text not null default 'pre', done boolean not null default false, assigned_to uuid references public.profiles(id), due_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.service_job_files (
 id uuid primary key default gen_random_uuid(), job_id uuid not null references public.service_jobs(id) on delete cascade,
 uploaded_by uuid references public.profiles(id), kind text not null default 'reference', name text not null, url text not null,
 visible_to_client boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.service_payments (
 id uuid primary key default gen_random_uuid(), job_id uuid references public.service_jobs(id) on delete cascade, proposal_id uuid references public.service_proposals(id) on delete set null,
 kind text not null default 'deposit', amount numeric(12,2) not null, status text not null default 'pending' check(status in('pending','approved','failed','refunded')),
 provider text default 'mercadopago', provider_reference text, due_at timestamptz, paid_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists service_requests_status_date_idx on public.service_requests(status,event_date);
create index if not exists service_jobs_date_status_idx on public.service_jobs(event_date,status);
create index if not exists service_proposals_request_idx on public.service_proposals(request_id,created_at desc);
alter table public.service_requests enable row level security; alter table public.service_proposals enable row level security;
alter table public.service_jobs enable row level security; alter table public.service_job_team enable row level security;
alter table public.service_job_tasks enable row level security; alter table public.service_job_files enable row level security; alter table public.service_payments enable row level security;
revoke all on public.service_requests,public.service_proposals,public.service_jobs,public.service_job_team,public.service_job_tasks,public.service_job_files,public.service_payments from anon,authenticated;
grant select on public.service_requests,public.service_jobs,public.service_job_team,public.service_job_tasks,public.service_job_files,public.service_payments to authenticated;
create policy "own service requests" on public.service_requests for select to authenticated using(user_id=auth.uid());
create policy "own service jobs" on public.service_jobs for select to authenticated using(client_user_id=auth.uid() or exists(select 1 from public.service_job_team t where t.job_id=id and t.user_id=auth.uid()));
create policy "job team read" on public.service_job_team for select to authenticated using(user_id=auth.uid() or exists(select 1 from public.service_jobs j where j.id=job_id and j.client_user_id=auth.uid()));
create policy "job tasks read" on public.service_job_tasks for select to authenticated using(exists(select 1 from public.service_jobs j left join public.service_job_team t on t.job_id=j.id where j.id=job_id and (j.client_user_id=auth.uid() or t.user_id=auth.uid())));
create policy "job files read" on public.service_job_files for select to authenticated using(exists(select 1 from public.service_jobs j left join public.service_job_team t on t.job_id=j.id where j.id=job_id and (j.client_user_id=auth.uid() or t.user_id=auth.uid())));
create policy "job payments read" on public.service_payments for select to authenticated using(exists(select 1 from public.service_jobs j where j.id=job_id and j.client_user_id=auth.uid()));
