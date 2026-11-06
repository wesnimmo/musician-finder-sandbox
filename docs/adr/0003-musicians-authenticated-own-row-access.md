# 3. Authenticated musicians get direct row-level access to their own profile

- **Status:** Accepted
- **Date:** 2026-10-27

## Context

[ADR 0002](./0002-security-definer-search-view.md) revoked all privileges on `public.musicians`
from `anon` and `authenticated`, and routed public search through the
`musician_search_cards` view instead. That view is read-only, exposes only card fields, and
is scoped to "every visitor, limited columns" — it has no concept of "this is my own row."

A signed-in Musician now needs to:

1. Read their **own full row**, including fields the search view intentionally omits
   (`date_of_birth`, `spotify_url`, `bio`, `auth_user_id`).
2. **Update** their own row (editing their profile).

The search view can't serve either need: extending it to be writable would require an
`INSTEAD OF` trigger just to re-implement row ownership checks that Postgres RLS already
does natively on the base table.

## Decision

Grant `select, update` on `public.musicians` directly to the `authenticated` role, and add
two RLS policies scoped to row ownership:

- `musicians_select_own` — `for select ... using (auth.uid() = auth_user_id)`
- `musicians_update_own` — `for update ... using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id)`

`anon` remains fully revoked on `public.musicians`, unchanged from ADR 0002. Public search
continues to go exclusively through `musician_search_cards`.

The `with check` clause on the update policy is load-bearing, not boilerplate: without it, a
user could update their own row and reassign `auth_user_id` to someone else's `auth.users`
id. `with check` re-evaluates `auth.uid() = auth_user_id` against the **post-update** row, so
a user can only ever "move" a row to still belong to themselves.

Two access paths to the same table now coexist by design:

| Path | Who | Rows | Columns | Mutable? |
|---|---|---|---|---|
| `musician_search_cards` | anyone (`anon`/`authenticated`) | all musicians | card fields + derived `age` | no |
| `public.musicians` | `authenticated` only | caller's own row | all columns | yes (own row) |

## Alternatives considered

**Make the search view updatable via `INSTEAD OF` triggers.** Would let clients keep using
one entry point, but the trigger would have to hand-roll the exact ownership check RLS gives
for free on the base table, plus maintain SECURITY DEFINER semantics correctly for writes.
More moving parts for no benefit. Rejected.

**A `SECURITY DEFINER` RPC function for profile updates.** Viable, but it bypasses RLS
entirely and shifts the ownership check into function body logic that has to be audited by
hand instead of declaratively, the way ADR 0002's function-vs-view tradeoff was framed.
Native RLS on a direct table grant is simpler and auditable from the policy list alone.
Rejected for this case (unlike the search view, there's no need to hide `date_of_birth` from
the row's own owner).

**Grant `authenticated` broad `select`/`update` without an ownership-scoped policy.** Would
let any signed-in user read or edit *any* musician's row. Rejected immediately — this is
exactly what RLS exists to prevent.

## Consequences

- Client code for the profile page/edit form can call `.from("musicians")` directly when
  acting on the current user's own row, instead of going through `musician_search_cards` or
  an RPC.
- Any future `insert`/`delete` grant on `public.musicians` needs the same scrutiny and an
  equivalent `auth.uid() = auth_user_id` policy — don't assume RLS is "already handled"
  because `select`/`update` are covered.
- `anon` access to `public.musicians` is unaffected and must stay revoked; only
  `musician_search_cards` is the public read surface.

## Verification

Manually tested in the Supabase project:

- Authenticated user, own row: `select` and `update` succeed.
- Authenticated user, another musician's row: `select`/`update` return zero rows affected
  (RLS filters it out).
- Unauthenticated (`anon`) request: no access, per ADR 0002 (unchanged by this migration).

## Related

- [ADR 0002](./0002-security-definer-search-view.md) — the public read surface this
  complements.
- Migration: `supabase/migrations/20261027000001_musicians_update_own.sql`
