import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase para o backend
const supabaseUrl = process.env.SUPABASE_URL || 'https://smvohmdytczfouslcaju.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUxOTUzNCwiZXhwIjoyMDcxMDk1NTM0fQ.UWuEALzLAlQoYQrWGOKuPbWUWxAmMNAHJ9IUtE-qiAE';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Para compatibilidade com código existente que usa drizzle
export const db = {
  // Implementação básica para compatibilidade
  select: () => supabase,
  insert: () => supabase,
  update: () => supabase,
  delete: () => supabase,
};