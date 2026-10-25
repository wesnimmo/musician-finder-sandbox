-- supabase/migrations/20260930000001_musician_search_cards.sql

-- Client roles must not query the full table (the birthday lives here).
revoke all on table public.musicians from anon, authenticated;

-- Public card. Age is computed. Never select date_of_birth,
-- auth_user_id, bio, or spotify_url.
-- Do not add security_invoker = true. That flag makes the view
-- obey the caller's rights on musicians, and we just removed them.
create view public.musician_search_cards as
select
  id,
  display_name,
  zip_code,
  avatar_url,
  primary_instrument_id,
  primary_genre_id,
  extract(year from age(date_of_birth))::int as age
from public.musicians;

grant select on public.musician_search_cards to anon, authenticated;