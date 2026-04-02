do $$
begin
  alter type public.app_role add value if not exists 'student_coordinator';
exception
  when duplicate_object then null;
end
$$;
