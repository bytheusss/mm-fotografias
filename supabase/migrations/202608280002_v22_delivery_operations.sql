-- V22: entrega privada, seleção do cliente e lembretes operacionais.
alter table public.service_galleries add column if not exists access_token uuid not null default gen_random_uuid();
alter table public.service_galleries add column if not exists selection_submitted_at timestamptz;
create unique index if not exists service_galleries_access_token_idx on public.service_galleries(access_token);
alter table public.service_gallery_photos add column if not exists client_note text;
alter table public.service_gallery_photos add column if not exists preview_path text;
alter table public.service_gallery_photos add column if not exists selected_at timestamptz;
alter table public.service_jobs add column if not exists reminder_sent_at timestamptz;
alter table public.service_jobs add column if not exists balance_due_at timestamptz;
create index if not exists service_jobs_agenda_idx on public.service_jobs(event_date,start_time,end_time) where status <> 'cancelled';

create or replace function public.log_service_job_status() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if old.status is distinct from new.status then
  insert into public.service_activity(job_id,kind,title,details,visible_to_client)
  values(new.id,'status_changed','Etapa atualizada',jsonb_build_object('from',old.status,'to',new.status),true);
 end if;
 return new;
end $$;
drop trigger if exists service_jobs_status_activity on public.service_jobs;
create trigger service_jobs_status_activity after update of status on public.service_jobs for each row execute function public.log_service_job_status();
