-- Fix: make the handle_new_user trigger bullet-proof
-- Run this in Supabase SQL editor

create or replace function handle_new_user()
returns trigger as $$
declare
  _role user_role := 'student';
  _raw_role text;
begin
  -- Safely extract role from metadata
  _raw_role := new.raw_user_meta_data->>'role';

  -- Only cast if it's a valid enum value
  if _raw_role in ('student', 'practitioner', 'educator', 'admin') then
    _role := _raw_role::user_role;
  end if;

  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    _role
  )
  on conflict (id) do update
    set
      email = excluded.email,
      name = coalesce(excluded.name, profiles.name),
      updated_at = now();

  return new;
end;
$$ language plpgsql security definer;

-- Also disable email confirmation so signup works immediately
-- (You can also do this in Supabase dashboard: Auth → Settings → disable email confirmation)
