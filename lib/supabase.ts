import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (for browser/client components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (for server actions)
export const createSupabaseServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Admin client (with service role key - use carefully!)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database types (will be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          date_of_birth: string | null
          ssn: string | null
          dwolla_customer_id: string | null
          dwolla_customer_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          date_of_birth?: string | null
          ssn?: string | null
          dwolla_customer_id?: string | null
          dwolla_customer_url?: string | null
        }
        Update: {
          email?: string
          first_name?: string
          last_name?: string
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          date_of_birth?: string | null
          ssn?: string | null
          dwolla_customer_id?: string | null
          dwolla_customer_url?: string | null
        }
      }
      banks: {
        Row: {
          id: string
          user_id: string
          account_id: string
          bank_id: string
          access_token: string
          funding_source_url: string | null
          shareable_id: string
          institution_id: string | null
          official_name: string | null
          mask: string | null
          current_balance: number
          available_balance: number
          type: string | null
          subtype: string | null
          created_at: string
          updated_at: string
        }
      }
      transactions: {
        Row: {
          id: string
          bank_id: string
          sender_bank_id: string | null
          receiver_bank_id: string | null
          name: string
          amount: number
          payment_channel: string | null
          type: string
          category: string | null
          pending: boolean
          date: string
          created_at: string
        }
      }
    }
  }
}
