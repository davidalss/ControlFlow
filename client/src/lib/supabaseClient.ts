import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.REACT_APP_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.REACT_APP_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing from environment variables.')
  console.error('Supabase URL:', supabaseUrl)
  console.error('Supabase Anon Key:', supabaseAnonKey ? '***' : 'MISSING')
  throw new Error('Supabase environment variables are not set.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


