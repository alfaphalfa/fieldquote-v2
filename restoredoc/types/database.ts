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
          created_at: string
          email: string
          full_name: string | null
          company_name: string | null
          phone: string | null
          role: 'contractor' | 'admin' | 'viewer'
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          role?: 'contractor' | 'admin' | 'viewer'
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          role?: 'contractor' | 'admin' | 'viewer'
          avatar_url?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          client_name: string
          client_email: string | null
          client_phone: string | null
          property_address: string
          property_city: string
          property_state: string
          property_zip: string
          status: 'draft' | 'pending' | 'approved' | 'completed'
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          client_name: string
          client_email?: string | null
          client_phone?: string | null
          property_address: string
          property_city: string
          property_state: string
          property_zip: string
          status?: 'draft' | 'pending' | 'approved' | 'completed'
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          client_name?: string
          client_email?: string | null
          client_phone?: string | null
          property_address?: string
          property_city?: string
          property_state?: string
          property_zip?: string
          status?: 'draft' | 'pending' | 'approved' | 'completed'
          notes?: string | null
        }
      }
      estimates: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          project_id: string
          damage_type: 'water' | 'fire' | 'mold'
          severity: 'minor' | 'moderate' | 'severe'
          affected_area_sqft: number
          total_amount: number
          status: 'draft' | 'sent' | 'approved' | 'rejected'
          estimate_data: Json
          pdf_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          project_id: string
          damage_type: 'water' | 'fire' | 'mold'
          severity: 'minor' | 'moderate' | 'severe'
          affected_area_sqft: number
          total_amount: number
          status?: 'draft' | 'sent' | 'approved' | 'rejected'
          estimate_data: Json
          pdf_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          project_id?: string
          damage_type?: 'water' | 'fire' | 'mold'
          severity?: 'minor' | 'moderate' | 'severe'
          affected_area_sqft?: number
          total_amount?: number
          status?: 'draft' | 'sent' | 'approved' | 'rejected'
          estimate_data?: Json
          pdf_url?: string | null
        }
      }
      photos: {
        Row: {
          id: string
          created_at: string
          project_id: string
          estimate_id: string | null
          url: string
          thumbnail_url: string | null
          caption: string | null
          analysis_data: Json | null
          order: number
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          estimate_id?: string | null
          url: string
          thumbnail_url?: string | null
          caption?: string | null
          analysis_data?: Json | null
          order?: number
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          estimate_id?: string | null
          url?: string
          thumbnail_url?: string | null
          caption?: string | null
          analysis_data?: Json | null
          order?: number
        }
      }
      line_items: {
        Row: {
          id: string
          created_at: string
          estimate_id: string
          description: string
          quantity: number
          unit: string
          unit_price: number
          total_price: number
          category: string
          order: number
        }
        Insert: {
          id?: string
          created_at?: string
          estimate_id: string
          description: string
          quantity: number
          unit: string
          unit_price: number
          total_price: number
          category: string
          order?: number
        }
        Update: {
          id?: string
          created_at?: string
          estimate_id?: string
          description?: string
          quantity?: number
          unit?: string
          unit_price?: number
          total_price?: number
          category?: string
          order?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}