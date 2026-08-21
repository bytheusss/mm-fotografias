-- M&M Fotografias v5: personalização, duplicatas e downloads auditáveis.
alter table public.events add column if not exists share_message text;
alter table public.photos add column if not exists checksum text;
alter table public.orders add column if not exists download_expires_at timestamptz;
alter table public.orders add column if not exists download_count integer not null default 0;
create unique index if not exists photos_event_checksum_unique on public.photos(event_id, checksum) where checksum is not null;
