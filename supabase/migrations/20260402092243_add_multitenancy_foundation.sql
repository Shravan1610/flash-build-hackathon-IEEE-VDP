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
  constraint tenant_memberships_tenant_id_user_id_key unique (tenant_id, user_id)
);

create table if not exists public.tenant_invites (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  invited_email text not null,
  role public.tenant_member_role not null default 'student',
  invited_by uuid not null references auth.users (id) on delete cascade,
  invited_user_id uuid references auth.users (id) on delete set null,
  invite_token text not null unique default encode(gen_random_bytes(18), 'hex'),
  accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tenant_invites_email_not_blank check (btrim(invited_email) <> '')
);

insert into public.tenants (name, slug, description)
select
  'IEEE CS SRM IST Vadapalani',
  'ieee-cs-srm-vadapalani',
  'Default workspace for the IEEE Computer Society SRM IST Vadapalani event platform.'
where not exists (
  select 1
  from public.tenants
  where slug = 'ieee-cs-srm-vadapalani'
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
  where slug = 'ieee-cs-srm-vadapalani'
  limit 1;
$$;

alter table public.events
  add column if not exists tenant_id uuid default public.get_default_tenant_id();

alter table public.event_forms
  add column if not exists tenant_id uuid default public.get_default_tenant_id();

alter table public.form_submissions
  add column if not exists tenant_id uuid default public.get_default_tenant_id();

update public.events
set tenant_id = public.get_default_tenant_id()
where tenant_id is null;

update public.event_forms
set tenant_id = public.get_default_tenant_id()
where tenant_id is null;

update public.form_submissions
set tenant_id = public.get_default_tenant_id()
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

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'events_tenant_id_fkey'
  ) then
    alter table public.events
      add constraint events_tenant_id_fkey
      foreign key (tenant_id) references public.tenants (id) on delete restrict;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'event_forms_tenant_id_fkey'
  ) then
    alter table public.event_forms
      add constraint event_forms_tenant_id_fkey
      foreign key (tenant_id) references public.tenants (id) on delete restrict;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'form_submissions_tenant_id_fkey'
  ) then
    alter table public.form_submissions
      add constraint form_submissions_tenant_id_fkey
      foreign key (tenant_id) references public.tenants (id) on delete restrict;
  end if;
end
$$;

create index if not exists tenant_memberships_user_id_idx
  on public.tenant_memberships (user_id, tenant_id);

create index if not exists tenant_invites_email_idx
  on public.tenant_invites (lower(invited_email));

create unique index if not exists tenant_invites_tenant_email_pending_unique_idx
  on public.tenant_invites (tenant_id, lower(invited_email))
  where accepted_at is null;

create index if not exists events_tenant_id_idx
  on public.events (tenant_id, event_date);

create index if not exists event_forms_tenant_id_idx
  on public.event_forms (tenant_id, created_at desc);

create index if not exists form_submissions_tenant_id_idx
  on public.form_submissions (tenant_id, submitted_at desc);

drop trigger if exists tenants_touch_updated_at on public.tenants;
create trigger tenants_touch_updated_at
before update on public.tenants
for each row
execute function public.touch_updated_at();

drop trigger if exists tenant_memberships_touch_updated_at on public.tenant_memberships;
create trigger tenant_memberships_touch_updated_at
before update on public.tenant_memberships
for each row
execute function public.touch_updated_at();

drop trigger if exists tenant_invites_touch_updated_at on public.tenant_invites;
create trigger tenant_invites_touch_updated_at
before update on public.tenant_invites
for each row
execute function public.touch_updated_at();

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
        and tenant_memberships.role = 'faculty'::public.tenant_member_role
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
  invite_record public.tenant_invites%rowtype;
  accepted_count integer := 0;
  fallback_role public.tenant_member_role;
begin
  if target_user_id is null or target_email is null then
    return 0;
  end if;

  for invite_record in
    select *
    from public.tenant_invites
    where lower(invited_email) = lower(target_email)
      and accepted_at is null
    order by created_at asc
  loop
    insert into public.tenant_memberships (
      tenant_id,
      user_id,
      role,
      invited_by
    )
    values (
      invite_record.tenant_id,
      target_user_id,
      invite_record.role,
      invite_record.invited_by
    )
    on conflict (tenant_id, user_id) do update
      set role = excluded.role,
          invited_by = excluded.invited_by,
          updated_at = timezone('utc', now());

    update public.tenant_invites
    set accepted_at = timezone('utc', now()),
        invited_user_id = target_user_id,
        updated_at = timezone('utc', now())
    where id = invite_record.id;

    accepted_count := accepted_count + 1;
  end loop;

  if accepted_count = 0 and preferred_role is distinct from 'admin'::public.app_role then
    fallback_role := case
      when preferred_role = 'faculty'::public.app_role then 'faculty'::public.tenant_member_role
      when preferred_role = 'student_coordinator'::public.app_role then 'student_coordinator'::public.tenant_member_role
      else 'student'::public.tenant_member_role
    end;

    insert into public.tenant_memberships (
      tenant_id,
      user_id,
      role
    )
    values (
      public.get_default_tenant_id(),
      target_user_id,
      fallback_role
    )
    on conflict (tenant_id, user_id) do nothing;
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
  email_claim text;
  profile_role public.app_role;
begin
  if auth.uid() is null then
    return 0;
  end if;

  email_claim := coalesce(auth.jwt() ->> 'email', '');

  select role into profile_role
  from public.user_profiles
  where user_id = auth.uid();

  return public.claim_pending_invites_for_user(auth.uid(), email_claim, profile_role);
end;
$$;

create or replace function public.handle_new_user_tenant_memberships()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.app_role;
begin
  requested_role := case
    when lower(coalesce(new.raw_user_meta_data ->> 'role', 'student')) = 'faculty' then 'faculty'::public.app_role
    when lower(coalesce(new.raw_user_meta_data ->> 'role', 'student')) = 'student_coordinator' then 'student_coordinator'::public.app_role
    else 'student'::public.app_role
  end;

  perform public.claim_pending_invites_for_user(new.id, new.email, requested_role);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_tenant_memberships on auth.users;
create trigger on_auth_user_created_tenant_memberships
after insert on auth.users
for each row
execute function public.handle_new_user_tenant_memberships();

alter table public.tenants enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.tenant_invites enable row level security;

drop policy if exists "tenant members view tenants" on public.tenants;
create policy "tenant members view tenants"
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

drop policy if exists "admins manage tenants" on public.tenants;
create policy "admins manage tenants"
  on public.tenants
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "members view memberships" on public.tenant_memberships;
create policy "members view memberships"
  on public.tenant_memberships
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin_user()
    or public.can_manage_tenant(tenant_id)
  );

drop policy if exists "tenant managers manage memberships" on public.tenant_memberships;
create policy "tenant managers manage memberships"
  on public.tenant_memberships
  for all
  to authenticated
  using (
    public.is_admin_user()
    or public.can_manage_tenant(tenant_id)
  )
  with check (
    public.is_admin_user()
    or public.can_manage_tenant(tenant_id)
  );

drop policy if exists "tenant managers view invites" on public.tenant_invites;
create policy "tenant managers view invites"
  on public.tenant_invites
  for select
  to authenticated
  using (
    public.is_admin_user()
    or public.can_manage_tenant(tenant_id)
  );

drop policy if exists "tenant managers manage invites" on public.tenant_invites;
create policy "tenant managers manage invites"
  on public.tenant_invites
  for all
  to authenticated
  using (
    public.is_admin_user()
    or public.can_manage_tenant(tenant_id)
  )
  with check (
    public.is_admin_user()
    or public.can_manage_tenant(tenant_id)
  );

drop policy if exists "public can submit published anonymous forms" on public.form_submissions;
create policy "public can submit published anonymous forms"
  on public.form_submissions
  for insert
  to anon
  with check (
    auth_user_id is null
    and exists (
      select 1
      from public.event_forms
      where event_forms.id = form_submissions.form_id
        and event_forms.tenant_id = form_submissions.tenant_id
        and event_forms.status = 'published'
        and event_forms.requires_authentication = false
    )
  );

drop policy if exists "authenticated users can submit published forms" on public.form_submissions;
create policy "authenticated users can submit published forms"
  on public.form_submissions
  for insert
  to authenticated
  with check (
    (auth_user_id is null or auth_user_id = auth.uid())
    and exists (
      select 1
      from public.event_forms
      where event_forms.id = form_submissions.form_id
        and event_forms.tenant_id = form_submissions.tenant_id
        and event_forms.status = 'published'
        and (
          event_forms.requires_authentication = false
          or auth.uid() is not null
        )
    )
  );
