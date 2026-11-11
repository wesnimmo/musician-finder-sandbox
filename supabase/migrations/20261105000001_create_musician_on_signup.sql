-- supabase/migrations/20261105000001_create_musician_on_signup.sql

-- Follow-up: after a login row is created, create the profile.
-- Runs as the owner, because the app is not allowed to insert.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.musicians (auth_user_id, display_name)
  values (new.id, 'New musician');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- People who already have a login do not trip an "after insert" follow-up.
-- Give each of them a profile if they do not already have one.
insert into public.musicians (auth_user_id, display_name)
select u.id, 'New musician'
from auth.users as u
where not exists (
  select 1 from public.musicians as m where m.auth_user_id = u.id
);