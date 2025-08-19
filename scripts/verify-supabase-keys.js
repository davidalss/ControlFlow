import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual do script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do cliente
const clientEnvPath = path.join(__dirname, '..', 'client', 'env.local');
console.log('🔍 Carregando arquivo de ambiente do cliente:', clientEnvPath);
dotenv.config({ path: clientEnvPath });

// Carregar variáveis de ambiente do servidor
const serverEnvPath = path.join(__dirname, '..', 'env.production');
console.log('🔍 Carregando arquivo de ambiente do servidor:', serverEnvPath);
dotenv.config({ path: serverEnvPath });

// Chaves fornecidas pelo usuário
const USER_PROVIDED_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U';
const USER_PROVIDED_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTUxOTUzNCwiZXhwIjoyMDcxMDk1NTM0fQ.UWuEALzLAlQoYQrWGOKuPbWUWxAmMNAHJ9IUtE-qiAE';

// Chaves configuradas no projeto
const CONFIGURED_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const CONFIGURED_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;

console.log('\n🔍 VERIFICAÇÃO DAS CHAVES DO SUPABASE');
console.log('=====================================\n');

console.log('📋 CHAVES CONFIGURADAS NO PROJETO:');
console.log('   URL:', SUPABASE_URL);
console.log('   Anon Key:', CONFIGURED_ANON_KEY ? '✅ Configurada' : '❌ Não encontrada');
console.log('   Service Role Key:', CONFIGURED_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ Não encontrada');

console.log('\n📋 CHAVES FORNECIDAS PELO USUÁRIO:');
console.log('   Anon Key:', USER_PROVIDED_ANON_KEY ? '✅ Fornecida' : '❌ Não fornecida');
console.log('   Service Role Key:', USER_PROVIDED_SERVICE_ROLE_KEY ? '✅ Fornecida' : '❌ Não fornecida');

console.log('\n🔍 COMPARAÇÃO DAS CHAVES:');

// Comparar anon keys
if (CONFIGURED_ANON_KEY === USER_PROVIDED_ANON_KEY) {
  console.log('   ✅ Anon Key: IDÊNTICAS');
} else {
  console.log('   ❌ Anon Key: DIFERENTES');
  console.log('      Configurada:', CONFIGURED_ANON_KEY?.substring(0, 50) + '...');
  console.log('      Fornecida:', USER_PROVIDED_ANON_KEY?.substring(0, 50) + '...');
}

// Comparar service role keys
if (CONFIGURED_SERVICE_ROLE_KEY === USER_PROVIDED_SERVICE_ROLE_KEY) {
  console.log('   ✅ Service Role Key: IDÊNTICAS');
} else {
  console.log('   ❌ Service Role Key: DIFERENTES');
  console.log('      Configurada:', CONFIGURED_SERVICE_ROLE_KEY?.substring(0, 50) + '...');
  console.log('      Fornecida:', USER_PROVIDED_SERVICE_ROLE_KEY?.substring(0, 50) + '...');
}

console.log('\n🧪 TESTANDO CONECTIVIDADE...');

// Testar com a chave configurada
if (SUPABASE_URL && CONFIGURED_ANON_KEY) {
  try {
    console.log('\n1️⃣ Testando com chave CONFIGURADA no projeto...');
    const supabaseConfigured = createClient(SUPABASE_URL, CONFIGURED_ANON_KEY);
    
    const { data, error } = await supabaseConfigured.auth.getSession();
    
    if (error) {
      console.log('   ❌ Erro com chave configurada:', error.message);
    } else {
      console.log('   ✅ Chave configurada funciona corretamente');
    }
  } catch (err) {
    console.log('   ❌ Erro ao testar chave configurada:', err.message);
  }
}

// Testar com a chave fornecida pelo usuário
if (SUPABASE_URL && USER_PROVIDED_ANON_KEY) {
  try {
    console.log('\n2️⃣ Testando com chave FORNECIDA pelo usuário...');
    const supabaseUserProvided = createClient(SUPABASE_URL, USER_PROVIDED_ANON_KEY);
    
    const { data, error } = await supabaseUserProvided.auth.getSession();
    
    if (error) {
      console.log('   ❌ Erro com chave fornecida:', error.message);
    } else {
      console.log('   ✅ Chave fornecida funciona corretamente');
    }
  } catch (err) {
    console.log('   ❌ Erro ao testar chave fornecida:', err.message);
  }
}

console.log('\n📝 RECOMENDAÇÕES:');

if (CONFIGURED_ANON_KEY !== USER_PROVIDED_ANON_KEY) {
  console.log('   🔄 Atualizar a chave anon no arquivo client/env.local');
  console.log('   🔄 Atualizar a chave anon no arquivo env.production');
  console.log('   🔄 Atualizar a chave anon no arquivo env.render.txt');
}

if (CONFIGURED_SERVICE_ROLE_KEY !== USER_PROVIDED_SERVICE_ROLE_KEY) {
  console.log('   🔄 Atualizar a service role key no arquivo env.production');
  console.log('   🔄 Atualizar a service role key no arquivo env.render.txt');
  console.log('   🔄 Configurar a service role key no Render (Environment Variables)');
}

console.log('\n✅ Verificação concluída!');
