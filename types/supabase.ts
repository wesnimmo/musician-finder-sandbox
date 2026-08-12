/**
 * Placeholder database types.
 *
 * Replace this file by running the Supabase CLI against the real project:
 *   npx supabase gen types typescript --project-id <project-id> --schema public > types/supabase.ts
 *
 * Do not hand-write table shapes here once a real Supabase project exists;
 * always regenerate so this stays in sync with the schema + RLS policies.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
