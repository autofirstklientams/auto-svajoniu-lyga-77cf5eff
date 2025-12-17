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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      car_images: {
        Row: {
          car_id: string
          created_at: string | null
          display_order: number
          id: string
          image_url: string
        }
        Insert: {
          car_id: string
          created_at?: string | null
          display_order?: number
          id?: string
          image_url: string
        }
        Update: {
          car_id?: string
          created_at?: string | null
          display_order?: number
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_images_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          body_type: string | null
          color: string | null
          condition: string | null
          created_at: string | null
          defects: string | null
          description: string | null
          doors: number | null
          engine_capacity: number | null
          features: Json | null
          fuel_type: string | null
          id: string
          image_url: string | null
          make: string
          mileage: number | null
          model: string
          partner_id: string
          power_kw: number | null
          price: number
          seats: number | null
          steering_wheel: string | null
          transmission: string | null
          updated_at: string | null
          vin: string | null
          year: number
        }
        Insert: {
          body_type?: string | null
          color?: string | null
          condition?: string | null
          created_at?: string | null
          defects?: string | null
          description?: string | null
          doors?: number | null
          engine_capacity?: number | null
          features?: Json | null
          fuel_type?: string | null
          id?: string
          image_url?: string | null
          make: string
          mileage?: number | null
          model: string
          partner_id: string
          power_kw?: number | null
          price: number
          seats?: number | null
          steering_wheel?: string | null
          transmission?: string | null
          updated_at?: string | null
          vin?: string | null
          year: number
        }
        Update: {
          body_type?: string | null
          color?: string | null
          condition?: string | null
          created_at?: string | null
          defects?: string | null
          description?: string | null
          doors?: number | null
          engine_capacity?: number | null
          features?: Json | null
          fuel_type?: string | null
          id?: string
          image_url?: string | null
          make?: string
          mileage?: number | null
          model?: string
          partner_id?: string
          power_kw?: number | null
          price?: number
          seats?: number | null
          steering_wheel?: string | null
          transmission?: string | null
          updated_at?: string | null
          vin?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "cars_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          attachments: string[] | null
          buyer_address: string
          buyer_company_code: string
          buyer_is_company: boolean
          buyer_name: string
          buyer_vat_code: string | null
          car_make: string | null
          car_mileage: number | null
          car_model: string | null
          car_notes: string | null
          car_plate: string | null
          car_vin: string | null
          created_at: string
          id: string
          invoice_date: string
          invoice_number: string
          invoice_type: string
          items: Json
          note: string | null
          total_amount: number
          user_id: string
        }
        Insert: {
          attachments?: string[] | null
          buyer_address: string
          buyer_company_code: string
          buyer_is_company?: boolean
          buyer_name: string
          buyer_vat_code?: string | null
          car_make?: string | null
          car_mileage?: number | null
          car_model?: string | null
          car_notes?: string | null
          car_plate?: string | null
          car_vin?: string | null
          created_at?: string
          id?: string
          invoice_date: string
          invoice_number: string
          invoice_type?: string
          items: Json
          note?: string | null
          total_amount: number
          user_id: string
        }
        Update: {
          attachments?: string[] | null
          buyer_address?: string
          buyer_company_code?: string
          buyer_is_company?: boolean
          buyer_name?: string
          buyer_vat_code?: string | null
          car_make?: string | null
          car_mileage?: number | null
          car_model?: string | null
          car_notes?: string | null
          car_plate?: string | null
          car_vin?: string | null
          created_at?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          invoice_type?: string
          items?: Json
          note?: string | null
          total_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_buyers: {
        Row: {
          address: string
          company_code: string
          created_at: string
          id: string
          is_company: boolean
          name: string
          user_id: string
          vat_code: string | null
        }
        Insert: {
          address: string
          company_code: string
          created_at?: string
          id?: string
          is_company?: boolean
          name: string
          user_id: string
          vat_code?: string | null
        }
        Update: {
          address?: string
          company_code?: string
          created_at?: string
          id?: string
          is_company?: boolean
          name?: string
          user_id?: string
          vat_code?: string | null
        }
        Relationships: []
      }
      saved_car_features: {
        Row: {
          created_at: string
          features: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_products: {
        Row: {
          created_at: string
          default_price: number
          description: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_price?: number
          description: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_price?: number
          description?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      uploaded_invoices: {
        Row: {
          created_at: string
          file_name: string
          file_type: string
          file_url: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_type: string
          file_url: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "partner"
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
      app_role: ["admin", "partner"],
    },
  },
} as const
