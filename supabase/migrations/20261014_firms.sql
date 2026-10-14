-- Firms, membership, and client tokens.
-- Run in the Supabase SQL editor after the ledger table exists.

create table if not exists public.firms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  firm_id uuid not null references public.firms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  primary key (firm_id, user_id)
);

create table if not exists public.studios (
  firm_id uuid primary key references public.firms(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.client_tokens (
  token text primary key,
  firm_id uuid not null references public.firms(id) on delete cascade,
  project_id text not null
);

alter table public.firms enable row level security;
alter table public.members enable row level security;
alter table public.studios enable row level security;
alter table public.client_tokens enable row level security;

drop policy if exists "member read firms" on public.firms;
drop policy if exists "member read members" on public.members;
drop policy if exists "member read studios" on public.studios;
drop policy if exists "member write studios" on public.studios;
drop policy if exists "member insert studios" on public.studios;
drop policy if exists "member tokens" on public.client_tokens;

create policy "member read firms" on public.firms
  for select using (id in (select firm_id from public.members where user_id = auth.uid()));

create policy "member read members" on public.members
  for select using (firm_id in (select firm_id from public.members where user_id = auth.uid()));

create policy "member read studios" on public.studios
  for select using (firm_id in (select firm_id from public.members where user_id = auth.uid()));

create policy "member write studios" on public.studios
  for update using (firm_id in (select firm_id from public.members where user_id = auth.uid()));

create policy "member insert studios" on public.studios
  for insert with check (firm_id in (select firm_id from public.members where user_id = auth.uid()));

create policy "member tokens" on public.client_tokens
  for all
  using (firm_id in (select firm_id from public.members where user_id = auth.uid()))
  with check (firm_id in (select firm_id from public.members where user_id = auth.uid()));

-- Close the old public document.
drop policy if exists "ledger read" on public.ledger;
drop policy if exists "ledger write" on public.ledger;
drop policy if exists "ledger update" on public.ledger;

create or replace function public.ensure_firm()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  fid uuid;
  label text;
  existing jsonb;
begin
  select firm_id into fid from public.members where user_id = auth.uid() limit 1;
  if fid is not null then
    return fid;
  end if;

  label := split_part(coalesce(auth.jwt() ->> 'email', 'Studio'), '@', 1);
  insert into public.firms (name) values (label) returning id into fid;
  insert into public.members (firm_id, user_id, role) values (fid, auth.uid(), 'owner');

  existing := null;
  if (select count(*) from public.firms) = 1 then
    select data into existing from public.ledger where id = 'main';
  end if;

  insert into public.studios (firm_id, data)
  values (
    fid,
    coalesce(
      existing,
      '{"activeProjectId":"","projects":[],"phases":[],"drawings":[],"requests":[],"decisions":[],"invoices":[]}'::jsonb
    )
  );
  return fid;
end;
$$;

create or replace function public.client_load(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  tok public.client_tokens%rowtype;
  doc jsonb;
  pid text;
begin
  select * into tok from public.client_tokens where token = p_token;
  if tok.token is null then
    return null;
  end if;
  select data into doc from public.studios where firm_id = tok.firm_id;
  pid := tok.project_id;
  return jsonb_build_object(
    'project', (select e from jsonb_array_elements(coalesce(doc->'projects', '[]'::jsonb)) e where e->>'id' = pid),
    'phases', coalesce((select jsonb_agg(e) from jsonb_array_elements(coalesce(doc->'phases', '[]'::jsonb)) e where e->>'projectId' = pid), '[]'::jsonb),
    'drawings', coalesce((select jsonb_agg(e) from jsonb_array_elements(coalesce(doc->'drawings', '[]'::jsonb)) e where e->>'projectId' = pid), '[]'::jsonb),
    'requests', coalesce((select jsonb_agg(e) from jsonb_array_elements(coalesce(doc->'requests', '[]'::jsonb)) e where e->>'projectId' = pid), '[]'::jsonb),
    'decisions', coalesce((select jsonb_agg(e) from jsonb_array_elements(coalesce(doc->'decisions', '[]'::jsonb)) e where e->>'projectId' = pid), '[]'::jsonb),
    'invoices', coalesce((select jsonb_agg(e) from jsonb_array_elements(coalesce(doc->'invoices', '[]'::jsonb)) e where e->>'projectId' = pid), '[]'::jsonb)
  );
end;
$$;

create or replace function public.client_apply(p_token text, p_slice jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  tok public.client_tokens%rowtype;
  doc jsonb;
  pid text;
begin
  select * into tok from public.client_tokens where token = p_token;
  if tok.token is null then
    raise exception 'invalid token';
  end if;
  pid := tok.project_id;

  if exists (
    select 1 from jsonb_array_elements(coalesce(p_slice->'requests', '[]'::jsonb)) e
    where e->>'projectId' is distinct from pid
  ) then
    raise exception 'wrong project';
  end if;

  select data into doc from public.studios where firm_id = tok.firm_id for update;

  doc := jsonb_set(doc, '{projects}',
    coalesce((select jsonb_agg(e) from jsonb_array_elements(coalesce(doc->'projects', '[]'::jsonb)) e where e->>'id' <> pid), '[]'::jsonb)
    || jsonb_build_array(p_slice->'project'));
  doc := jsonb_set(doc, '{phases}',
    coalesce((select jsonb_agg(e) from jsonb_array_elements(coalesce(doc->'phases', '[]'::jsonb)) e where e->>'projectId' <> pid), '[]'::jsonb)
    || coalesce(p_slice->'phases', '[]'::jsonb));
  doc := jsonb_set(doc, '{drawings}',
    coalesce((select jsonb_agg(e) from jsonb_array_elements(coalesce(doc->'drawings', '[]'::jsonb)) e where e->>'projectId' <> pid), '[]'::jsonb)
    || coalesce(p_slice->'drawings', '[]'::jsonb));
  doc := jsonb_set(doc, '{requests}',
    coalesce((select jsonb_agg(e) from jsonb_array_elements(coalesce(doc->'requests', '[]'::jsonb)) e where e->>'projectId' <> pid), '[]'::jsonb)
    || coalesce(p_slice->'requests', '[]'::jsonb));
  doc := jsonb_set(doc, '{decisions}',
    coalesce((select jsonb_agg(e) from jsonb_array_elements(coalesce(doc->'decisions', '[]'::jsonb)) e where e->>'projectId' <> pid), '[]'::jsonb)
    || coalesce(p_slice->'decisions', '[]'::jsonb));
  doc := jsonb_set(doc, '{invoices}',
    coalesce((select jsonb_agg(e) from jsonb_array_elements(coalesce(doc->'invoices', '[]'::jsonb)) e where e->>'projectId' <> pid), '[]'::jsonb)
    || coalesce(p_slice->'invoices', '[]'::jsonb));

  update public.studios set data = doc, updated_at = now() where firm_id = tok.firm_id;
end;
$$;

grant execute on function public.ensure_firm() to authenticated;
grant execute on function public.client_load(text) to anon, authenticated;
grant execute on function public.client_apply(text, jsonb) to anon, authenticated;

do $$
begin
  alter publication supabase_realtime add table public.studios;
exception
  when duplicate_object then null;
end $$;
