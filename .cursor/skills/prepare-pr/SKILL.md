---
name: prepare-pr
description: Get a feature branch ready for the user to push and open a pull request. Use only when the user explicitly asks to prepare a PR (e.g. "/prepare-pr" or "get this ready for a PR"). Verifies the branch, runs the same checks CI runs, confirms nothing is left uncommitted, checks Conventional Commits, and drafts the PR title and description. Never pushes, never opens a PR, never merges.
disable-model-invocation: true
---

# Prepare a pull request

Do all the local, undoable work so the user can push and open the PR in under a
minute, with CI likely to pass on the first run. Then stop.

## Hard boundary

This skill **never** runs `git push`, `gh pr create`, or any merge. That matches
`AGENTS.md` → Push & PR Ownership: agents commit locally only; the user pushes and
opens PRs. The skill ends by handing the user the commands and the PR text.

If any step fails, stop at that step, report what failed and why, and do not
continue to later steps. Do not "fix" a failure by weakening a test, deleting a
check, or using `--no-verify`.

## When to use

- The user explicitly asks to prepare a PR, after finishing a change on a branch.

## When NOT to use

- The user did not ask. Never run this on your own at the end of a task.
- The branch is `main`. Stop and tell the user to create a feature branch first.

## The steps

### 1. Confirm the branch

```bash
git branch --show-current
```

- If it prints `main`, **stop.** Tell the user to create a feature branch
  (`git switch -c feature/<short-name>`) and move the commits there.
- Branch name should follow `AGENTS.md`: `feature/...`, `fix/...`, or `chore/...`.

### 2. Confirm nothing is left behind

```bash
git status --porcelain
```

- Output must be empty. Anything listed is uncommitted work that would **not** be
  in the PR.
- Pay special attention to files that must travel together:
  - A new file in `supabase/migrations/` and `types/supabase.ts` (if the schema's
    shape changed, the regenerated types must be in the same PR, or CI's
    type-check fails).
  - A new ADR in `docs/adr/` and any `AGENTS.md` / `CONTEXT.md` edit it references.
- If anything is uncommitted, list the files and ask the user whether to commit
  them (and with what Conventional Commit type) before continuing.

### 3. Run exactly what CI runs

Read `.github/workflows/ci.yml` and run the same commands locally, in the same
order (typically lint, type-check, unit tests). Use the package manager implied by
the lockfile. Do not invent script names; use the ones in `package.json`.

- All must pass. If one fails, stop and report the failing command and its first
  relevant error.
- Tests run on MSW mocks, so a green run proves the query contract, **not** RLS or
  grants. If this branch changed a migration or policy, remind the user that
  security was verified by impersonation in the SQL Editor, not by these tests.

### 4. Check the commits

```bash
git log --oneline main..HEAD
```

- Every commit uses Conventional Commits (`feat:`, `fix:`, `test:`, `chore:`,
  `docs:`, `refactor:`).
- If a message is off, point it out and suggest a fix. Do not rewrite history
  without the user's go-ahead.

### 5. Draft the PR text

Write a title and description the user can paste into GitHub.

- **Title:** a Conventional Commit-style summary of the whole branch
  (e.g. `feat: create musician profile on signup`).
- **Description**, using this template:

```markdown
## What
One or two sentences on what changed.

## Why
The problem this solves. Link the ADR if there is one (docs/adr/000X-...).

## How it was verified
- CI checks run locally: lint, type-check, tests (all passing)
- Database/security changes: how they were checked (e.g. SQL Editor
  impersonation as anon / authenticated), if applicable

## Notes
Anything the reviewer should know: deferred follow-ups, dashboard-only settings,
Security Advisor items kept on purpose.
```

Keep it short and specific. Never include keys, UUIDs of real users, or emails.

### 6. Hand off and stop

Give the user:

```bash
git push -u origin HEAD
```

then the reminder:

1. Open the **Compare & pull request** banner on GitHub.
2. Confirm **base: `main`** ← **compare: this branch**.
3. Paste the drafted title and description.
4. Wait for CI to pass, then merge with **Create a merge commit**. That's this
   repo's policy (PRs #2–#6 were all merged this way). If the branch has a
   `test:` commit followed by a `feat:` commit, **never squash**: squashing
   collapses the pair into one commit and hides that the test came first.
5. Afterwards: `git switch main`, `git pull`, `git branch -d <branch>`.

Then stop. Do not push, open the PR, or merge.