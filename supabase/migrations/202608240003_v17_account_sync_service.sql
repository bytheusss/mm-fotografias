-- V17: estado portátil da conta, atendimento e leitura em tempo real.
create table if not exists public.account_sync_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cart jsonb not null default '[]'::jsonb,
  favorites jsonb not null default '[]'::jsonb,
  recent jsonb not null default '[]'::jsonb,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.account_sync_state enable row level security;
revoke all on public.account_sync_state from anon;
grant select on public.account_sync_state to authenticated;
drop policy if exists "account sync own read" on public.account_sync_state;
create policy "account sync own read" on public.account_sync_state for select to authenticated using (auth.uid() = user_id);
create index if not exists chat_messages_recipient_unread_idx on public.chat_messages(recipient_id, created_at desc) where read_at is null;
do $$ begin
  alter publication supabase_realtime add table public.account_sync_state;
exception when duplicate_object then null;
end $$;
