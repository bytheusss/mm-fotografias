create table if not exists public.chat_messages(
 id uuid primary key default gen_random_uuid(), channel text not null,
 sender_id uuid not null references public.profiles(id) on delete cascade,
 recipient_id uuid references public.profiles(id) on delete cascade,
 body text not null check(char_length(body) between 1 and 2000), read_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists chat_messages_channel_idx on public.chat_messages(channel,created_at desc);
create index if not exists chat_messages_recipient_idx on public.chat_messages(recipient_id,read_at,created_at desc);
alter table public.chat_messages enable row level security;
revoke all on public.chat_messages from anon,authenticated;
