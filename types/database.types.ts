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
          email: string
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          created_at?: string
        }
      }
      files: {
        Row: {
          id: string
          conversation_id: string
          message_id: string | null
          user_id: string
          file_path: string
          file_type: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          message_id?: string | null
          user_id: string
          file_path: string
          file_type: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          message_id?: string | null
          user_id?: string
          file_path?: string
          file_type?: string
          created_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          message_id: string
          user_id: string
          rating: 'like' | 'dislike'
          feedback_text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          rating: 'like' | 'dislike'
          feedback_text?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          rating?: 'like' | 'dislike'
          feedback_text?: string | null
          created_at?: string
        }
      }
    }
  }
}
