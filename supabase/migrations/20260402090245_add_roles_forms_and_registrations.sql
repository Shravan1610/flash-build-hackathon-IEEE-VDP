do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'app_role'
  ) then
    create type public.app_role as enum ('student', 'faculty', 'admin');
  end if;

  if not exists (
    select 1 from pg_type where typname = 'form_status'
  ) then
    create type public.form_status as enum ('draft', 'published', 'archived');
  end if;

  if not exists (
    select 1 from pg_type where typname = 'form_field_type'
  ) then
    create type public.form_field_type as enum (
      'text',
      'email',
      'phone',
      'textarea',
      'select',
      'radio',
      'checkbox',
      'date',
      'number'
    );
  end if;
end
$$;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.app_role not null default 'student',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint user_profiles_full_name_not_blank check (
    full_name is null or btrim(full_name) <> ''
  )
);

create table if not exists public.event_forms (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events (id) on delete set null,
  title text not null,
  slug text not null,
  description text,
  status public.form_status not null default 'draft',
  requires_authentication boolean not null default false,
  success_message text not null default 'Your response has been recorded.',
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  published_at timestamptz,
  constraint event_forms_title_not_blank check (btrim(title) <> ''),
  constraint event_forms_slug_not_blank check (btrim(slug) <> '')
);

create table if not exists public.form_fields (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.event_forms (id) on delete cascade,
  field_key text not null,
  label text not null,
  field_type public.form_field_type not null,
  placeholder text,
  help_text text,
  is_required boolean not null default false,
  options jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint form_fields_field_key_not_blank check (btrim(field_key) <> ''),
  constraint form_fields_label_not_blank check (btrim(label) <> ''),
  constraint form_fields_options_is_array check (jsonb_typeof(options) = 'array'),
  constraint form_fields_settings_is_object check (jsonb_typeof(settings) = 'object')
);

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.event_forms (id) on delete cascade,
  event_id uuid references public.events (id) on delete set null,
  auth_user_id uuid references auth.users (id) on delete set null,
  submitter_name text,
  submitter_email text,
  submitter_phone text,
  submitter_role public.app_role,
  answers jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default timezone('utc', now()),
  constraint form_submissions_answers_is_object check (jsonb_typeof(answers) = 'object'),
  constraint form_submissions_metadata_is_object check (jsonb_typeof(metadata) = 'object')
);

create unique index if not exists event_forms_slug_unique_idx
  on public.event_forms (lower(slug));

create index if not exists event_forms_event_id_idx
  on public.event_forms (event_id);

create index if not exists form_fields_form_sort_idx
  on public.form_fields (form_id, sort_order asc, created_at asc);

create index if not exists form_submissions_form_submitted_idx
  on public.form_submissions (form_id, submitted_at desc);

create index if not exists form_submissions_event_id_idx
  on public.form_submissions (event_id);

create index if not exists form_submissions_auth_user_id_idx
  on public.form_submissions (auth_user_id);

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles
    where user_id = auth.uid()
      and role = 'admin'::public.app_role
  )
  or exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

alter table public.user_profiles enable row level security;
alter table public.event_forms enable row level security;
alter table public.form_fields enable row level security;
alter table public.form_submissions enable row level security;

drop policy if exists "users view own profile" on public.user_profiles;
create policy "users view own profile"
  on public.user_profiles
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin_user());

drop policy if exists "users update own profile" on public.user_profiles;
create policy "users update own profile"
  on public.user_profiles
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and role = (
      select current_profile.role
      from public.user_profiles current_profile
      where current_profile.user_id = auth.uid()
    )
  );

drop policy if exists "admins manage profiles" on public.user_profiles;
create policy "admins manage profiles"
  on public.user_profiles
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "published forms are public" on public.event_forms;
create policy "published forms are public"
  on public.event_forms
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "admins manage forms" on public.event_forms;
create policy "admins manage forms"
  on public.event_forms
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "published form fields are public" on public.form_fields;
create policy "published form fields are public"
  on public.form_fields
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.event_forms
      where event_forms.id = form_fields.form_id
        and event_forms.status = 'published'
    )
  );

drop policy if exists "admins manage form fields" on public.form_fields;
create policy "admins manage form fields"
  on public.form_fields
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

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
        and event_forms.status = 'published'
        and (
          event_forms.requires_authentication = false
          or auth.uid() is not null
        )
    )
  );

drop policy if exists "admins view submissions" on public.form_submissions;
create policy "admins view submissions"
  on public.form_submissions
  for select
  to authenticated
  using (public.is_admin_user());

drop policy if exists "admins manage submissions" on public.form_submissions;
create policy "admins manage submissions"
  on public.form_submissions
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());
