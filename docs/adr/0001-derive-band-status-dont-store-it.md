# 1. Derive Band Status, Don't Store It

Date: 2026-08-20

## Status

Accepted

## Context

A Band's availability is presented to Musicians as a human-readable state — "seeking members" or "not seeking members" — and is one of the primary things a Musician filters on when searching.

There are two ways to represent this state in the data model:

1. **Store it** as a column on the `bands` table (e.g. `status text` or a `band_status` enum), set explicitly by a Band admin.
2. **Derive it** at read time from the Band's open roles.

The requirements already describe the underlying data that a Band maintains: a set of open roles it is trying to fill (`seeking_members`, chosen from a fixed list such as drummer, guitarist, bassist, vocalist). A Band admin adds a role when they need that position and removes it when it is filled.

This means the "status" is not an independent fact a user needs to maintain — it is a **summary of the open-roles data**:

- If the Band has **one or more open roles** → it is *seeking members*.
- If the Band has **zero open roles** → it is *not seeking members*.

Storing the status separately introduces a second source of truth for the same fact. The stored status and the open-roles list can disagree — a Band could show "not seeking members" while still listing three open roles, or vice versa. Keeping them in sync requires application code, triggers, or discipline that will eventually be violated. This is a classic **derived-data-as-stored-data** anti-pattern.

## Decision

We will **not** store a Band status field. Band status is a **derived value**, computed from the count of the Band's open roles at read time.

- The open roles are the single source of truth (represented by `band_openings`, one row per open role).
- Status is computed as: `seeking_members` when `count(open roles) > 0`, otherwise `not_seeking_members`.
- The derivation is exposed through a database view (or a computed column / query-time expression) so that both search filtering and profile display use the exact same logic, never a re-implementation.

## Consequences

**Positive**

- **Single source of truth.** The open-roles list and the displayed status can never contradict each other, because the status *is* the open-roles list, summarized.
- **No sync code.** No triggers, no `updated_at` races, no "someone forgot to flip the flag" bugs.
- **Search and display agree by construction.** Both read from the same derived expression, so a Band that appears in a "seeking members" search always shows "seeking members" on its profile.
- **Richer data for free.** Because we keep the actual open roles rather than a boolean, search can go finer-grained later ("seeking a drummer specifically") with no schema change.

**Negative / trade-offs**

- **Derivation cost at read time.** Computing status requires a join/aggregate against open roles. For the sandbox's scale this is negligible; if it ever mattered, a materialized view or index resolves it without reintroducing a hand-maintained field.
- **"Status" is no longer directly writable.** A Band admin changes status *indirectly*, by adding or removing open roles. This matches the real-world mental model ("I still need a bassist"), but it does mean there is no single toggle to set.

**Related**

- The same principle applies to **Musician Availability**: the `not_available` state is the *absence* of any active availability value, not a separately stored flag. Both decisions favor representing a state as the natural consequence of underlying data rather than as duplicated, independently-mutable data.
