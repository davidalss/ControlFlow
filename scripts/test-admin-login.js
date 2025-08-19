import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://smvohmdytczfouslcaju.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminLogin() {
  console.log('🔍 Testando login com usuário admin...');
  
  // Lista de possíveis credenciais de admin
  const adminCredentials = [

    { email: 'david.pedro@wap.ind.br', password: 'david.pedro@wap.ind.br' },

  ];
  
  for (const cred of adminCredentials) {
    console.log(`\n🔐 Tentando login com: ${cred.email}`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      });
      
      if (error) {
        console.log(`❌ Erro: ${error.message}`);
      } else {
        console.log('✅ Login bem-sucedido!');
        console.log('👤 Usuário:', data.user.email);
        console.log('🎫 Token presente:', !!data.session.access_token);
        
        // Testar API com token
        console.log('\n🌐 Testando API com token...');
        const response = await fetch('https://enso-backend-0aa1.onrender.com/api/products', {
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`
          }
        });
        
        console.log(`📊 Status: ${response.status}`);
        
        if (response.ok) {
          const products = await response.json();
          console.log(`✅ API funcionando. Total de produtos: ${products.length}`);
          
          // Fazer logout
          await supabase.auth.signOut();
          console.log('👋 Logout realizado');
          
          return; // Sucesso, sair do loop
        } else {
          const errorText = await response.text();
          console.log(`❌ Erro na API: ${errorText}`);
        }
      }
    } catch (error) {
      console.log(`❌ Erro geral: ${error.message}`);
    }
  }
  
  console.log('\n❌ Nenhuma credencial funcionou');
  console.log('💡 Verifique se há um usuário admin no Supabase');
}

async function main() {
  console.log('🚀 Iniciando teste de login admin...\n');
  await testAdminLogin();
  console.log('\n🏁 Teste concluído');
}

main().catch(console.error);
