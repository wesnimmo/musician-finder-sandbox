# 2. Musician search cards use a SECURITY DEFINER view

- **Status:** Accepted
- **Date:** 2026-11-03

## Context

Supabase exposes every table in the `public` schema through its REST API. Any role with
`SELECT` on a table can read it straight from the browser, so database permissions are the
only real lock.

The `musicians` table stores sensitive fields: `date_of_birth`, `auth_user_id`, `bio`, and
`spotify_url`. Public search needs only the card fields, plus the musician's **age**, which
is shown on the card on purpose.

Migration `20260930000001_musician_search_cards.sql` therefore:

1. Revokes all privileges on `public.musicians` from `anon` and `authenticated`.
2. Creates the view `public.musician_search_cards`, which returns only card fields and
   computes `age` from `date_of_birth` without returning the birthdate.
3. Grants `SELECT` on the view to `anon` and `authenticated`.

The view is created without `security_invoker`, so it runs with the rights of its owner
(`postgres`). The Supabase Security Advisor flags this as an error: *"View is defined with
the SECURITY DEFINER property."*

## Decision

Keep the view as SECURITY DEFINER on purpose, and accept the advisor error as a known,
documented exception.

The view has to read `date_of_birth` to compute age. Client roles must not be able to read
`date_of_birth`. Only a view that runs with its owner's rights can satisfy both.

## Alternatives considered

**`security_invoker = true` (what the advisor suggests).** The view would then run with the
caller's rights on `musicians`. We just revoked those, so every query would fail. Getting it
working would mean granting `anon` read access to `date_of_birth`, which is the exact field
we're protecting. Rejected: it reopens the hole the view exists to close.

**Store `age` as a column.** Violates "derive, don't store": age changes every birthday, so
it would need a scheduled job to stay correct. Rejected.

**A separate public table kept in sync by triggers.** Duplicates data and adds sync logic
that can drift. Rejected as more moving parts for the same result.

**A SECURITY DEFINER function called over RPC.** Viable, with the same security model as
the view. It changes the client call from `.from("musician_search_cards")` to `.rpc(...)`
and makes filtering and pagination harder. Rejected for now; worth revisiting if search
logic grows (ranking, distance by zip).

## Consequences

- **Row Level Security on `musicians` does not apply to this view.** Every row in
  `musicians` appears as a public card. That's intended today. If some musicians should
  ever be hidden (a "not searchable" flag, soft-deleted accounts), the filter **must go in
  the view's `WHERE` clause**, because RLS policies won't apply.
- **The column list is the security boundary.** Adding a column to the view publishes it to
  every visitor. Review every change to this view as a security change.
- **Do not add `security_invoker = true`** to "fix" the advisor error. The migration has a
  comment saying so, for future developers and AI agents.
- **The view must stay owned by `postgres`** (or another role that can read `musicians`).
- The advisor will keep reporting this error. It's accepted and recorded here.

## Verification

Run in the SQL Editor with the role set to `anon`:

- `select date_of_birth from public.musicians limit 1;` → `permission denied for table musicians` ✅
- `select * from public.musician_search_cards limit 1;` → succeeds ✅

## Related

- Migration: `supabase/migrations/20260930000001_musician_search_cards.sql`
- Same branch: `EXECUTE` on `public.rls_auto_enable()` revoked from `anon` and
  `authenticated` (resolves the two advisor warnings). That's a routine lockdown, not an
  architectural decision, so it doesn't get its own ADR.