import "@testing-library/jest-dom"

// Fallback when .env.local is absent (CI) — MSW matches */rest/v1/… so the host
// only needs to be a valid URL, not a real project.
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321"
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key"

// MSW Node interceptor belongs with Server Action tests (`@jest-environment node`).
// Loading it under jsdom requires undici polyfills that leave open handles.
if (typeof window === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { server } = require("@/mocks/server") as typeof import("@/mocks/server")

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())
}
