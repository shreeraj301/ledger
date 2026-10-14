-- Security hardening. Run once in the SQL editor.

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid,
  project_id text,
  actor text,
  action text not null,
  detail jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_events enable row level security;

drop policy if exists "member read audit" on public.audit_events;
create policy "member read audit" on public.audit_events
  for select using (public.is_member(firm_id));

create or replace function public.ensure_firm()
returns uuid
language plpgsql
security definer
set search_path = public
as $fn$
declare
  fid uuid;
  label text;
  existing jsonb;
begin
  if auth.uid() is null then
    raise exception 'sign in required';
  end if;

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
    coalesce(existing, '{"activeProjectId":"","projects":[],"phases":[],"drawings":[],"requests":[],"decisions":[],"invoices":[]}'::jsonb)
  );

  insert into public.audit_events (firm_id, actor, action)
  values (fid, auth.jwt() ->> 'email', 'firm_created');
  return fid;
end;
$fn$;

create or replace function public.client_apply(p_token text, p_slice jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  rec public.client_tokens%rowtype;
  doc jsonb;
  pid text;
begin
  if p_token is null or length(p_token) < 16 then
    raise exception 'invalid token';
  end if;

  select * into rec from public.client_tokens where token = p_token;
  if rec.token is null then
    raise exception 'invalid token';
  end if;
  pid := rec.project_id;

  if (p_slice->'project'->>'id') is distinct from pid then
    raise exception 'wrong project';
  end if;

  if exists (
    select 1 from jsonb_array_elements(coalesce(p_slice->'requests', '[]'::jsonb)) e
    where e->>'projectId' is distinct from pid
  ) or exists (
    select 1 from jsonb_array_elements(coalesce(p_slice->'phases', '[]'::jsonb)) e
    where e->>'projectId' is distinct from pid
  ) or exists (
    select 1 from jsonb_array_elements(coalesce(p_slice->'drawings', '[]'::jsonb)) e
    where e->>'projectId' is distinct from pid
  ) or exists (
    select 1 from jsonb_array_elements(coalesce(p_slice->'decisions', '[]'::jsonb)) e
    where e->>'projectId' is distinct from pid
  ) or exists (
    select 1 from jsonb_array_elements(coalesce(p_slice->'invoices', '[]'::jsonb)) e
    where e->>'projectId' is distinct from pid
  ) then
    raise exception 'wrong project';
  end if;

  select data into doc from public.studios where firm_id = rec.firm_id for update;

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

  update public.studios set data = doc, updated_at = now() where firm_id = rec.firm_id;

  insert into public.audit_events (firm_id, project_id, actor, action, detail)
  values (rec.firm_id, pid, 'client', 'client_apply', jsonb_build_object('token_prefix', left(p_token, 6)));
end;
$fn$;

revoke all on function public.ensure_firm() from public, anon;
revoke all on function public.is_member(uuid) from public, anon;
grant execute on function public.ensure_firm() to authenticated;
grant execute on function public.is_member(uuid) to authenticated;
grant execute on function public.client_load(text) to anon, authenticated;
grant execute on function public.client_apply(text, jsonb) to anon, authenticated;
