import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://smvohmdytczfouslcaju.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const baseUrl = 'https://enso-backend-0aa1.onrender.com';

async function testAPIWithLogin() {
  console.log('🔍 TESTANDO API COM LOGIN AUTOMÁTICO');
  console.log('📍 Base URL:', baseUrl);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('');

  try {
    // 1. Fazer login no Supabase
    console.log('1️⃣ Fazendo login no Supabase...');
    const email = 'david.pedro@wap.ind.br';
    const password = 'david.pedro@wap.ind.br';
    
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (signInError) {
      console.error('❌ Erro no login:', signInError.message);
      console.log('💡 Verifique se as credenciais estão corretas');
      return;
    }
    
    console.log('✅ Login realizado com sucesso!');
    console.log('👤 Usuário:', signInData.user?.email);
    console.log('🆔 ID:', signInData.user?.id);
    
    const token = signInData.session?.access_token;
    if (!token) {
      console.error('❌ Token não encontrado na sessão');
      return;
    }
    
    console.log('🎫 Token presente:', !!token);
    console.log('🎫 Token (primeiros 20 chars):', token.substring(0, 20) + '...');
    console.log('');

    // 2. Testar endpoints protegidos com token
    const protectedEndpoints = [
      '/api/products',
      '/api/products/search?q=test',
      '/api/categories',
      '/api/users/profile',
      '/api/sgq/rnc',
      '/api/inspection-plans',
      '/api/notifications'
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const path of protectedEndpoints) {
      const url = `${baseUrl}${path}`;
      console.log(`📡 Testando: ${path}`);
      
      try {
        const startTime = Date.now();
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'ControlFlow-API-Check/1.0'
          }
        });
        const duration = Date.now() - startTime;
        
        const status = res.status;
        const statusText = res.statusText;
        const contentType = res.headers.get("content-type") || '';
        
        console.log(`   Status: ${status} ${statusText}`);
        console.log(`   Tempo: ${duration}ms`);
        console.log(`   Content-Type: ${contentType}`);
        
        if (status === 200) {
          successCount++;
          console.log(`   ✅ SUCESSO`);
          
          if (contentType.includes("application/json")) {
            try {
              const data = await res.json();
              if (Array.isArray(data)) {
                console.log(`   📊 Array com ${data.length} itens`);
                if (data.length > 0) {
                  console.log(`   📋 Primeiro item:`, JSON.stringify(data[0], null, 2).substring(0, 200) + '...');
                }
              } else if (typeof data === 'object') {
                console.log(`   📋 Resposta:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
              }
            } catch (parseError) {
              console.log(`   ⚠️  Erro ao parsear JSON: ${parseError.message}`);
            }
          } else {
            const text = await res.text();
            console.log(`   📄 Texto: ${text.substring(0, 100)}...`);
          }
        } else if (status === 401) {
          errorCount++;
          console.log(`   🔐 TOKEN INVÁLIDO/EXPIRADO`);
          try {
            const errorData = await res.text();
            console.log(`   📄 Erro: ${errorData.substring(0, 200)}...`);
          } catch (e) {
            console.log(`   📄 Erro: Não foi possível ler resposta`);
          }
        } else if (status === 403) {
          errorCount++;
          console.log(`   🚫 ACESSO NEGADO`);
          try {
            const errorData = await res.text();
            console.log(`   📄 Erro: ${errorData.substring(0, 200)}...`);
          } catch (e) {
            console.log(`   📄 Erro: Não foi possível ler resposta`);
          }
        } else if (status >= 500) {
          errorCount++;
          console.log(`   💥 ERRO DO SERVIDOR`);
          try {
            const errorData = await res.text();
            console.log(`   📄 Erro: ${errorData.substring(0, 200)}...`);
          } catch (e) {
            console.log(`   📄 Erro: Não foi possível ler resposta`);
          }
        } else {
          errorCount++;
          console.log(`   ⚠️  STATUS INESPERADO`);
          try {
            const errorData = await res.text();
            console.log(`   📄 Resposta: ${errorData.substring(0, 200)}...`);
          } catch (e) {
            console.log(`   📄 Resposta: Não foi possível ler`);
          }
        }
        
      } catch (err) {
        errorCount++;
        console.log(`   💥 ERRO DE REDE: ${err.message}`);
      }
      
      console.log('');
    }

    // Resumo final
    console.log('📊 RESUMO DA VERIFICAÇÃO COM LOGIN');
    console.log('===================================');
    console.log(`Total de endpoints protegidos: ${protectedEndpoints.length}`);
    console.log(`✅ Sucessos: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log('');
    
    if (errorCount === 0) {
      console.log('✅ TODOS OS ENDPOINTS PROTEGIDOS ESTÃO FUNCIONANDO!');
      console.log('🎯 O problema está no frontend não enviando o token corretamente');
    } else {
      console.log('🚨 PROBLEMAS IDENTIFICADOS:');
      console.log('- Alguns endpoints podem estar com problemas');
      console.log('- Verifique os logs do backend para mais detalhes');
    }
    
    console.log('');
    console.log('💡 DIAGNÓSTICO:');
    console.log('1. Se /api/products retorna 200 com dados → API funcionando');
    console.log('2. Se /api/products retorna 401 → Token inválido/expirado');
    console.log('3. Se /api/products retorna 403 → Usuário sem permissão');
    console.log('4. Se /api/products retorna 500 → Erro no backend');
    console.log('');
    console.log('🔧 PRÓXIMOS PASSOS:');
    console.log('1. Se API funciona aqui mas não no frontend → problema de token');
    console.log('2. Se API não funciona aqui → problema no backend');
    console.log('3. Verificar se o frontend está enviando o token corretamente');

    // Fazer logout
    await supabase.auth.signOut();
    console.log('👋 Logout realizado');

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar teste
testAPIWithLogin().then(() => {
  console.log('\n=== TESTE CONCLUÍDO ===');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
