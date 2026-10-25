"use server"

import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/supabase"

type MusicianSearchCard =
  Database["public"]["Views"]["musician_search_cards"]["Row"]

export async function searchMusicians({
  zip,
}: {
  zip: string
}): Promise<MusicianSearchCard[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("musician_search_cards")
    .select(
      "id, display_name, zip_code, avatar_url, primary_instrument_id, primary_genre_id, age",
    )
    .eq("zip_code", zip)

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}
