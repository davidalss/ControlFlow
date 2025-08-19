import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://smvohmdytczfouslcaju.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthStatus() {
  console.log('🔍 Testando status de autenticação...');
  
  try {
    // Verificar sessão atual
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erro ao obter sessão:', error.message);
      return;
    }
    
    if (session) {
      console.log('✅ Usuário logado:');
      console.log('👤 ID:', session.user.id);
      console.log('📧 Email:', session.user.email);
      console.log('🎫 Token presente:', !!session.access_token);
      console.log('🕒 Expira em:', new Date(session.expires_at * 1000).toLocaleString());
      
      // Testar API com token
      console.log('\n🌐 Testando API com token...');
      const response = await fetch('https://enso-backend-0aa1.onrender.com/api/products', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      console.log(`📊 Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ API funcionando. Total de produtos: ${data.length}`);
      } else {
        const errorText = await response.text();
        console.log(`❌ Erro na API: ${errorText}`);
      }
      
    } else {
      console.log('❌ Nenhuma sessão ativa');
      console.log('💡 Usuário precisa fazer login');
      
      // Tentar fazer login com credenciais de teste
      console.log('\n🔐 Tentando login com credenciais de teste...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'david.pedro@wap.ind.br',
        password: 'teste123'
      });
      
      if (loginError) {
        console.error('❌ Erro no login:', loginError.message);
      } else {
        console.log('✅ Login bem-sucedido!');
        console.log('👤 Usuário:', loginData.user.email);
        
        // Testar API novamente
        console.log('\n🌐 Testando API após login...');
        const response = await fetch('https://enso-backend-0aa1.onrender.com/api/products', {
          headers: {
            'Authorization': `Bearer ${loginData.session.access_token}`
          }
        });
        
        console.log(`📊 Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ API funcionando. Total de produtos: ${data.length}`);
        } else {
          const errorText = await response.text();
          console.log(`❌ Erro na API: ${errorText}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando teste de autenticação...\n');
  await testAuthStatus();
  console.log('\n🏁 Teste concluído');
}

main().catch(console.error);
