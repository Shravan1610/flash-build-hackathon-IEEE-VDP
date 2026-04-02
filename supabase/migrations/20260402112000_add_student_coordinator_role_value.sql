do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'app_role'
      and e.enumlabel = 'student_coordinator'
  ) then
    alter type public.app_role add value 'student_coordinator';
  end if;
end
$$;
