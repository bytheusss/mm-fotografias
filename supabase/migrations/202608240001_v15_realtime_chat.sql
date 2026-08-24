-- V15: realtime chat, private management channel and safe client subscriptions.
alter table public.chat_messages replica identity full;

do $$ begin
  alter publication supabase_realtime add table public.chat_messages;
exception when duplicate_object then null;
end $$;

grant select on public.chat_messages to authenticated;

create or replace function public.chat_has_role(allowed text[])
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.profiles p
    where p.id=auth.uid()
      and (p.role=any(allowed) or coalesce(p.roles,'{}'::text[]) && allowed)
  );
$$;

revoke all on function public.chat_has_role(text[]) from public,anon;
grant execute on function public.chat_has_role(text[]) to authenticated;

drop policy if exists "chat realtime visibility" on public.chat_messages;
create policy "chat realtime visibility" on public.chat_messages for select to authenticated using (
  sender_id=auth.uid() or recipient_id=auth.uid()
  or (channel='team' and public.chat_has_role(array['owner','admin','support','photographer']))
  or (channel='management' and public.chat_has_role(array['owner','admin','support']))
  or (channel like 'support:%' and public.chat_has_role(array['owner','admin','support']))
);
