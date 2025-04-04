export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: { // Renamed from profiles
        Row: {
          id: string
          user_name: string // Added field
          email: string
          password: string // Added field
          role: string | null
          profile_image: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          user_name: string // Added field
          email: string
          password: string // Added field
          role?: string | null
          profile_image?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_name?: string // Added field
          email?: string
          password?: string // Added field
          role?: string | null
          profile_image?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          customer_id: string
          title: string
          description: string
          status: string
          pricing_tier: string
          created_at: string
          updated_at: string
          technical_requirements: string | null
          required_skills: string | null
          deliverables: string | null
          budget: number | null
          payment_type: string | null
          start_date: string | null
          duration_days: number | null
          priority: string | null
          visibility: string | null
        }
        Insert: {
          id?: string
          customer_id: string
          title: string
          description: string
          status: string
          pricing_tier: string
          created_at?: string
          updated_at?: string
          technical_requirements?: string | null
          required_skills?: string | null
          deliverables?: string | null
          budget?: number | null
          payment_type?: string | null
          start_date?: string | null
          duration_days?: number | null
          priority?: string | null
          visibility?: string | null
        }
        Update: {
          id?: string
          customer_id?: string
          title?: string
          description?: string
          status?: string
          pricing_tier?: string
          created_at?: string
          updated_at?: string
          technical_requirements?: string | null
          required_skills?: string | null
          deliverables?: string | null
          budget?: number | null
          payment_type?: string | null
          start_date?: string | null
          duration_days?: number | null
          priority?: string | null
          visibility?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          assigned_to: string | null
          title: string
          description: string
          status: string
          task_group: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          assigned_to: string | null
          title: string
          description: string
          status: string
          task_group: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          assigned_to?: string | null
          title?: string
          description?: string
          status?: string
          task_group?: string
          created_at?: string
          updated_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          project_id: string
          customer_id: string
          feedback_text: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          customer_id: string
          feedback_text: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          customer_id?: string
          feedback_text?: string
          status?: string
          created_at?: string
        }
      }
      iterations: {
        Row: {
          id: string
          project_id: string
          iteration_count: number
          max_iterations: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          iteration_count: number
          max_iterations: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          iteration_count?: number
          max_iterations?: number
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          amount: number
          currency: string
          status: string
          payment_date: string
          payment_method: string | null
          transaction_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string | null
          amount: number
          currency: string
          status: string
          payment_date: string
          payment_method: string | null
          transaction_id: string | null
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          amount?: number
          currency?: string
          status?: string
          payment_date?: string | null
          payment_method?: string | null
          transaction_id?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          project_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          project_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          project_id?: string
          message?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          is_read: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
      files: {
        Row: {
          id: string
          project_id: string
          uploaded_by: string
          file_url: string
          file_type: string | null
          file_name: string | null
          file_size: number | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          project_id: string
          uploaded_by: string
          file_url: string
          file_type?: string | null
          file_name?: string | null
          file_size?: number | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          uploaded_by?: string
          file_url?: string
          file_type?: string | null
          file_name?: string | null
          file_size?: number | null
          uploaded_at?: string
        }
      }
    }
    Views: {
      project_progress: {
        Row: {
          id: string
          project_title: string | null
          description: string | null
          status: string | null
          customer_id: string | null
          pricing_tier: string | null
          total_tasks: number | null
          completed_tasks: number | null
          progress_percentage: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "users" // Updated from profiles
            referencedColumns: ["id"]
          }
        ]
      }
    }
  }
}
