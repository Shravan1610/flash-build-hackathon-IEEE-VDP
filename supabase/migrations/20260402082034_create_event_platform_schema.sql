create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'event_category'
  ) then
    create type public.event_category as enum (
      'Membership Drive',
      'Seminar',
      'Workshop',
      'Hackathon',
      'Coding Challenge'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'event_status'
  ) then
    create type public.event_status as enum (
      'draft',
      'review_required',
      'published',
      'rejected'
    );
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'poster_source_file_type'
  ) then
    create type public.poster_source_file_type as enum (
      'image/jpeg',
      'image/png',
      'application/pdf'
    );
  end if;
end
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  cmd record;
begin
  for cmd in
    select *
    from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
  loop
    if cmd.schema_name is not null
      and cmd.schema_name in ('public')
      and cmd.schema_name not in ('pg_catalog', 'information_schema')
      and cmd.schema_name not like 'pg_toast%'
      and cmd.schema_name not like 'pg_temp%'
    then
      begin
        execute format(
          'alter table if exists %s enable row level security',
          cmd.object_identity
        );
        raise log 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      exception
        when others then
          raise log 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      end;
    else
      raise log
        'rls_auto_enable: skip % (either system schema or not in enforced list: %.)',
        cmd.object_identity,
        cmd.schema_name;
    end if;
  end loop;
end;
$$;

drop event trigger if exists ensure_rls;
create event trigger ensure_rls
  on ddl_command_end
  when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  execute function public.rls_auto_enable();

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text,
  title text,
  description_raw_text text,
  event_date date,
  start_time time,
  end_time time,
  venue text,
  category public.event_category,
  status public.event_status not null default 'review_required',
  poster_storage_path text not null,
  poster_public_url text,
  source_file_type public.poster_source_file_type not null,
  ocr_text text,
  extraction_confidence numeric(4, 3),
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint events_slug_not_blank check (slug is null or btrim(slug) <> ''),
  constraint events_title_not_blank check (title is null or btrim(title) <> ''),
  constraint events_venue_not_blank check (venue is null or btrim(venue) <> ''),
  constraint events_end_time_after_start_time check (
    end_time is null
    or start_time is null
    or end_time > start_time
  ),
  constraint events_confidence_between_zero_and_one check (
    extraction_confidence is null
    or extraction_confidence >= 0
    and extraction_confidence <= 1
  ),
  constraint events_published_requires_complete_metadata check (
    status <> 'published'
    or (
      slug is not null
      and title is not null
      and event_date is not null
      and venue is not null
      and category is not null
      and published_at is not null
    )
  ),
  constraint events_non_published_has_no_published_at check (
    status = 'published'
    or published_at is null
  )
);

create unique index if not exists events_slug_unique_idx
  on public.events (lower(slug))
  where slug is not null;

create index if not exists events_status_event_date_idx
  on public.events (status, event_date desc nulls last);

create index if not exists events_category_event_date_idx
  on public.events (category, event_date desc nulls last);

create index if not exists events_published_at_idx
  on public.events (published_at desc nulls last);

create index if not exists events_search_idx
  on public.events
  using gin (
    to_tsvector(
      'simple',
      coalesce(title, '')
      || ' '
      || coalesce(venue, '')
      || ' '
      || coalesce(description_raw_text, '')
    )
  );

drop trigger if exists events_touch_updated_at on public.events;
create trigger events_touch_updated_at
before update on public.events
for each row
execute function public.touch_updated_at();

alter table public.admin_users enable row level security;
alter table public.events enable row level security;

drop policy if exists "admin users can view themselves" on public.admin_users;
create policy "admin users can view themselves"
  on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "published events are public" on public.events;
create policy "published events are public"
  on public.events
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "admins manage events" on public.events;
create policy "admins manage events"
  on public.events
  for all
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'posters',
  'posters',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can read posters" on storage.objects;
create policy "public can read posters"
  on storage.objects
  for select
  to public
  using (bucket_id = 'posters');

drop policy if exists "admins can upload posters" on storage.objects;
create policy "admins can upload posters"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'posters'
    and public.is_admin_user()
  );

drop policy if exists "admins can update posters" on storage.objects;
create policy "admins can update posters"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'posters'
    and public.is_admin_user()
  )
  with check (
    bucket_id = 'posters'
    and public.is_admin_user()
  );

drop policy if exists "admins can delete posters" on storage.objects;
create policy "admins can delete posters"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'posters'
    and public.is_admin_user()
  );
