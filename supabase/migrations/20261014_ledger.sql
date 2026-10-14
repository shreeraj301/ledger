-- Run once in the Supabase SQL editor.
-- https://supabase.com/dashboard/project/hnshsgdhtekrzathpdqu/sql/new

create table if not exists public.ledger (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.ledger enable row level security;

drop policy if exists "ledger read" on public.ledger;
drop policy if exists "ledger write" on public.ledger;
drop policy if exists "ledger update" on public.ledger;

create policy "ledger read" on public.ledger for select using (true);
create policy "ledger write" on public.ledger for insert with check (true);
create policy "ledger update" on public.ledger for update using (true);

do $$
begin
  alter publication supabase_realtime add table public.ledger;
exception
  when duplicate_object then null;
end $$;
