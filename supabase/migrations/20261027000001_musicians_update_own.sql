-- supabase/migrations/20261027000001_musicians_update_own.sql

-- anon stays revoked (Lesson 6). Signed-in users get read + update only.
grant select, update on table public.musicians to authenticated;

create policy musicians_select_own
on public.musicians
for select
to authenticated
using ( (select auth.uid()) = auth_user_id );

create policy musicians_update_own
on public.musicians
for update
to authenticated
using ( (select auth.uid()) = auth_user_id )
with check ( (select auth.uid()) = auth_user_id );