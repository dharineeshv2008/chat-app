-- Production schema + policies for private 2-user chat
-- Run once in Supabase SQL Editor, then: notify pgrst, 'reload schema';

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender text not null check (sender in ('John', 'Friend')),
  text text not null check (char_length(trim(text)) > 0),
  created_at timestamptz not null default now(),
  deleted_for_everyone boolean not null default false,
  deleted_at timestamptz
);

alter table public.messages
  add column if not exists deleted_for_everyone boolean not null default false;

alter table public.messages
  add column if not exists deleted_at timestamptz;

create index if not exists messages_created_at_idx
  on public.messages (created_at asc);

alter table public.messages enable row level security;

drop policy if exists "Allow read messages" on public.messages;
create policy "Allow read messages"
  on public.messages for select using (true);

drop policy if exists "Allow insert messages" on public.messages;
create policy "Allow insert messages"
  on public.messages for insert
  with check (sender in ('John', 'Friend'));

drop policy if exists "Allow soft delete for everyone" on public.messages;
create policy "Allow soft delete for everyone"
  on public.messages
  for update
  using (deleted_for_everyone = false)
  with check (
    deleted_for_everyone = true
    and deleted_at is not null
  );

create or replace function public.enforce_message_soft_delete()
returns trigger
language plpgsql
as $$
begin
  if new.deleted_for_everyone is distinct from old.deleted_for_everyone
     and new.deleted_for_everyone = true then

    if old.deleted_for_everyone = true then
      raise exception 'Message is already deleted for everyone';
    end if;

    if (coalesce(new.deleted_at, now()) - old.created_at) > interval '1 minute' then
      raise exception 'Delete for everyone only allowed within 1 minute';
    end if;

    new.deleted_at := coalesce(new.deleted_at, now());
    new.sender := old.sender;
    new.text := old.text;
    new.created_at := old.created_at;
  end if;

  return new;
end;
$$;

drop trigger if exists messages_soft_delete_guard on public.messages;
create trigger messages_soft_delete_guard
  before update on public.messages
  for each row
  execute function public.enforce_message_soft_delete();

grant usage on schema public to anon, authenticated;
drop policy if exists "Allow delete messages" on public.messages;
create policy "Allow delete messages"
  on public.messages for delete using (true);

grant select, insert, update, delete on public.messages to anon, authenticated;

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

alter table public.messages replica identity full;

notify pgrst, 'reload schema';
