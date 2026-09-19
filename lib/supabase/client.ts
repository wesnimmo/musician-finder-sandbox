import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

/**
 * Supabase client for use in Client Components (browser).
 * Never import this from Server Components or Server Actions — use
 * `@/lib/supabase/server` there instead.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Secure cookies in production; not in dev, so localhost still works.
      cookieOptions: { secure: process.env.NODE_ENV === "production" },
      global: {
        // Late-bound global fetch: resolves globalThis.fetch at call time, so
        // MSW's Node interceptor (which patches the global fetch) can see the
        // request in tests. Without this the client may capture a fetch
        // reference MSW never replaced, and mocks silently never fire.
        fetch: (...args) => fetch(...args),
      },
    },
  )
}