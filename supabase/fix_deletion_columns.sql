-- ============================================================
-- FIX: "Could not find the 'deleted_at' column in the schema cache"
-- Run ALL of this in Supabase SQL Editor → Run
-- https://supabase.com/dashboard/project/yafjecenbkxyqjqoexqs/sql/new
-- ============================================================

-- Step 1: Add missing columns (safe to run multiple times)
alter table public.messages
  add column if not exists deleted_for_everyone boolean not null default false;

alter table public.messages
  add column if not exists deleted_at timestamptz;

-- Step 2: Allow UPDATE for soft-delete
grant update on public.messages to anon, authenticated;

-- Step 3: RLS policy for soft-delete
alter table public.messages enable row level security;

drop policy if exists "Allow soft delete for everyone" on public.messages;
create policy "Allow soft delete for everyone"
  on public.messages
  for update
  using (deleted_for_everyone = false)
  with check (
    deleted_for_everyone = true
    and deleted_at is not null
  );

-- Step 4: 1-minute delete window (server-side)
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
      raise exception 'Delete for everyone is only allowed within 1 minute of sending';
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

-- Step 5: Reload PostgREST schema cache (fixes "schema cache" errors)
notify pgrst, 'reload schema';
