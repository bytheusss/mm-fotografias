-- M&M Fotografias v9: fotógrafo padrão e ordenação da equipe nos eventos.
alter table public.event_photographers add column if not exists is_default boolean not null default false;
alter table public.event_photographers add column if not exists display_order integer not null default 0;
create unique index if not exists event_one_default_photographer_idx
  on public.event_photographers(event_id) where is_default = true;
