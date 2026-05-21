-- ============================================================
-- REQUIRED: Instant messages without browser refresh
-- Run in Supabase SQL Editor, then confirm in Dashboard:
-- Database → Replication → supabase_realtime → messages ON
-- ============================================================

-- 1. Add messages to realtime publication (WebSocket events)
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

-- 2. Broadcast full rows on UPDATE (delete-for-everyone)
alter table public.messages replica identity full;

-- 3. RLS must allow SELECT or realtime won't deliver rows to clients
drop policy if exists "Allow read messages" on public.messages;
create policy "Allow read messages"
  on public.messages for select using (true);

-- 4. Reload PostgREST schema cache
notify pgrst, 'reload schema';
