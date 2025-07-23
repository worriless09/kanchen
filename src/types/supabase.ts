// src/types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          exam_type: 'UPSC' | 'SSC' | 'BANKING' | 'RAILWAYS' | null
          study_goal: string | null
          target_date: string | null
          daily_cards_goal: number
          weekly_hours_goal: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          exam_type?: 'UPSC' | 'SSC' | 'BANKING' | 'RAILWAYS' | null
          study_goal?: string | null
          target_date?: string | null
          daily_cards_goal?: number
          weekly_hours_goal?: number
        }
        Update: {
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          exam_type?: 'UPSC' | 'SSC' | 'BANKING' | 'RAILWAYS' | null
          study_goal?: string | null
          target_date?: string | null
          daily_cards_goal?: number
          weekly_hours_goal?: number
        }
      }
      flashcards: {
        Row: {
          id: string
          owner_id: string
          question: string
          answer: string
          subject_id: string | null
          topic_id: string | null
          tags: string[]
          repetitions: number
          interval_days: number
          easiness_factor: number
          next_review_date: string
          last_reviewed: string | null
          is_suspended: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          owner_id: string
          question: string
          answer: string
          subject_id?: string | null
          topic_id?: string | null
          tags?: string[]
          repetitions?: number
          interval_days?: number
          easiness_factor?: number
          next_review_date?: string
          is_suspended?: boolean
        }
        Update: {
          question?: string
          answer?: string
          subject_id?: string | null
          topic_id?: string | null
          tags?: string[]
          repetitions?: number
          interval_days?: number
          easiness_factor?: number
          next_review_date?: string
          last_reviewed?: string | null
          is_suspended?: boolean
        }
      }
      reviews: {
        Row: {
          id: string
          flashcard_id: string
          profile_id: string
          quality_score: number
          response_time_ms: number
          was_correct: boolean
          easiness_factor_after: number
          interval_days_after: number
          created_at: string
        }
        Insert: {
          flashcard_id: string
          profile_id: string
          quality_score: number
          response_time_ms: number
          was_correct: boolean
          easiness_factor_after: number
          interval_days_after: number
        }
        Update: {
          flashcard_id?: string
          profile_id?: string
          quality_score?: number
          response_time_ms?: number
          was_correct?: boolean
          easiness_factor_after?: number
          interval_days_after?: number
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Flashcard = Database['public']['Tables']['flashcards']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
