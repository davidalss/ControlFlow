// Verificação de variáveis de ambiente
console.log('🔍 Verificando variáveis de ambiente...');

const envVars = {
  'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
  'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
  'VITE_API_URL': import.meta.env.VITE_API_URL,
  'NODE_ENV': import.meta.env.NODE_ENV,
  'MODE': import.meta.env.MODE
};

console.log('📋 Variáveis de ambiente:', envVars);

const missingVars = Object.entries(envVars)
  .filter(([key, value]) => !value && key.startsWith('VITE_'))
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Variáveis ausentes:', missingVars);
} else {
  console.log('✅ Todas as variáveis estão definidas');
}
