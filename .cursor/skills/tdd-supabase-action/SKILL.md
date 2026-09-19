---
name: tdd-supabase-action
description: Test-drive a Supabase-backed Server Action (or the hook/component that calls it) in a Next.js app. Use when writing or changing a Server Action, route handler, or data hook that reads from or writes to Supabase. Enforces test-first order, MSW mocking of the /rest/v1 REST layer, per-file Jest environment selection, and a test:/feat: two-commit rhythm.
---

# TDD a Supabase Server Action

Write the failing test first, watch it fail for the right reason, then write the
minimum code to pass. Mock Supabase at the network boundary with MSW so tests
never touch the real database.

## When to use

- Adding or changing a Server Action that reads/writes Supabase (e.g. `searchMusicians`).
- Adding a data hook or a form/component that triggers such an action.
- Any change where "did I break the query contract?" needs a fast, offline answer.

## Core principles

1. **Test first.** No production code until a test exists and fails for the intended reason.
2. **Mock at the network boundary, not the module.** Intercept the Supabase REST
   call with MSW. Do NOT `jest.mock("@supabase/ssr")` — that tests your mock, not your query.
3. **Match the environment to the runtime.** A Server Action runs in node; a
   component runs in the browser. Pick the Jest environment per file (see below).
4. **One handler layer, two entry points.** `mocks/handlers.ts` holds the mocks;
   node tests use `mocks/server.ts`.

## Prerequisites (verify once per project)

- `lib/supabase/server.ts` and `lib/supabase/client.ts` pass a **late-bound** global
  fetch so MSW can intercept in Node:

  ```ts
  { global: { fetch: (...args) => fetch(...args) } }
  ```

  Late binding (`(...args) => fetch(...args)`, not `fetch: fetch`) matters: it resolves
  `globalThis.fetch` at request time, which is the reference MSW patches. A Server
  Action uses the **server** client, so that is the one under test here.
- `jest.setup.ts` starts MSW with `onUnhandledRequest: "error"` so a request that
  slips past a mock fails loudly instead of hitting the network.
- `moduleNameMapper` maps `^@/(.*)$` so `@/mocks/server` resolves under Jest.

## Choosing the Jest environment

`jest.config.ts` keeps `jsdom` as the global default (component tests want a DOM).
Override to node **per file** for a directly-tested Server Action, using a docblock
that must sit above all imports:

```ts
/**
 * @jest-environment node
 */
```

Rule of thumb:
- **Server Action tested directly** → `@jest-environment node`. Matches production and
  avoids jsdom's non-Node `fetch`/`Response` primitives (a real source of MSW-v2 errors).
- **Component/form that triggers the action** → jsdom (no docblock needed).

## The loop

1. **Red.** Write the smallest test that states the contract. Run it; confirm it fails
   because the behavior is missing — not because of a typo or an unmocked request.
2. **Green.** Write the minimum code to pass.
3. **Refactor.** Clean up with the test still green.
4. **Commit in two steps:** `test:` (the failing/So-now-passing test) then `feat:`
   (the implementation), so history shows the test led.

## Recipe A — Server Action, tested directly (primary)

`searchMusicians` reads from Supabase and returns matching rows. Test the action
function itself in node.

```ts
/**
 * @jest-environment node
 */
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { searchMusicians } from "@/app/actions/searchMusicians"

describe("searchMusicians", () => {
  it("returns musicians matching the given zip code", async () => {
    server.use(
      http.get("*/rest/v1/musicians", ({ request }) => {
        const url = new URL(request.url)
        // Supabase encodes filters as query params: ?zip_code=eq.97201
        expect(url.searchParams.get("zip_code")).toBe("eq.97201")
        return HttpResponse.json([
          { id: "11111111-1111-1111-1111-111111111111", display_name: "Ada", zip_code: "97201" },
        ])
      }),
    )

    const result = await searchMusicians({ zip: "97201" })

    expect(result).toHaveLength(1)
    expect(result[0].display_name).toBe("Ada")
  })

  it("surfaces an error when Supabase responds with a failure", async () => {
    server.use(
      http.get("*/rest/v1/musicians", () =>
        HttpResponse.json({ message: "boom" }, { status: 500 }),
      ),
    )

    await expect(searchMusicians({ zip: "97201" })).rejects.toThrow()
  })
})
```

Notes:
- **Wildcard URL** (`*/rest/v1/musicians`), never a hardcoded project URL — the test
  stays green regardless of which Supabase project/env is loaded.
- Assert the **filter** (`zip_code=eq.…`), because that is the actual query contract;
  a passing test that ignores the filter would pass even if the query were wrong.
- Column names come from the real schema (`display_name`, `zip_code`). There is no
  `status`/`genre`/`instrument` column on `musicians` — those are join tables and
  derived values, so do not invent flat columns in fixtures.

## Recipe B — Component/form that triggers the action (secondary)

Same endpoint, one layer up. Runs in jsdom; assert what the user sees.

```ts
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { MusicianSearch } from "@/components/musician-search"

it("shows results after the user searches by zip", async () => {
  server.use(
    http.get("*/rest/v1/musicians", () =>
      HttpResponse.json([
        { id: "11111111-1111-1111-1111-111111111111", display_name: "Ada", zip_code: "97201" },
      ]),
    ),
  )

  render(<MusicianSearch />)
  await userEvent.type(screen.getByLabelText(/zip/i), "97201")
  await userEvent.click(screen.getByRole("button", { name: /search/i }))

  expect(await screen.findByText("Ada")).toBeInTheDocument()
})
```

## Common failures

- **Test hits the real network / `onUnhandledRequest` error.** The client captured a
  non-global fetch, or the URL/method doesn't match a handler. Check the late-bound
  fetch and the handler path/verb.
- **`Response is not defined` / primitive mismatches.** A Server Action test is running
  in jsdom — add the `@jest-environment node` docblock.
- **Test passes but the query is wrong.** You didn't assert the filter params. Assert them.