# ADR 0004: Signup creates the musician profile in the database

- **Status:** Accepted
- **Date:** 2026-11-05

## Context

A login and a musician profile live in two different tables. Supabase Auth owns
`auth.users` (the login). We own `public.musicians` (the profile), linked by
`auth_user_id`.

Lesson 7's own-row policies let a signed-in user read and edit their profile, but
only if a profile row already exists. Nothing created one. Test profiles were
inserted by hand in the SQL Editor.

Constraints already in place:

- The app has **no insert grant** on `musicians` (ADR 0002, Lessons 6–7). This is
  deliberate: a stranger must not be able to invent a profile.
- Signup writes a row to `auth.users`, **not** to `musicians`, so any rule attached
  to `musicians` never sees signup happen.
- At the moment of signup there is often no session yet, so `auth.uid()` has
  nothing to match against.

## Decision

Create the profile with a database trigger on the login table.

- An `after insert` trigger on `auth.users` (`on_auth_user_created`) calls
  `public.handle_new_user()`.
- The function inserts one row into `public.musicians` with
  `auth_user_id = new.id` and `display_name = 'New musician'`.
- The function is `security definer` (runs as the owner, `postgres`) so it can
  insert even though the app cannot, and uses `set search_path = ''` so it only
  touches the fully qualified `public.musicians`.
- A one-time backfill in the same migration gives every existing login without a
  profile a "New musician" row.
- `EXECUTE` is **not** revoked on this function. It `returns trigger`, so it is not
  exposed as a Data API endpoint, and Auth must be able to run it.

## Alternatives considered

1. **An insert policy and grant on `musicians` for `authenticated`.** Rejected.
   It is a rule on the wrong table: signup never touches `musicians`. It would
   also require giving the app insert permission, which ADR 0002 removed on
   purpose, and it depends on a session that may not exist yet at signup.
2. **The app inserts the profile after signup (e.g. a Server Action).** Rejected.
   It needs either an insert grant for the app or the `service_role` key, both of
   which we forbid. It is also two separate steps, so a failure between them
   leaves a login with no profile.
3. **Use the email as the initial `display_name`.** Rejected. `display_name` is
   shown on the public search card, so the email would become public.

## Consequences

**Gains**

- Every login gets exactly one profile, created automatically.
- The app still cannot insert into `musicians`. Profile creation stays on the
  owner side of the line.
- The login and the profile are created in the same transaction: there is no
  window where one exists without the other.
- The email never becomes the public name.

**Costs**

- Because the trigger runs inside the signup transaction, **if the function fails,
  signup fails.** Changes to `handle_new_user` (or to required columns on
  `musicians`) must be tested by creating a user.
- This is our second `security definer` object (after the search card view in
  ADR 0002). The Security Advisor may flag it. Do not "fix" it by revoking
  execute or switching to invoker without revisiting this ADR.
- The logic lives in the database, so it is invisible from the app code. The
  Signup bullet in `AGENTS.md` exists so agents know the app must not insert
  profiles itself.
- New users appear in public search as "New musician" until they rename
  themselves. The backfill already created one such card for an existing test
  login. Filtering placeholder profiles out of search is deferred.

## Related

- Migration: `supabase/migrations/20261105000001_create_musician_on_signup.sql`
- ADR 0002: search card view runs as owner (the same "owner does it, app can't" move, used for a read)
- ADR 0003: a signed-in person may read and edit only their own musicians row
- `AGENTS.md` → Security → Signup