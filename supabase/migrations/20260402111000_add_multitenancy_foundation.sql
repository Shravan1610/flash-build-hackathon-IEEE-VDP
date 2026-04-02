do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'tenant_member_role'
  ) then
    create type public.tenant_member_role as enum (
      'student',
      'student_coordinator',
      'faculty'
    );
  end if;
end
$$;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tenants_name_not_blank check (btrim(name) <> ''),
  constraint tenants_slug_not_blank check (btrim(slug) <> '')
);

create table if not exists public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.tenant_member_role not null default 'student',
  invited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tenant_memberships_unique_member unique (tenant_id, user_id)
);

create table if not exists public.tenant_invites (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  invited_email text not null,
  invited_by uuid not null references auth.users (id) on delete cascade,
  invited_user_id uuid references auth.users (id) on delete set null,
  role public.tenant_member_role not null default 'student',
  invite_token text not null unique default gen_random_uuid()::text,
  accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tenant_invites_email_not_blank check (btrim(invited_email) <> '')
);

create unique index if not exists tenant_invites_pending_unique_idx
  on public.tenant_invites (tenant_id, lower(invited_email))
  where accepted_at is null;

insert into public.tenants (name, slug, description)
select 'IEEE CS SRM IST Vadapalani', 'default-campus', 'Default tenant for migrated event data.'
where not exists (
  select 1 from public.tenants where slug = 'default-campus'
);

create or replace function public.get_default_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.tenants
  order by
    case when slug = 'default-campus' then 0 else 1 end,
    created_at asc
  limit 1;
$$;

alter table public.events
  add column if not exists tenant_id uuid references public.tenants (id) on delete restrict;

alter table public.event_forms
  add column if not exists tenant_id uuid references public.tenants (id) on delete restrict;

alter table public.form_submissions
  add column if not exists tenant_id uuid references public.tenants (id) on delete restrict;

update public.events
set tenant_id = public.get_default_tenant_id()
where tenant_id is null;

update public.event_forms
set tenant_id = coalesce(
  (
    select events.tenant_id
    from public.events
    where events.id = public.event_forms.event_id
  ),
  public.get_default_tenant_id()
)
where tenant_id is null;

update public.form_submissions
set tenant_id = coalesce(
  (
    select event_forms.tenant_id
    from public.event_forms
    where event_forms.id = public.form_submissions.form_id
  ),
  public.get_default_tenant_id()
)
where tenant_id is null;

alter table public.events
  alter column tenant_id set default public.get_default_tenant_id(),
  alter column tenant_id set not null;

alter table public.event_forms
  alter column tenant_id set default public.get_default_tenant_id(),
  alter column tenant_id set not null;

alter table public.form_submissions
  alter column tenant_id set default public.get_default_tenant_id(),
  alter column tenant_id set not null;

create or replace function public.current_tenant_role(target_tenant_id uuid)
returns public.tenant_member_role
language sql
stable
security definer
set search_path = public
as $$
  select tenant_memberships.role
  from public.tenant_memberships
  where tenant_memberships.tenant_id = target_tenant_id
    and tenant_memberships.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.can_manage_tenant(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin_user()
    or exists (
      select 1
      from public.tenant_memberships
      where tenant_memberships.tenant_id = target_tenant_id
        and tenant_memberships.user_id = auth.uid()
        and tenant_memberships.role in ('faculty', 'student_coordinator')
    );
$$;

create or replace function public.claim_pending_invites_for_user(
  target_user_id uuid,
  target_email text,
  preferred_role public.app_role default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  accepted_count integer := 0;
  resolved_role public.app_role := preferred_role;
begin
  insert into public.tenant_memberships (tenant_id, user_id, role, invited_by)
  select invites.tenant_id, target_user_id, invites.role, invites.invited_by
  from public.tenant_invites invites
  where lower(invites.invited_email) = lower(target_email)
    and invites.accepted_at is null
    and not exists (
      select 1
      from public.tenant_memberships memberships
      where memberships.tenant_id = invites.tenant_id
        and memberships.user_id = target_user_id
    )
  on conflict (tenant_id, user_id) do nothing;

  update public.tenant_invites
  set
    accepted_at = timezone('utc', now()),
    invited_user_id = target_user_id,
    updated_at = timezone('utc', now())
  where lower(invited_email) = lower(target_email)
    and accepted_at is null;

  get diagnostics accepted_count = row_count;

  if accepted_count > 0 then
    if exists (
      select 1
      from public.tenant_memberships
      where user_id = target_user_id
        and role = 'faculty'
    ) then
      resolved_role := 'faculty';
    elsif exists (
      select 1
      from public.tenant_memberships
      where user_id = target_user_id
        and role = 'student_coordinator'
    ) then
      resolved_role := 'student_coordinator';
    else
      resolved_role := coalesce(resolved_role, 'student');
    end if;

    insert into public.user_profiles (user_id, role)
    values (target_user_id, resolved_role)
    on conflict (user_id) do update
      set role = resolved_role,
          updated_at = timezone('utc', now());
  end if;

  return accepted_count;
end;
$$;

create or replace function public.claim_my_pending_invites()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  current_email text;
begin
  select email into current_email
  from auth.users
  where id = auth.uid();

  if auth.uid() is null or current_email is null then
    return 0;
  end if;

  return public.claim_pending_invites_for_user(auth.uid(), current_email, null);
end;
$$;

alter table public.tenants enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.tenant_invites enable row level security;

drop policy if exists "members read their tenants" on public.tenants;
create policy "members read their tenants"
  on public.tenants
  for select
  to authenticated
  using (
    public.is_admin_user()
    or exists (
      select 1
      from public.tenant_memberships
      where tenant_memberships.tenant_id = tenants.id
        and tenant_memberships.user_id = auth.uid()
    )
  );

drop policy if exists "authenticated users create tenants" on public.tenants;
create policy "authenticated users create tenants"
  on public.tenants
  for insert
  to authenticated
  with check (created_by = auth.uid() or public.is_admin_user());

drop policy if exists "tenant managers update tenants" on public.tenants;
create policy "tenant managers update tenants"
  on public.tenants
  for update
  to authenticated
  using (public.can_manage_tenant(id))
  with check (public.can_manage_tenant(id));

drop policy if exists "members read memberships" on public.tenant_memberships;
create policy "members read memberships"
  on public.tenant_memberships
  for select
  to authenticated
  using (
    public.is_admin_user()
    or user_id = auth.uid()
    or public.can_manage_tenant(tenant_id)
  );

drop policy if exists "tenant managers manage memberships" on public.tenant_memberships;
create policy "tenant managers manage memberships"
  on public.tenant_memberships
  for all
  to authenticated
  using (public.can_manage_tenant(tenant_id))
  with check (public.can_manage_tenant(tenant_id));

drop policy if exists "members read invites" on public.tenant_invites;
create policy "members read invites"
  on public.tenant_invites
  for select
  to authenticated
  using (
    public.is_admin_user()
    or public.can_manage_tenant(tenant_id)
    or invited_user_id = auth.uid()
  );

drop policy if exists "tenant managers create invites" on public.tenant_invites;
create policy "tenant managers create invites"
  on public.tenant_invites
  for insert
  to authenticated
  with check (public.can_manage_tenant(tenant_id));

drop policy if exists "tenant managers update invites" on public.tenant_invites;
create policy "tenant managers update invites"
  on public.tenant_invites
  for update
  to authenticated
  using (public.can_manage_tenant(tenant_id))
  with check (public.can_manage_tenant(tenant_id));
