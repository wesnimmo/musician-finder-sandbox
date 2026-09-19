/**
 * @jest-environment node
 */
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { searchMusicians } from "@/app/actions/searchMusicians"

// Server Actions call `cookies()` via the Supabase server client; Jest has no
// request scope, so stub the cookie store. Do not mock @supabase/ssr — MSW
// owns the REST boundary.
jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => ({
    getAll: () => [],
    set: () => {},
  })),
}))

describe("searchMusicians", () => {
  it("returns musicians matching the given zip code", async () => {
    server.use(
      http.get("*/rest/v1/musicians", ({ request }) => {
        const url = new URL(request.url)
        // Supabase encodes filters as query params: ?zip_code=eq.97201
        expect(url.searchParams.get("zip_code")).toBe("eq.97201")
        return HttpResponse.json([
          {
            id: "11111111-1111-1111-1111-111111111111",
            display_name: "Ada",
            zip_code: "97201",
          },
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
