# Musician Finder

A location-aware platform for musicians to find and connect with each other based on location, instrument, genre, and current activity.

> **Status:** Sandbox. This repository is a learning sandbox for practicing AI-architected software engineering (Next.js + Tailwind + Supabase, TDD, MSW). The production Musician Finder will be built separately; decisions here optimize for clarity and correct modeling over completeness.

## Language

The shared vocabulary for this project. Use these terms exactly — in code, schema, tests, and conversation — so the domain stays unambiguous.

**Musician**: A registered user with a searchable profile — instrument, genre, zip code, display info. One authenticated account maps to exactly one Musician.
_Avoid_: User, Profile, Artist

**Band**: A group of Musicians with its own profile, independent of any single member's Musician profile. A Band is created and administered by one or more Musicians but is a distinct entity.
_Avoid_: Group

**Band Admin**: A Musician who owns/manages a Band. A Musician may administer multiple Bands; a Band may have multiple admins.
_Avoid_: Owner (implies a single person), Page Owner

**Band Member**: A person listed in a Band's roster, shown as _name + instrument_. A member **may or may not** be a registered Musician:
- **Linked member** — the roster row references a real Musician; the name renders as a link with a hover profile card.
- **Unlinked member** — the roster row stores only free text (a name the app doesn't know yet); rendered as plain text, no hover card. Can be "claimed" later if that person registers.
_Avoid_: Bandmate, Player

**Band Affiliation**: The link from a Musician to the Band they play in. Mirrors membership: it may point to a **registered Band** (hover shows the Band card) or be a **free-text band name** (plain text, no card).
_Avoid_: Membership (reserved for the roster direction)

**Instrument**: A lookup value (guitar, bass, drums…). A Musician has one **primary instrument** (shown on the profile) and any number of **secondary instruments** (shown in detail).
_Avoid_: Skill

**Genre**: A lookup value (rock, jazz, funk…). A Musician has one **primary genre** plus secondary genres. A **Band has exactly one genre.**
_Avoid_: Style, Category

**Musician Availability**: A Musician's current activity, expressed as **one or more** values from a fixed set: `looking_to_join_band`, `session_work`, `lessons`, `touring`, `casual_jamming`, `not_available`. Availability is **multi-select**, with one invariant: `not_available` is **exclusive** — it cannot be combined with any other value. A Musician with no other availability selected is treated as `not_available`.
_Avoid_: Status (too generic)

**Band Status**: Whether a Band is seeking members. **Derived, never stored** — a Band is "seeking members" when it has one or more open roles, otherwise "not seeking members." See `docs/adr/0001-derive-band-status-dont-store-it.md`.
_Avoid_: Availability (that word belongs to Musicians)

**Open Role**: A role a Band is trying to fill (drummer, vocalist…), chosen from a pre-populated role list. The presence of Open Roles is what makes a Band's derived status "seeking members."
_Avoid_: Vacancy, Opening (informally)

**Connection**: The message thread between two Musicians. Any Musician may send a first message, which creates a `pending` Connection that lands in the recipient's **requests** area; when they reply it becomes `accepted` and graduates to a normal conversation (hybrid model — the first message _is_ the request). `declined` / `blocked` cover the safety cases. Exactly one Connection exists per pair. See `docs/data-model.md`.
_Avoid_: Friend, Follow

**Influence**: An artist or band that shaped a Musician's or Band's sound, shown as a ranked list of **up to 5** (fewer allowed — the cap is a ceiling, not a quota). Free text in v1; not linked to registered Bands or an external catalog yet.
_Avoid_: Inspiration, Reference

**Gig**: A Band's booking — date, venue, location — spanning past through upcoming.
_Avoid_: Show, Event

**Zip / Location Search**: US-only. Each Musician and Band stores a zip code geocoded to latitude/longitude so search can match by radius ("within X miles"), not just exact zip.
_Avoid_: Address, Region

## Users

- **Musicians** discovering other Musicians and Bands by location, instrument, genre, and current activity.
- **Band Admins** (Musicians) maintaining a Band profile, roster, open roles, and gigs.

## Identity model (key decision)

Every account is a **Musician**. A **Band is a Page-style entity** owned by one or more Musicians — it has no login of its own. This gives the app a single identity graph (Musicians are the nodes, Bands are groupings), which is what makes the cross-linking hover cards work:
- On a Band profile, linked Band Members hover to their Musician card.
- On a Musician profile, a registered Band Affiliation hovers to that Band's card.

Registration may _present_ a "create a Musician profile / register a Band" choice as UX, but under the hood registering a Band always requires a logged-in Musician.

## Scope

**In scope (v1 data model):** Musician profiles, Band profiles, roster with linked/unlinked members, instruments & genres, Musician availability, ranked influences (Musician and Band), Spotify playlist embed, derived Band status with open roles, gigs, zip-radius search, Connections, and hybrid messaging.

**Out of scope (future direction — deliberately deferred):**

_New entities / features:_
- **Venues as an entity + account type.** Venues want free exposure to local audiences, creating a growth/SEO flywheel (venues → gig listings → local search traffic → musicians). Gigs would upgrade from free-text `venue` to a nullable `venue_id` link, reusing the existing nullable-link + hover-card pattern (registered venue → hover card; otherwise plain text). A new discovery surface ("browse venues near me") follows.
- Richer Spotify integration (autocomplete influences against the official Spotify Web API to store canonical artist IDs; enables "shared influence" match signals).
- Linking influences to registered Bands (nullable `band_id` on the influence tables).
- Gear buy/sell marketplace.
- Lessons marketplace (background checks, reviews/ratings, payments).
- Band press kits.
- International (non-US) location search.

_Access policy (auth phase, not schema):_
- **Anonymous / tiered browsing.** Logged-out visitors could browse public Band (and later Venue) pages and view details like upcoming gigs, but not individual Musician pages (protecting individuals, especially since profiles carry age), and could not message. This is an **authorization concern** enforced via Supabase RLS + route guards — it changes no columns. It also ties into SEO: public Band/Venue pages are indexable, gated Musician pages are not.

Naming these as deferred is intentional: the v1 model leaves clean room to add them without reshaping the core. Note the deliberate split between **new entities** (schema changes, e.g. Venues) and **access policy** (RLS/route guards, e.g. anonymous browsing) — they are designed in different phases.

## Tech stack

- **Framework:** Next.js (App Router) + TypeScript + Tailwind
- **Backend:** Supabase (Postgres, Auth, RLS)
- **Testing:** TDD with MSW for API mocking
- **Types:** generated from the Supabase schema into `@/types/supabase` — schema is the source of truth
