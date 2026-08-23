export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      band_gigs: {
        Row: {
          band_id: string
          city: string | null
          gig_date: string
          id: string
          venue: string | null
          zip_code: string | null
        }
        Insert: {
          band_id: string
          city?: string | null
          gig_date: string
          id?: string
          venue?: string | null
          zip_code?: string | null
        }
        Update: {
          band_id?: string
          city?: string | null
          gig_date?: string
          id?: string
          venue?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "band_gigs_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
        ]
      }
      band_influences: {
        Row: {
          band_id: string
          id: string
          influence_name: string
          rank: number
        }
        Insert: {
          band_id: string
          id?: string
          influence_name: string
          rank: number
        }
        Update: {
          band_id?: string
          id?: string
          influence_name?: string
          rank?: number
        }
        Relationships: [
          {
            foreignKeyName: "band_influences_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
        ]
      }
      band_members: {
        Row: {
          band_id: string
          id: string
          instrument_id: string | null
          is_primary: boolean
          joined_at: string
          member_name: string | null
          musician_id: string | null
          role: string | null
          status: Database["public"]["Enums"]["member_status"]
        }
        Insert: {
          band_id: string
          id?: string
          instrument_id?: string | null
          is_primary?: boolean
          joined_at?: string
          member_name?: string | null
          musician_id?: string | null
          role?: string | null
          status?: Database["public"]["Enums"]["member_status"]
        }
        Update: {
          band_id?: string
          id?: string
          instrument_id?: string | null
          is_primary?: boolean
          joined_at?: string
          member_name?: string | null
          musician_id?: string | null
          role?: string | null
          status?: Database["public"]["Enums"]["member_status"]
        }
        Relationships: [
          {
            foreignKeyName: "band_members_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "band_members_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "band_members_musician_id_fkey"
            columns: ["musician_id"]
            isOneToOne: false
            referencedRelation: "musicians"
            referencedColumns: ["id"]
          },
        ]
      }
      band_openings: {
        Row: {
          band_id: string
          created_at: string
          description: string | null
          id: string
          instrument_id: string
        }
        Insert: {
          band_id: string
          created_at?: string
          description?: string | null
          id?: string
          instrument_id: string
        }
        Update: {
          band_id?: string
          created_at?: string
          description?: string | null
          id?: string
          instrument_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "band_openings_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "band_openings_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
        ]
      }
      bands: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          genre_id: string
          id: string
          name: string
          owner_musician_id: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          genre_id: string
          id?: string
          name: string
          owner_musician_id: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          genre_id?: string
          id?: string
          name?: string
          owner_musician_id?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bands_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bands_owner_musician_id_fkey"
            columns: ["owner_musician_id"]
            isOneToOne: false
            referencedRelation: "musicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bands_zip_code_fkey"
            columns: ["zip_code"]
            isOneToOne: false
            referencedRelation: "zip_codes"
            referencedColumns: ["zip"]
          },
        ]
      }
      connections: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          initiator_id: string
          responded_at: string | null
          status: Database["public"]["Enums"]["connection_status"]
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          initiator_id: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          initiator_id?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
        }
        Relationships: [
          {
            foreignKeyName: "connections_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "musicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "musicians"
            referencedColumns: ["id"]
          },
        ]
      }
      genres: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      instruments: {
        Row: {
          category: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          category?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          category?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          connection_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          body: string
          connection_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          body?: string
          connection_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "musicians"
            referencedColumns: ["id"]
          },
        ]
      }
      musician_availability: {
        Row: {
          availability: Database["public"]["Enums"]["availability_type"]
          musician_id: string
        }
        Insert: {
          availability: Database["public"]["Enums"]["availability_type"]
          musician_id: string
        }
        Update: {
          availability?: Database["public"]["Enums"]["availability_type"]
          musician_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "musician_availability_musician_id_fkey"
            columns: ["musician_id"]
            isOneToOne: false
            referencedRelation: "musicians"
            referencedColumns: ["id"]
          },
        ]
      }
      musician_genres: {
        Row: {
          genre_id: string
          musician_id: string
        }
        Insert: {
          genre_id: string
          musician_id: string
        }
        Update: {
          genre_id?: string
          musician_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "musician_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "musician_genres_musician_id_fkey"
            columns: ["musician_id"]
            isOneToOne: false
            referencedRelation: "musicians"
            referencedColumns: ["id"]
          },
        ]
      }
      musician_influences: {
        Row: {
          id: string
          influence_name: string
          musician_id: string
          rank: number
        }
        Insert: {
          id?: string
          influence_name: string
          musician_id: string
          rank: number
        }
        Update: {
          id?: string
          influence_name?: string
          musician_id?: string
          rank?: number
        }
        Relationships: [
          {
            foreignKeyName: "musician_influences_musician_id_fkey"
            columns: ["musician_id"]
            isOneToOne: false
            referencedRelation: "musicians"
            referencedColumns: ["id"]
          },
        ]
      }
      musician_instruments: {
        Row: {
          instrument_id: string
          is_primary: boolean
          musician_id: string
          proficiency: Database["public"]["Enums"]["proficiency"] | null
        }
        Insert: {
          instrument_id: string
          is_primary?: boolean
          musician_id: string
          proficiency?: Database["public"]["Enums"]["proficiency"] | null
        }
        Update: {
          instrument_id?: string
          is_primary?: boolean
          musician_id?: string
          proficiency?: Database["public"]["Enums"]["proficiency"] | null
        }
        Relationships: [
          {
            foreignKeyName: "musician_instruments_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "musician_instruments_musician_id_fkey"
            columns: ["musician_id"]
            isOneToOne: false
            referencedRelation: "musicians"
            referencedColumns: ["id"]
          },
        ]
      }
      musicians: {
        Row: {
          affiliated_band_name: string | null
          auth_user_id: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string
          id: string
          primary_genre_id: string | null
          primary_instrument_id: string | null
          spotify_url: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          affiliated_band_name?: string | null
          auth_user_id: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name: string
          id?: string
          primary_genre_id?: string | null
          primary_instrument_id?: string | null
          spotify_url?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          affiliated_band_name?: string | null
          auth_user_id?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string
          id?: string
          primary_genre_id?: string | null
          primary_instrument_id?: string | null
          spotify_url?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "musicians_primary_genre_id_fkey"
            columns: ["primary_genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "musicians_primary_instrument_id_fkey"
            columns: ["primary_instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "musicians_zip_code_fkey"
            columns: ["zip_code"]
            isOneToOne: false
            referencedRelation: "zip_codes"
            referencedColumns: ["zip"]
          },
        ]
      }
      zip_codes: {
        Row: {
          city: string
          latitude: number
          longitude: number
          state: string
          zip: string
        }
        Insert: {
          city: string
          latitude: number
          longitude: number
          state: string
          zip: string
        }
        Update: {
          city?: string
          latitude?: number
          longitude?: number
          state?: string
          zip?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      availability_type:
        | "looking_to_join_band"
        | "session_work"
        | "lessons"
        | "touring"
        | "casual_jamming"
        | "not_available"
      connection_status: "pending" | "accepted" | "declined" | "blocked"
      member_status: "member" | "invited" | "pending"
      proficiency: "beginner" | "intermediate" | "advanced" | "pro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      availability_type: [
        "looking_to_join_band",
        "session_work",
        "lessons",
        "touring",
        "casual_jamming",
        "not_available",
      ],
      connection_status: ["pending", "accepted", "declined", "blocked"],
      member_status: ["member", "invited", "pending"],
      proficiency: ["beginner", "intermediate", "advanced", "pro"],
    },
  },
} as const
