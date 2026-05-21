-- Allow "Clear chat for everyone" (permanent delete all messages)
-- Run in Supabase SQL Editor

drop policy if exists "Allow delete messages" on public.messages;
create policy "Allow delete messages"
  on public.messages
  for delete
  using (true);

grant delete on public.messages to anon, authenticated;

alter table public.messages replica identity full;

notify pgrst, 'reload schema';
