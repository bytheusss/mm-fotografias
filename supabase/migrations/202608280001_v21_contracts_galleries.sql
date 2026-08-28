-- Contratos, linha do tempo, galerias privadas e agenda sobre a estrutura V20 existente.
create table if not exists public.contract_templates (
 id uuid primary key default gen_random_uuid(), scope text not null check(scope in('studio','photographer')),
 photographer_id uuid references public.profiles(id) on delete cascade, title text not null,
 clauses jsonb not null default '[]', active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index if not exists contract_templates_studio_unique on public.contract_templates(scope) where photographer_id is null;
create unique index if not exists contract_templates_photographer_unique on public.contract_templates(photographer_id) where photographer_id is not null;

create table if not exists public.service_contracts (
 id uuid primary key default gen_random_uuid(), token uuid not null unique default gen_random_uuid(),
 job_id uuid references public.service_jobs(id) on delete cascade, proposal_id uuid references public.service_proposals(id) on delete set null,
 template_id uuid references public.contract_templates(id) on delete set null, photographer_id uuid references public.profiles(id) on delete set null,
 title text not null, snapshot jsonb not null default '{}', status text not null default 'draft' check(status in('draft','sent','viewed','accepted','declined','cancelled')),
 accepted_name text, accepted_document text, accepted_ip text, accepted_user_agent text, accepted_at timestamptz,
 created_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists service_contracts_job_idx on public.service_contracts(job_id,created_at desc);

create table if not exists public.service_activity (
 id uuid primary key default gen_random_uuid(), job_id uuid references public.service_jobs(id) on delete cascade,
 request_id uuid references public.service_requests(id) on delete cascade, actor_id uuid references public.profiles(id) on delete set null,
 kind text not null, title text not null, details jsonb not null default '{}', visible_to_client boolean not null default true, created_at timestamptz not null default now()
);
create index if not exists service_activity_job_idx on public.service_activity(job_id,created_at desc);

create table if not exists public.service_galleries (
 id uuid primary key default gen_random_uuid(), job_id uuid not null unique references public.service_jobs(id) on delete cascade,
 slug text not null unique, title text not null, welcome_text text, cover_path text, access_code_hash text,
 published boolean not null default false, allow_download boolean not null default false, allow_selection boolean not null default true,
 expires_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.service_gallery_photos (
 id uuid primary key default gen_random_uuid(), gallery_id uuid not null references public.service_galleries(id) on delete cascade,
 storage_path text not null, filename text not null, category text, sort_order integer not null default 0,
 selected boolean not null default false, approved boolean not null default false, created_at timestamptz not null default now()
);
create index if not exists service_gallery_photos_gallery_idx on public.service_gallery_photos(gallery_id,sort_order,created_at);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('service-galleries','service-galleries',false,26214400,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

insert into public.contract_templates(scope,title,clauses) values('studio','Contrato de Prestação de Serviços Fotográficos - M&M Fotografias','["Objeto e escopo do serviço contratado","Data, local, horários e responsabilidades das partes","Preço, sinal, saldo e condições de pagamento","Remarcação, cancelamento e força maior","Seleção, edição, prazo e forma de entrega","Guarda dos arquivos e validade da galeria","Direitos autorais e autorização de uso de imagem","Privacidade, proteção de dados e atendimento à LGPD","Aceite eletrônico e foro"]'::jsonb) on conflict do nothing;

create or replace function public.ensure_photographer_contract_template() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if coalesce(new.roles,'{}'::text[]) @> array['photographer']::text[] or new.role='photographer' then
  insert into public.contract_templates(scope,photographer_id,title,clauses) values('photographer',new.id,'Termo de Prestação de Serviços - '||coalesce(new.full_name,new.email,'Fotógrafo M&M'),'["Objeto da colaboração fotográfica","Datas, disponibilidade e pontualidade","Padrão técnico, conduta e identidade M&M","Entrega, seleção e tratamento dos arquivos","Comissão, repasse e despesas autorizadas","Sigilo, dados de clientes e LGPD","Direitos autorais, portfólio e uso de imagem","Equipamentos, responsabilidade e segurança","Cancelamento, encerramento e aceite eletrônico"]'::jsonb) on conflict(photographer_id) where photographer_id is not null do update set title=excluded.title,updated_at=now();
 end if;
 return new;
end $$;
drop trigger if exists profiles_photographer_contract_template on public.profiles;
create trigger profiles_photographer_contract_template after insert or update of role,roles,full_name on public.profiles for each row execute function public.ensure_photographer_contract_template();
insert into public.contract_templates(scope,photographer_id,title,clauses)
select 'photographer',p.id,'Termo de Prestação de Serviços - '||coalesce(p.full_name,p.email,'Fotógrafo M&M'),'["Objeto da colaboração fotográfica","Datas, disponibilidade e pontualidade","Padrão técnico, conduta e identidade M&M","Entrega, seleção e tratamento dos arquivos","Comissão, repasse e despesas autorizadas","Sigilo, dados de clientes e LGPD","Direitos autorais, portfólio e uso de imagem","Equipamentos, responsabilidade e segurança","Cancelamento, encerramento e aceite eletrônico"]'::jsonb from public.profiles p where p.role='photographer' or coalesce(p.roles,'{}'::text[]) @> array['photographer']::text[] on conflict do nothing;

alter table public.contract_templates enable row level security; alter table public.service_contracts enable row level security; alter table public.service_activity enable row level security; alter table public.service_galleries enable row level security; alter table public.service_gallery_photos enable row level security;
revoke all on public.contract_templates,public.service_contracts,public.service_activity,public.service_galleries,public.service_gallery_photos from anon,authenticated;
grant select on public.contract_templates,public.service_contracts,public.service_activity,public.service_galleries,public.service_gallery_photos to authenticated;
create policy "photographer own template" on public.contract_templates for select to authenticated using(photographer_id=auth.uid());
create policy "client own contracts" on public.service_contracts for select to authenticated using(exists(select 1 from public.service_jobs j where j.id=job_id and (j.client_user_id=auth.uid() or exists(select 1 from public.service_job_team t where t.job_id=j.id and t.user_id=auth.uid()))));
create policy "client own activity" on public.service_activity for select to authenticated using(exists(select 1 from public.service_jobs j where j.id=job_id and (j.client_user_id=auth.uid() or exists(select 1 from public.service_job_team t where t.job_id=j.id and t.user_id=auth.uid()))));
create policy "client own galleries" on public.service_galleries for select to authenticated using(exists(select 1 from public.service_jobs j where j.id=job_id and (j.client_user_id=auth.uid() or exists(select 1 from public.service_job_team t where t.job_id=j.id and t.user_id=auth.uid()))));
create policy "client own gallery photos" on public.service_gallery_photos for select to authenticated using(exists(select 1 from public.service_galleries g join public.service_jobs j on j.id=g.job_id where g.id=gallery_id and (j.client_user_id=auth.uid() or exists(select 1 from public.service_job_team t where t.job_id=j.id and t.user_id=auth.uid()))));
