export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      cases: {
        Row: {
          id: string;
          title: string;
          difficulty: 'easy' | 'medium' | 'hard';
          is_free: boolean;
          story_intro: string;
          setting: string;
          victim_name: string;
          victim_description: string;
          solution_killer: string;
          solution_motive: string;
          solution_method: string;
          created_at: string;
          updated_at: string;
          order_index: number;
          cover_image_url: string | null;
        };
        Insert: Omit<Database['public']['Tables']['cases']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['cases']['Insert']>;
      };
      suspects: {
        Row: {
          id: string;
          case_id: string;
          name: string;
          role: string;
          description: string;
          personality: string;
          knowledge_base: Json;
          hidden_truths: Json;
          reveal_conditions: Json;
          is_killer: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['suspects']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['suspects']['Insert']>;
      };
      evidence: {
        Row: {
          id: string;
          case_id: string;
          type: 'physical' | 'testimonial' | 'documentary' | 'forensic';
          content: string;
          relevance_score: number;
          is_red_herring: boolean;
          task_type: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['evidence']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['evidence']['Insert']>;
      };
      user_case_progress: {
        Row: {
          id: string;
          user_id: string;
          case_id: string;
          points_remaining: number;
          status: 'active' | 'completed' | 'failed';
          attempts_used: number;
          started_at: string;
          completed_at: string | null;
          solve_result: Json | null;
        };
        Insert: Omit<Database['public']['Tables']['user_case_progress']['Row'], 'id' | 'started_at'>;
        Update: Partial<Database['public']['Tables']['user_case_progress']['Insert']>;
      };
      facts: {
        Row: {
          id: string;
          user_id: string;
          case_id: string;
          fact_text: string;
          source: string;
          relevance_score: number;
          discovered_at: string;
        };
        Insert: Omit<Database['public']['Tables']['facts']['Row'], 'id' | 'discovered_at'>;
        Update: Partial<Database['public']['Tables']['facts']['Insert']>;
      };
      chat_logs: {
        Row: {
          id: string;
          user_id: string;
          case_id: string;
          character: string;
          message: string;
          role: 'user' | 'ai';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chat_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['chat_logs']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          stripe_session_id: string | null;
          stripe_customer_id: string | null;
          status: 'pending' | 'succeeded' | 'failed';
          access_level: 'free' | 'full';
          amount_cents: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          access_level: 'free' | 'full';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience row types
export type Case = Database['public']['Tables']['cases']['Row'];
export type Suspect = Database['public']['Tables']['suspects']['Row'];
export type Evidence = Database['public']['Tables']['evidence']['Row'];
export type UserCaseProgress = Database['public']['Tables']['user_case_progress']['Row'];
export type Fact = Database['public']['Tables']['facts']['Row'];
export type ChatLog = Database['public']['Tables']['chat_logs']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
