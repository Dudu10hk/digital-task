import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Check if we have valid Supabase credentials
export const isSupabaseConfigured = 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'placeholder-key' &&
  supabaseAnonKey !== 'your-anon-key-here'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
