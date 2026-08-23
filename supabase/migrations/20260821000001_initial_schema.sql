-- Musician Finder — initial schema
-- Translated from docs/data-model.md. Terminology follows CONTEXT.md.
-- Key modeling decisions are recorded in docs/adr/.
--
-- Ordering: enums, then lookup tables (no deps), then musicians, then bands,
-- then the join/child tables, then messaging. FKs only ever point "backwards".

-- ---------------------------------------------------------------------------
-- Enums (fixed, developer-owned sets — see CONTEXT.md "lookup table vs enum")
-- ---------------------------------------------------------------------------
create type proficiency as enum ('beginner', 'intermediate', 'advanced', 'pro');

create type availability_type as enum (
  'looking_to_join_band',
  'session_work',
  'lessons',
  'touring',
  'casual_jamming',
  'not_available'
);

create type member_status as enum ('member', 'invited', 'pending');

create type connection_status as enum ('pending', 'accepted', 'declined', 'blocked');

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at current on mutation
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Lookup tables (grow via INSERT, not migration — see data-model.md)
-- ---------------------------------------------------------------------------
create table public.zip_codes (
  zip        text primary key,
  latitude   numeric not null,
  longitude  numeric not null,
  city       text not null,
  state      text not null
);

create table public.instruments (
  id       uuid primary key default gen_random_uuid(),
  name     text not null unique,
  slug     text not null unique,
  category text -- brass | strings | percussion | keys | vocals | ...
);

create table public.genres (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

-- ---------------------------------------------------------------------------
-- Musicians (one per auth user)
-- date_of_birth is stored; age is DERIVED at read time (never stored).
-- affiliated_band_name is free text ONLY for an unregistered band; a registered
-- band affiliation is derived from band_members (see ADR 0001 sibling note).
-- ---------------------------------------------------------------------------
create table public.musicians (
  id                    uuid primary key default gen_random_uuid(),
  auth_user_id          uuid not null unique references auth.users(id) on delete cascade,
  display_name          text not null,
  date_of_birth         date,
  zip_code              text references public.zip_codes(zip) on delete set null,
  bio                   text,
  avatar_url            text,
  spotify_url           text,
  primary_instrument_id uuid references public.instruments(id) on delete set null,
  primary_genre_id      uuid references public.genres(id) on delete set null,
  affiliated_band_name  text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger musicians_set_updated_at
  before update on public.musicians
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Bands (owned by a musician). No status column — status is DERIVED from
-- whether band_openings has rows (ADR 0001). Exactly one genre.
-- ---------------------------------------------------------------------------
create table public.bands (
  id                uuid primary key default gen_random_uuid(),
  owner_musician_id uuid not null references public.musicians(id) on delete cascade,
  name              text not null,
  zip_code          text references public.zip_codes(zip) on delete set null,
  bio               text,
  avatar_url        text,
  genre_id          uuid not null references public.genres(id) on delete restrict,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger bands_set_updated_at
  before update on public.bands
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Musician <-> instrument (join table). is_primary flags the card instrument;
-- at most one primary per musician (partial unique index).
-- ---------------------------------------------------------------------------
create table public.musician_instruments (
  musician_id   uuid not null references public.musicians(id) on delete cascade,
  instrument_id uuid not null references public.instruments(id) on delete cascade,
  proficiency   proficiency,
  is_primary    boolean not null default false,
  primary key (musician_id, instrument_id)
);

create unique index musician_instruments_one_primary
  on public.musician_instruments (musician_id)
  where is_primary;

-- Musician <-> genre (join table)
create table public.musician_genres (
  musician_id uuid not null references public.musicians(id) on delete cascade,
  genre_id    uuid not null references public.genres(id) on delete cascade,
  primary key (musician_id, genre_id)
);

-- Musician availability (join table; multi-select over the enum).
-- Invariant "not_available is exclusive" is enforced in app logic, not schema.
create table public.musician_availability (
  musician_id  uuid not null references public.musicians(id) on delete cascade,
  availability availability_type not null,
  primary key (musician_id, availability)
);

-- ---------------------------------------------------------------------------
-- Influences — ranked free text in v1 (see data-model.md future scope).
-- rank is a ceiling of 5; fewer allowed; unique per owner.
-- ---------------------------------------------------------------------------
create table public.musician_influences (
  id             uuid primary key default gen_random_uuid(),
  musician_id    uuid not null references public.musicians(id) on delete cascade,
  influence_name text not null,
  rank           int not null check (rank between 1 and 5),
  unique (musician_id, rank)
);

create table public.band_influences (
  id             uuid primary key default gen_random_uuid(),
  band_id        uuid not null references public.bands(id) on delete cascade,
  influence_name text not null,
  rank           int not null check (rank between 1 and 5),
  unique (band_id, rank)
);

-- ---------------------------------------------------------------------------
-- Band roster. musician_id is nullable: null = unregistered member (show
-- member_name as plain text); set = registered member (hover card, claimable).
-- A row must identify the member one way or the other.
-- is_primary flags the band shown on the musician's hover card: at most one
-- primary band per (registered) musician.
-- ---------------------------------------------------------------------------
create table public.band_members (
  id            uuid primary key default gen_random_uuid(),
  band_id       uuid not null references public.bands(id) on delete cascade,
  musician_id   uuid references public.musicians(id) on delete set null,
  member_name   text,
  instrument_id uuid references public.instruments(id) on delete set null,
  role          text,
  is_primary    boolean not null default false,
  status        member_status not null default 'member',
  joined_at     timestamptz not null default now(),
  constraint band_members_identified check (musician_id is not null or member_name is not null)
);

create unique index band_members_one_primary
  on public.band_members (musician_id)
  where is_primary and musician_id is not null;

-- Band openings — the presence of rows here IS the "seeking members" status.
create table public.band_openings (
  id            uuid primary key default gen_random_uuid(),
  band_id       uuid not null references public.bands(id) on delete cascade,
  instrument_id uuid not null references public.instruments(id) on delete restrict,
  description   text,
  created_at    timestamptz not null default now()
);

-- Band gigs. venue is free text in v1; future: nullable venue_id (see CONTEXT.md).
create table public.band_gigs (
  id       uuid primary key default gen_random_uuid(),
  band_id  uuid not null references public.bands(id) on delete cascade,
  gig_date date not null,
  venue    text,
  city     text,
  zip_code text
);

-- ---------------------------------------------------------------------------
-- Messaging (hybrid model). A connection is the THREAD between a pair; the
-- first message creates it as 'pending'. Exactly one connection per unordered
-- pair (enforced by the least/greatest unique index). A musician cannot
-- connect with themselves.
-- ---------------------------------------------------------------------------
create table public.connections (
  id           uuid primary key default gen_random_uuid(),
  initiator_id uuid not null references public.musicians(id) on delete cascade,
  addressee_id uuid not null references public.musicians(id) on delete cascade,
  status       connection_status not null default 'pending',
  created_at   timestamptz not null default now(),
  responded_at timestamptz,
  constraint connections_distinct check (initiator_id <> addressee_id)
);

create unique index connections_unique_pair
  on public.connections (least(initiator_id, addressee_id), greatest(initiator_id, addressee_id));

create table public.messages (
  id            uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.connections(id) on delete cascade,
  sender_id     uuid not null references public.musicians(id) on delete cascade,
  body          text not null,
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);

-- Helpful indexes for the hot query paths (search & inbox)
create index musicians_zip_idx           on public.musicians (zip_code);
create index bands_zip_idx               on public.bands (zip_code);
create index band_members_band_idx       on public.band_members (band_id);
create index band_members_musician_idx   on public.band_members (musician_id);
create index band_openings_band_idx      on public.band_openings (band_id);
create index band_gigs_band_idx          on public.band_gigs (band_id);
create index messages_connection_idx     on public.messages (connection_id);
create index connections_initiator_idx   on public.connections (initiator_id);
create index connections_addressee_idx   on public.connections (addressee_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- RLS is ENABLED on every table (deny-by-default). Reference/lookup data is
-- world-readable; user-data policies (musicians, bands, messaging, etc.) are
-- authored in the AUTH phase and intentionally deferred here (see CONTEXT.md
-- "anonymous / tiered browsing"). With no policy, a table returns zero rows —
-- that is expected, not a bug.
-- ---------------------------------------------------------------------------
alter table public.zip_codes            enable row level security;
alter table public.instruments          enable row level security;
alter table public.genres               enable row level security;
alter table public.musicians            enable row level security;
alter table public.bands                enable row level security;
alter table public.musician_instruments enable row level security;
alter table public.musician_genres      enable row level security;
alter table public.musician_availability enable row level security;
alter table public.musician_influences  enable row level security;
alter table public.band_influences      enable row level security;
alter table public.band_members         enable row level security;
alter table public.band_openings        enable row level security;
alter table public.band_gigs            enable row level security;
alter table public.connections          enable row level security;
alter table public.messages             enable row level security;

-- Public read on reference data (safe to expose; needed for search filters).
create policy zip_codes_public_read   on public.zip_codes   for select using (true);
create policy instruments_public_read on public.instruments for select using (true);
create policy genres_public_read      on public.genres      for select using (true);
