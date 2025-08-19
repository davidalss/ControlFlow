import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual do script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
const envPath = path.join(__dirname, '..', 'client', 'env.local');
console.log('🔍 Carregando arquivo de ambiente:', envPath);

dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const apiUrl = process.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';

console.log('🔍 Variáveis carregadas:');
console.log('   VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Não encontrada');
console.log('   VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurada' : '❌ Não encontrada');
console.log('   VITE_API_URL:', apiUrl);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSGQPage() {
  console.log('🧪 Testando página SGQ...\n');

  try {
    // 1. Testar login do usuário admin
    console.log('1️⃣ Fazendo login do usuário admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'david.pedro@wap.ind.br',
      password: 'david.pedro@wap.ind.br'
    });

    if (authError) {
      console.error('❌ Erro no login:', authError.message);
      return;
    }

    console.log('✅ Login realizado com sucesso');
    const userId = authData.user.id;
    const token = authData.session.access_token;
    console.log(`👤 User ID: ${userId}\n`);

    // 2. Testar endpoint de health da API
    console.log('2️⃣ Testando health da API...');
    try {
      const healthResponse = await fetch(`${apiUrl}/health`);
      console.log(`   Health Status: ${healthResponse.status}`);
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('   Health Data:', healthData);
      }
    } catch (error) {
      console.error('   ❌ Erro no health check:', error.message);
    }

    // 3. Testar endpoint de autenticação
    console.log('\n3️⃣ Testando autenticação da API...');
    try {
      const authResponse = await fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(`   Auth Status: ${authResponse.status}`);
      if (authResponse.ok) {
        const authData = await authResponse.json();
        console.log('   Auth Data:', authData);
      } else {
        const errorText = await authResponse.text();
        console.log('   Auth Error:', errorText);
      }
    } catch (error) {
      console.error('   ❌ Erro na autenticação:', error.message);
    }

    // 4. Testar endpoint do dashboard SGQ
    console.log('\n4️⃣ Testando dashboard SGQ...');
    try {
      const dashboardResponse = await fetch(`${apiUrl}/api/sgq/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(`   Dashboard Status: ${dashboardResponse.status}`);
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        console.log('   Dashboard Data:', dashboardData);
      } else {
        const errorText = await dashboardResponse.text();
        console.log('   Dashboard Error:', errorText);
      }
    } catch (error) {
      console.error('   ❌ Erro no dashboard:', error.message);
    }

    // 5. Testar endpoint de lista de RNCs
    console.log('\n5️⃣ Testando lista de RNCs...');
    try {
      const rncResponse = await fetch(`${apiUrl}/api/sgq/rnc`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(`   RNC List Status: ${rncResponse.status}`);
      if (rncResponse.ok) {
        const rncData = await rncResponse.json();
        console.log('   RNC Data:', rncData);
      } else {
        const errorText = await rncResponse.text();
        console.log('   RNC Error:', errorText);
      }
    } catch (error) {
      console.error('   ❌ Erro na lista de RNCs:', error.message);
    }

    console.log('\n🎉 Teste da página SGQ concluído!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    // Fazer logout
    await supabase.auth.signOut();
    console.log('\n👋 Logout realizado');
  }
}

// Executar teste
testSGQPage();
