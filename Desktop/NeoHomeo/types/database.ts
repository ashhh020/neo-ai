export type Role = "student" | "practitioner" | "educator" | "admin";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: Role;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          streak_days: number;
          xp_points: number;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      chat_threads: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          mode: string;
          created_at: string;
          updated_at: string;
          message_count: number;
        };
        Insert: Omit<Database["public"]["Tables"]["chat_threads"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["chat_threads"]["Insert"]>;
      };
      chat_messages: {
        Row: {
          id: string;
          thread_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["chat_messages"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["chat_messages"]["Insert"]>;
      };
      study_notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          tags: string[];
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["study_notes"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["study_notes"]["Insert"]>;
      };
      saved_remedies: {
        Row: {
          id: string;
          user_id: string;
          remedy_name: string;
          kingdom: string | null;
          miasm: string | null;
          keynotes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["saved_remedies"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["saved_remedies"]["Insert"]>;
      };
      repertory_cases: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          patient_age: number | null;
          patient_sex: string | null;
          chief_complaint: string | null;
          rubric_ids: string[];
          rubric_weights: Record<string, number>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["repertory_cases"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["repertory_cases"]["Insert"]>;
      };
    };
    Views: {};
    Functions: {};
    Enums: { role: Role };
  };
}
