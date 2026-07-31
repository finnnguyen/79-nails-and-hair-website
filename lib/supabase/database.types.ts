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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      booking_services: {
        Row: {
          booking_id: string
          id: string
          price: number
          service_id: string | null
          service_name: string
        }
        Insert: {
          booking_id: string
          id?: string
          price: number
          service_id?: string | null
          service_name: string
        }
        Update: {
          booking_id?: string
          id?: string
          price?: number
          service_id?: string | null
          service_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_services_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          duration_minutes: number
          ends_at: string
          id: string
          staff_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          duration_minutes: number
          ends_at: string
          id?: string
          staff_id?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          duration_minutes?: number
          ends_at?: string
          id?: string
          staff_id?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "bookings_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_hits: {
        Row: {
          created_at: string
          id: number
          key: string
        }
        Insert: {
          created_at?: string
          id?: never
          key: string
        }
        Update: {
          created_at?: string
          id?: never
          key?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved: boolean
          comment: string | null
          created_at: string
          customer_name: string
          id: string
          rating: number
          staff_id: string | null
          website_comment: string | null
          website_rating: number | null
        }
        Insert: {
          approved?: boolean
          comment?: string | null
          created_at?: string
          customer_name: string
          id?: string
          rating: number
          staff_id?: string | null
          website_comment?: string | null
          website_rating?: number | null
        }
        Update: {
          approved?: boolean
          comment?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          rating?: number
          staff_id?: string | null
          website_comment?: string | null
          website_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          addon: boolean
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          duration_minutes: number
          id: string
          name: string
          note: string | null
          price: number
          sort_order: number
          starting_at: boolean
        }
        Insert: {
          addon?: boolean
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          duration_minutes?: number
          id: string
          name: string
          note?: string | null
          price: number
          sort_order?: number
          starting_at?: boolean
        }
        Update: {
          addon?: boolean
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          duration_minutes?: number
          id?: string
          name?: string
          note?: string | null
          price?: number
          sort_order?: number
          starting_at?: boolean
        }
        Relationships: []
      }
      staff: {
        Row: {
          categories: Database["public"]["Enums"]["service_category"][]
          created_at: string
          id: string
          name: string
          photo_url: string | null
          role: Database["public"]["Enums"]["staff_role"]
          sort_order: number
        }
        Insert: {
          categories?: Database["public"]["Enums"]["service_category"][]
          created_at?: string
          id: string
          name: string
          photo_url?: string | null
          role: Database["public"]["Enums"]["staff_role"]
          sort_order?: number
        }
        Update: {
          categories?: Database["public"]["Enums"]["service_category"][]
          created_at?: string
          id?: string
          name?: string
          photo_url?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          sort_order?: number
        }
        Relationships: []
      }
      staff_rotation: {
        Row: {
          last_turn_at: string
          present: boolean
          queue_position: number
          rotation_date: string
          staff_id: string
          turn_credit: number
        }
        Insert: {
          last_turn_at?: string
          present?: boolean
          queue_position?: number
          rotation_date?: string
          staff_id: string
          turn_credit?: number
        }
        Update: {
          last_turn_at?: string
          present?: boolean
          queue_position?: number
          rotation_date?: string
          staff_id?: string
          turn_credit?: number
        }
        Relationships: [
          {
            foreignKeyName: "staff_rotation_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: true
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_service_durations: {
        Row: {
          duration_minutes: number
          id: string
          service_id: string
          staff_id: string
        }
        Insert: {
          duration_minutes: number
          id?: string
          service_id: string
          staff_id: string
        }
        Update: {
          duration_minutes?: number
          id?: string
          service_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_service_durations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_service_durations_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_specialties: {
        Row: {
          category: Database["public"]["Enums"]["service_category"] | null
          id: string
          label: string
          service_id: string | null
          sort_order: number
          staff_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["service_category"] | null
          id?: string
          label: string
          service_id?: string | null
          sort_order?: number
          staff_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"] | null
          id?: string
          label?: string
          service_id?: string | null
          sort_order?: number
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_specialties_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_specialties_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      walk_in_services: {
        Row: {
          id: string
          price: number
          service_id: string | null
          service_name: string
          walk_in_id: string
        }
        Insert: {
          id?: string
          price: number
          service_id?: string | null
          service_name: string
          walk_in_id: string
        }
        Update: {
          id?: string
          price?: number
          service_id?: string | null
          service_name?: string
          walk_in_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "walk_in_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "walk_in_services_walk_in_id_fkey"
            columns: ["walk_in_id"]
            isOneToOne: false
            referencedRelation: "walk_ins"
            referencedColumns: ["id"]
          },
        ]
      }
      walk_ins: {
        Row: {
          completed_at: string | null
          customer_name: string | null
          duration_minutes: number
          id: string
          is_request: boolean
          requested_at: string
          staff_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["walk_in_status"]
          total_price: number
        }
        Insert: {
          completed_at?: string | null
          customer_name?: string | null
          duration_minutes: number
          id?: string
          is_request?: boolean
          requested_at?: string
          staff_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["walk_in_status"]
          total_price?: number
        }
        Update: {
          completed_at?: string | null
          customer_name?: string | null
          duration_minutes?: number
          id?: string
          is_request?: boolean
          requested_at?: string
          staff_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["walk_in_status"]
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "walk_ins_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: { p_key: string; p_max_count: number; p_window_minutes: number }
        Returns: boolean
      }
      get_booked_slots: {
        Args: { p_staff_id: string }
        Returns: {
          ends_at: string
          starts_at: string
        }[]
      }
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      service_category: "Nail Services" | "Hair Services" | "Facial Services"
      staff_role: "Nail Tech" | "Hair Stylist" | "Hair Stylist & Nail Tech"
      walk_in_status: "waiting" | "in_progress" | "completed" | "cancelled"
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
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      service_category: ["Nail Services", "Hair Services", "Facial Services"],
      staff_role: ["Nail Tech", "Hair Stylist", "Hair Stylist & Nail Tech"],
      walk_in_status: ["waiting", "in_progress", "completed", "cancelled"],
    },
  },
} as const
