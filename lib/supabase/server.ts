import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

/**
 * Supabase client for use in Server Components, Route Handlers, and Server
 * Actions. Especially important with Fluid compute: never store this in a
 * global variable — create a new client inside each function that uses it.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
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
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component. Safe to ignore when a proxy
            // (middleware) is refreshing user sessions.
          }
        },
      },
    },
  )
}