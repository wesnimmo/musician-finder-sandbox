-- supabase/migrations/20260930000002_security_advisor_fixes.sql

-- rls_auto_enable() is internal. It must not be callable through the API.
-- PUBLIC is included because Postgres grants EXECUTE to PUBLIC by default.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- The advisor flags this view as SECURITY DEFINER. That is intentional.
comment on view public.musician_search_cards is
  'SECURITY DEFINER on purpose: computes age from date_of_birth while client roles have no access to public.musicians. Bypasses RLS on musicians, so any row filtering must go in this view''s WHERE clause. Do not set security_invoker = true.';