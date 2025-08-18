import { createClient } from '@supabase/supabase-js'

// Vite usa VITE_* como prefixo para variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://smvohmdytczfouslcaju.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing from environment variables.')
  console.error('Supabase URL:', supabaseUrl)
  console.error('Supabase Anon Key:', supabaseAnonKey ? '***' : 'MISSING')
  throw new Error('Supabase environment variables are not set.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


