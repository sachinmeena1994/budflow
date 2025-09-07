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
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          changes: Json | null
          entity_id: string
          entity_type: string
          log_id: string
          task_id: string | null
          timestamp: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          changes?: Json | null
          entity_id: string
          entity_type: string
          log_id?: string
          task_id?: string | null
          timestamp?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          changes?: Json | null
          entity_id?: string
          entity_type?: string
          log_id?: string
          task_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      daily_summaries: {
        Row: {
          created_at: string | null
          output_units: number | null
          productivity_score: number | null
          summary_id: string
          technician_id: string | null
          total_minutes: number | null
          work_date: string
        }
        Insert: {
          created_at?: string | null
          output_units?: number | null
          productivity_score?: number | null
          summary_id?: string
          technician_id?: string | null
          total_minutes?: number | null
          work_date: string
        }
        Update: {
          created_at?: string | null
          output_units?: number | null
          productivity_score?: number | null
          summary_id?: string
          technician_id?: string | null
          total_minutes?: number | null
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_summaries_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string | null
          employee_id: string
          employment_status: string | null
          full_name: string
          job_title: string | null
          site_id: string | null
          terminated: boolean | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          employment_status?: string | null
          full_name: string
          job_title?: string | null
          site_id?: string | null
          terminated?: boolean | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          employment_status?: string | null
          full_name?: string
          job_title?: string | null
          site_id?: string | null
          terminated?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      entries_all: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          archived_at: string | null
          batch_product_id: string | null
          created_at: string | null
          created_by: string | null
          entry_payload: Json
          id: string
          site_id: string | null
          task_id: string
          technician_refs: string[] | null
          work_type: string
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          batch_product_id?: string | null
          created_at?: string | null
          created_by?: string | null
          entry_payload: Json
          id?: string
          site_id?: string | null
          task_id: string
          technician_refs?: string[] | null
          work_type: string
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          batch_product_id?: string | null
          created_at?: string | null
          created_by?: string | null
          entry_payload?: Json
          id?: string
          site_id?: string | null
          task_id?: string
          technician_refs?: string[] | null
          work_type?: string
        }
        Relationships: []
      }
      exception_tags: {
        Row: {
          created_at: string | null
          flagged_by: string | null
          notes: string | null
          tag_code: string | null
          tag_id: string
          work_entry_id: string | null
        }
        Insert: {
          created_at?: string | null
          flagged_by?: string | null
          notes?: string | null
          tag_code?: string | null
          tag_id?: string
          work_entry_id?: string | null
        }
        Update: {
          created_at?: string | null
          flagged_by?: string | null
          notes?: string | null
          tag_code?: string | null
          tag_id?: string
          work_entry_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exception_tags_flagged_by_fkey"
            columns: ["flagged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exception_tags_work_entry_id_fkey"
            columns: ["work_entry_id"]
            isOneToOne: false
            referencedRelation: "entries_all"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          permissions_json: Json | null
          role_code: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          permissions_json?: Json | null
          role_code: string
          role_id?: string
        }
        Update: {
          created_at?: string | null
          permissions_json?: Json | null
          role_code?: string
          role_id?: string
        }
        Relationships: []
      }
      shift_sessions: {
        Row: {
          created_at: string | null
          ended_at: string | null
          session_id: string
          site_id: string | null
          started_at: string
          technician_id: string | null
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          session_id?: string
          site_id?: string | null
          started_at: string
          technician_id?: string | null
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          session_id?: string
          site_id?: string | null
          started_at?: string
          technician_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_sessions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_sessions_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
sites: {
  Row: {
    id: string;
    site_name: string;
    site_alias: string;
    market: string;
    market_code: string;
    reference_id: string;
    active: boolean;
    created_at: string;
  };
  Insert: {
    id?: string;
    site_name: string;
    site_alias: string;
    market: string;
    market_code: string;
    reference_id: string;
    active?: boolean;
    created_at?: string;
  };
  Update: {
    id?: string;
    site_name?: string;
    site_alias?: string;
    market?: string;
    market_code?: string;
    reference_id?: string;
    active?: boolean;
    created_at?: string;
  };
  Relationships: [];
}


      strains: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      technicians: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      time_blocks: {
        Row: {
          block_id: string
          block_type: string | null
          created_at: string | null
          duration_min: number
          notes: string | null
          session_id: string | null
        }
        Insert: {
          block_id?: string
          block_type?: string | null
          created_at?: string | null
          duration_min: number
          notes?: string | null
          session_id?: string | null
        }
        Update: {
          block_id?: string
          block_type?: string | null
          created_at?: string | null
          duration_min?: number
          notes?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_blocks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "shift_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      user_role_mapping: {
        Row: {
          role_id: string
          site_id: string
          user_id: string
        }
        Insert: {
          role_id: string
          site_id: string
          user_id: string
        }
        Update: {
          role_id?: string
          site_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_role_mapping_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_id"]
          },
          {
            foreignKeyName: "user_role_mapping_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_mapping_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_role_mappings: {
        Row: {
          created_at: string | null
          mapping_id: string
          role_id: string | null
          site_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          mapping_id?: string
          role_id?: string | null
          site_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          mapping_id?: string
          role_id?: string | null
          site_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_role_mappings_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_id"]
          },
          {
            foreignKeyName: "user_role_mappings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_mappings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active: boolean | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          employee_id: string | null
          site_id: string | null
          wurk_employee_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          employee_id?: string | null
          site_id?: string | null
          wurk_employee_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          employee_id?: string | null
          site_id?: string | null
          wurk_employee_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      work_entries: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          archived_at: string | null
          batch_ref: string | null
          created_at: string | null
          created_by: string
          entry_payload: Json
          site_id: string
          task_id: string | null
          technician_refs: string[] | null
          work_entry_id: string
          work_type_code: string
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          batch_ref?: string | null
          created_at?: string | null
          created_by: string
          entry_payload: Json
          site_id: string
          task_id?: string | null
          technician_refs?: string[] | null
          work_entry_id?: string
          work_type_code: string
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string | null
          batch_ref?: string | null
          created_at?: string | null
          created_by?: string
          entry_payload?: Json
          site_id?: string
          task_id?: string | null
          technician_refs?: string[] | null
          work_entry_id?: string
          work_type_code?: string
        }
        Relationships: []
      }
      work_type_fields: {
        Row: {
          calculated: boolean | null
          created_at: string | null
          field_key: string
          id: string
          label: string
          options: Json | null
          order_index: number | null
          required: boolean | null
          type: string
          work_type: string
        }
        Insert: {
          calculated?: boolean | null
          created_at?: string | null
          field_key: string
          id?: string
          label: string
          options?: Json | null
          order_index?: number | null
          required?: boolean | null
          type: string
          work_type: string
        }
        Update: {
          calculated?: boolean | null
          created_at?: string | null
          field_key?: string
          id?: string
          label?: string
          options?: Json | null
          order_index?: number | null
          required?: boolean | null
          type?: string
          work_type?: string
        }
        Relationships: []
      }
      work_type_schema_contracts: {
        Row: {
          multi_tech_allowed: boolean | null
          requires_dual_approval: boolean | null
          schema_json: Json
          technician_required: boolean | null
          ui_config: Json | null
          work_type_code: string
        }
        Insert: {
          multi_tech_allowed?: boolean | null
          requires_dual_approval?: boolean | null
          schema_json: Json
          technician_required?: boolean | null
          ui_config?: Json | null
          work_type_code: string
        }
        Update: {
          multi_tech_allowed?: boolean | null
          requires_dual_approval?: boolean | null
          schema_json?: Json
          technician_required?: boolean | null
          ui_config?: Json | null
          work_type_code?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_task_id: {
        Args: { work_type_param: string }
        Returns: string
      }
      get_next_task_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      data_type: "string" | "number" | "boolean" | "date"
      field_type: "text" | "number" | "select" | "dropdown" | "date" | "time"
      user_role: "admin" | "manager" | "technician" | "viewer"
      work_type: "harvest" | "machine" | "hand" | "breakdown"
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
      data_type: ["string", "number", "boolean", "date"],
      field_type: ["text", "number", "select", "dropdown", "date", "time"],
      user_role: ["admin", "manager", "technician", "viewer"],
      work_type: ["harvest", "machine", "hand", "breakdown"],
    },
  },
} as const
