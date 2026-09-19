"use server"

import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/supabase"

type Musician = Database["public"]["Tables"]["musicians"]["Row"]

export async function searchMusicians({
  zip,
}: {
  zip: string
}): Promise<Musician[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("musicians")
    .select("*")
    .eq("zip_code", zip)

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}
