export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      artwork: {
        Row: {
          category: string
          created_at: string
          description: string | null
          enable_blockchain: boolean | null
          enable_watermark: boolean | null
          file_paths: string[]
          id: string
          license_type: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          enable_blockchain?: boolean | null
          enable_watermark?: boolean | null
          file_paths: string[]
          id?: string
          license_type?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          enable_blockchain?: boolean | null
          enable_watermark?: boolean | null
          file_paths?: string[]
          id?: string
          license_type?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_comments_post_id"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          category: string
          comments_count: number
          content: string
          created_at: string
          id: string
          is_featured: boolean
          likes_count: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          is_featured?: boolean
          likes_count?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          is_featured?: boolean
          likes_count?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_votes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          user_id: string
          vote_type: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
          vote_type: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_votes_comment_id"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_votes_post_id"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      copyright_matches: {
        Row: {
          artwork_id: string
          context: string | null
          created_at: string
          description: string | null
          detected_at: string
          id: string
          image_url: string | null
          is_authorized: boolean | null
          is_reviewed: boolean | null
          match_confidence: number
          match_type: string
          scan_id: string
          source_domain: string | null
          source_title: string | null
          source_url: string
          threat_level: string | null
          thumbnail_url: string | null
        }
        Insert: {
          artwork_id: string
          context?: string | null
          created_at?: string
          description?: string | null
          detected_at?: string
          id?: string
          image_url?: string | null
          is_authorized?: boolean | null
          is_reviewed?: boolean | null
          match_confidence: number
          match_type: string
          scan_id: string
          source_domain?: string | null
          source_title?: string | null
          source_url: string
          threat_level?: string | null
          thumbnail_url?: string | null
        }
        Update: {
          artwork_id?: string
          context?: string | null
          created_at?: string
          description?: string | null
          detected_at?: string
          id?: string
          image_url?: string | null
          is_authorized?: boolean | null
          is_reviewed?: boolean | null
          match_confidence?: number
          match_type?: string
          scan_id?: string
          source_domain?: string | null
          source_title?: string | null
          source_url?: string
          threat_level?: string | null
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "copyright_matches_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artwork"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "copyright_matches_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "monitoring_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_advice: {
        Row: {
          advice: string
          category: string
          created_at: string
          expert_id: string
          id: string
          is_featured: boolean
          likes_count: number
          updated_at: string
        }
        Insert: {
          advice: string
          category: string
          created_at?: string
          expert_id: string
          id?: string
          is_featured?: boolean
          likes_count?: number
          updated_at?: string
        }
        Update: {
          advice?: string
          category?: string
          created_at?: string
          expert_id?: string
          id?: string
          is_featured?: boolean
          likes_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_advice_expert_id"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_profiles: {
        Row: {
          bio: string | null
          created_at: string
          expert_name: string
          id: string
          is_verified: boolean
          role: string
          specialties: string[] | null
          total_likes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          expert_name: string
          id?: string
          is_verified?: boolean
          role: string
          specialties?: string[] | null
          total_likes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          expert_name?: string
          id?: string
          is_verified?: boolean
          role?: string
          specialties?: string[] | null
          total_likes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monitoring_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_read: boolean | null
          match_id: string
          message: string
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          match_id: string
          message: string
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          match_id?: string
          message?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_alerts_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "copyright_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_scans: {
        Row: {
          artwork_id: string
          completed_at: string | null
          created_at: string
          id: string
          matches_found: number | null
          scan_type: string
          scanned_sources: number | null
          started_at: string | null
          status: string
          total_sources: number | null
        }
        Insert: {
          artwork_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          matches_found?: number | null
          scan_type: string
          scanned_sources?: number | null
          started_at?: string | null
          status?: string
          total_sources?: number | null
        }
        Update: {
          artwork_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          matches_found?: number | null
          scan_type?: string
          scanned_sources?: number | null
          started_at?: string | null
          status?: string
          total_sources?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_scans_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artwork"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_admin_role: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
