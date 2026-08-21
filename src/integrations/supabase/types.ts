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
  public: {
    Tables: {
      body_metrics: {
        Row: {
          arm_cm: number | null
          body_fat_percent: number | null
          chest_cm: number | null
          created_at: string
          height_cm: number | null
          hip_cm: number | null
          id: string
          measured_on: string
          neck_cm: number | null
          notes: string | null
          target_calories: number | null
          thigh_cm: number | null
          updated_at: string
          user_id: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          arm_cm?: number | null
          body_fat_percent?: number | null
          chest_cm?: number | null
          created_at?: string
          height_cm?: number | null
          hip_cm?: number | null
          id?: string
          measured_on?: string
          neck_cm?: number | null
          notes?: string | null
          target_calories?: number | null
          thigh_cm?: number | null
          updated_at?: string
          user_id: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          arm_cm?: number | null
          body_fat_percent?: number | null
          chest_cm?: number | null
          created_at?: string
          height_cm?: number | null
          hip_cm?: number | null
          id?: string
          measured_on?: string
          neck_cm?: number | null
          notes?: string | null
          target_calories?: number | null
          thigh_cm?: number | null
          updated_at?: string
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      cardio_sessions: {
        Row: {
          avg_heart_rate: number | null
          cardio_type: string
          created_at: string
          distance_km: number | null
          duration_minutes: number | null
          id: string
          incline_percent: number | null
          notes: string | null
          performed_on: string
          rounds: number | null
          session_id: string | null
          speed_kph: number | null
          user_id: string
        }
        Insert: {
          avg_heart_rate?: number | null
          cardio_type: string
          created_at?: string
          distance_km?: number | null
          duration_minutes?: number | null
          id?: string
          incline_percent?: number | null
          notes?: string | null
          performed_on?: string
          rounds?: number | null
          session_id?: string | null
          speed_kph?: number | null
          user_id: string
        }
        Update: {
          avg_heart_rate?: number | null
          cardio_type?: string
          created_at?: string
          distance_km?: number | null
          duration_minutes?: number | null
          id?: string
          incline_percent?: number | null
          notes?: string | null
          performed_on?: string
          rounds?: number | null
          session_id?: string | null
          speed_kph?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cardio_sessions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_notes: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          note: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          note: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          note?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_notes_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_sessions: {
        Row: {
          completed: boolean
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
          position: number
          session_id: string
          target_rep_range: string | null
          target_sets: number | null
          user_id: string
          workout_exercise_id: string | null
        }
        Insert: {
          completed?: boolean
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
          position?: number
          session_id: string
          target_rep_range?: string | null
          target_sets?: number | null
          user_id: string
          workout_exercise_id?: string | null
        }
        Update: {
          completed?: boolean
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          position?: number
          session_id?: string
          target_rep_range?: string | null
          target_sets?: number | null
          user_id?: string
          workout_exercise_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sessions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_sessions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_sessions_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          breathing: string | null
          category: string | null
          common_mistakes: string[]
          created_at: string
          cues: string[]
          default_rep_range: string | null
          default_rest_seconds: number | null
          default_rir: string | null
          equipment: string | null
          execution: string[]
          id: string
          is_compound: boolean
          lower_back_notes: string | null
          name: string
          primary_muscle: string | null
          secondary_muscles: string[]
          setup: string[]
          should_feel: string | null
          slug: string
        }
        Insert: {
          breathing?: string | null
          category?: string | null
          common_mistakes?: string[]
          created_at?: string
          cues?: string[]
          default_rep_range?: string | null
          default_rest_seconds?: number | null
          default_rir?: string | null
          equipment?: string | null
          execution?: string[]
          id?: string
          is_compound?: boolean
          lower_back_notes?: string | null
          name: string
          primary_muscle?: string | null
          secondary_muscles?: string[]
          setup?: string[]
          should_feel?: string | null
          slug: string
        }
        Update: {
          breathing?: string | null
          category?: string | null
          common_mistakes?: string[]
          created_at?: string
          cues?: string[]
          default_rep_range?: string | null
          default_rest_seconds?: number | null
          default_rir?: string | null
          equipment?: string | null
          execution?: string[]
          id?: string
          is_compound?: boolean
          lower_back_notes?: string | null
          name?: string
          primary_muscle?: string | null
          secondary_muscles?: string[]
          setup?: string[]
          should_feel?: string | null
          slug?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          achieved_on: string
          created_at: string
          estimated_1rm: number | null
          exercise_id: string | null
          id: string
          record_type: string
          reps: number | null
          session_id: string | null
          user_id: string
          volume_kg: number | null
          weight_kg: number | null
        }
        Insert: {
          achieved_on?: string
          created_at?: string
          estimated_1rm?: number | null
          exercise_id?: string | null
          id?: string
          record_type: string
          reps?: number | null
          session_id?: string | null
          user_id: string
          volume_kg?: number | null
          weight_kg?: number | null
        }
        Update: {
          achieved_on?: string
          created_at?: string
          estimated_1rm?: number | null
          exercise_id?: string | null
          id?: string
          record_type?: string
          reps?: number | null
          session_id?: string | null
          user_id?: string
          volume_kg?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity_level: number | null
          avatar_color: string | null
          avatar_url: string | null
          created_at: string
          current_weight_kg: number | null
          date_of_birth: string | null
          height_cm: number | null
          id: string
          length_unit: string
          name: string | null
          onboarding_completed: boolean
          plan_start_date: string | null
          preferred_cardio: string | null
          primary_goal: string | null
          reminders_enabled: boolean
          rest_timer_seconds: number
          sex: string | null
          starting_weight_kg: number | null
          target_body_fat: number | null
          target_weight_kg: number | null
          theme: string
          training_experience: string | null
          updated_at: string
          weight_unit: string
        }
        Insert: {
          activity_level?: number | null
          avatar_color?: string | null
          avatar_url?: string | null
          created_at?: string
          current_weight_kg?: number | null
          date_of_birth?: string | null
          height_cm?: number | null
          id: string
          length_unit?: string
          name?: string | null
          onboarding_completed?: boolean
          plan_start_date?: string | null
          preferred_cardio?: string | null
          primary_goal?: string | null
          reminders_enabled?: boolean
          rest_timer_seconds?: number
          sex?: string | null
          starting_weight_kg?: number | null
          target_body_fat?: number | null
          target_weight_kg?: number | null
          theme?: string
          training_experience?: string | null
          updated_at?: string
          weight_unit?: string
        }
        Update: {
          activity_level?: number | null
          avatar_color?: string | null
          avatar_url?: string | null
          created_at?: string
          current_weight_kg?: number | null
          date_of_birth?: string | null
          height_cm?: number | null
          id?: string
          length_unit?: string
          name?: string | null
          onboarding_completed?: boolean
          plan_start_date?: string | null
          preferred_cardio?: string | null
          primary_goal?: string | null
          reminders_enabled?: boolean
          rest_timer_seconds?: number
          sex?: string | null
          starting_weight_kg?: number | null
          target_body_fat?: number | null
          target_weight_kg?: number | null
          theme?: string
          training_experience?: string | null
          updated_at?: string
          weight_unit?: string
        }
        Relationships: []
      }
      sets: {
        Row: {
          completed: boolean
          created_at: string
          exercise_id: string
          exercise_session_id: string
          id: string
          is_warmup: boolean
          note: string | null
          performed_at: string
          reps: number | null
          rir: number | null
          set_number: number
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          completed?: boolean
          created_at?: string
          exercise_id: string
          exercise_session_id: string
          id?: string
          is_warmup?: boolean
          note?: string | null
          performed_at?: string
          reps?: number | null
          rir?: number | null
          set_number: number
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          completed?: boolean
          created_at?: string
          exercise_id?: string
          exercise_session_id?: string
          id?: string
          is_warmup?: boolean
          note?: string | null
          performed_at?: string
          reps?: number | null
          rir?: number | null
          set_number?: number
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sets_exercise_session_id_fkey"
            columns: ["exercise_session_id"]
            isOneToOne: false
            referencedRelation: "exercise_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_days: {
        Row: {
          cardio_note: string | null
          day_of_week: number | null
          estimated_minutes_max: number | null
          estimated_minutes_min: number | null
          focus: string | null
          id: string
          is_optional: boolean
          is_rest: boolean
          name: string
          notes: string | null
          slug: string
          sort_order: number
          specialization: string | null
          template_id: string
        }
        Insert: {
          cardio_note?: string | null
          day_of_week?: number | null
          estimated_minutes_max?: number | null
          estimated_minutes_min?: number | null
          focus?: string | null
          id?: string
          is_optional?: boolean
          is_rest?: boolean
          name: string
          notes?: string | null
          slug: string
          sort_order?: number
          specialization?: string | null
          template_id: string
        }
        Update: {
          cardio_note?: string | null
          day_of_week?: number | null
          estimated_minutes_max?: number | null
          estimated_minutes_min?: number | null
          focus?: string | null
          id?: string
          is_optional?: boolean
          is_rest?: boolean
          name?: string
          notes?: string | null
          slug?: string
          sort_order?: number
          specialization?: string | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_days_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          block: string | null
          day_id: string
          exercise_id: string
          id: string
          notes: string | null
          position: number
          rep_max: number | null
          rep_min: number | null
          rep_range: string
          rest_note: string | null
          rest_seconds: number | null
          rir_target: string | null
          sets: number
        }
        Insert: {
          block?: string | null
          day_id: string
          exercise_id: string
          id?: string
          notes?: string | null
          position: number
          rep_max?: number | null
          rep_min?: number | null
          rep_range: string
          rest_note?: string | null
          rest_seconds?: number | null
          rir_target?: string | null
          sets: number
        }
        Update: {
          block?: string | null
          day_id?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          position?: number
          rep_max?: number | null
          rep_min?: number | null
          rep_range?: string
          rest_note?: string | null
          rest_seconds?: number | null
          rir_target?: string | null
          sets?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "workout_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          created_at: string
          day_id: string | null
          difficulty: number | null
          duration_seconds: number | null
          energy: number | null
          finished_at: string | null
          id: string
          is_deload: boolean
          mood: string | null
          notes: string | null
          paused_seconds: number
          session_date: string
          started_at: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_id?: string | null
          difficulty?: number | null
          duration_seconds?: number | null
          energy?: number | null
          finished_at?: string | null
          id?: string
          is_deload?: boolean
          mood?: string | null
          notes?: string | null
          paused_seconds?: number
          session_date?: string
          started_at?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_id?: string | null
          difficulty?: number | null
          duration_seconds?: number | null
          energy?: number | null
          finished_at?: string | null
          id?: string
          is_deload?: boolean
          mood?: string | null
          notes?: string | null
          paused_seconds?: number
          session_date?: string
          started_at?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "workout_days"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          notes: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_leaderboard: {
        Args: { period_days?: number }
        Returns: {
          active_weeks: number
          avatar_color: string | null
          avatar_url: string | null
          display_name: string
          last_session: string
          pr_count: number
          sessions: number
          sets_count: number
          total_volume: number
          user_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
