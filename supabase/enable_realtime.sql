-- REQUIRED for instant messaging without refresh
-- Run in Supabase SQL Editor

-- 1. Add table to realtime publication
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- 2. Full row data for UPDATE events (delete-for-everyone sync)
alter table public.messages replica identity full;

-- 3. Reload API schema cache
notify pgrst, 'reload schema';
