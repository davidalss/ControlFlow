const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://smvohmdytczfouslcaju.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9obWR5dGN6Zm91c2xjYWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTk1MzQsImV4cCI6MjA3MTA5NTUzNH0.0qJpEQVooxEDsRa26MhqDk76ACb7Tg-Qutswoegdk7U';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('=== TESTE DE AUTENTICAÇÃO SUPABASE ===');
  
  try {
    // Verificar sessão atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Erro ao obter sessão:', sessionError);
      return;
    }
    
    if (session) {
      console.log('✅ Sessão encontrada:', {
        userId: session.user.id,
        email: session.user.email,
        expiresAt: session.expires_at
      });
      
      // Testar requisição para a API
      const token = session.access_token;
      console.log('Token presente:', !!token);
      
      // Testar requisição para /api/sgq/rnc
      const response = await fetch('http://localhost:3001/api/sgq/rnc', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Status da resposta:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Resposta da API:', data);
      } else {
        const errorText = await response.text();
        console.error('❌ Erro na API:', errorText);
      }
      
    } else {
      console.log('❌ Nenhuma sessão ativa encontrada');
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testAuth();
