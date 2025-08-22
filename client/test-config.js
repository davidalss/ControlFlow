// Script para testar configuração das variáveis de ambiente
console.log('🔍 Testando configuração das variáveis de ambiente...');

// Verificar variáveis críticas
const envVars = {
  'VITE_API_URL': import.meta.env.VITE_API_URL,
  'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
  'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
  'VITE_WEBSOCKET_URL': import.meta.env.VITE_WEBSOCKET_URL,
  'NODE_ENV': import.meta.env.NODE_ENV,
  'MODE': import.meta.env.MODE
};

console.log('📋 Variáveis de ambiente:');
Object.entries(envVars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${key.includes('KEY') ? '***DEFINIDA***' : value}`);
  } else {
    console.log(`❌ ${key}: Não definida`);
  }
});

// Verificar se as variáveis críticas estão definidas
const criticalVars = ['VITE_API_URL', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const missingVars = criticalVars.filter(key => !envVars[key]);

if (missingVars.length > 0) {
  console.error('❌ Variáveis críticas ausentes:', missingVars);
  console.error('Isso pode causar problemas de autenticação e API!');
} else {
  console.log('✅ Todas as variáveis críticas estão definidas!');
}

console.log('✅ Teste de configuração concluído!');
