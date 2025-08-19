// Script para testar o middleware de autenticação
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testando middleware de autenticação...\n');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Variáveis do Supabase não configuradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testMiddleware() {
  try {
    console.log('1. Testando autenticação com token inválido...');
    
    // Simular uma requisição com token inválido
    const mockReq = {
      headers: {
        authorization: 'Bearer invalid-token'
      }
    };
    
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`Status: ${code}, Response:`, data);
          return mockRes;
        }
      })
    };
    
    const mockNext = () => {
      console.log('✅ Next() chamado - autenticação passou');
    };
    
    // Importar e testar o middleware
    const { authenticateSupabaseToken } = await import('./server/middleware/supabaseAuth.js');
    
    await authenticateSupabaseToken(mockReq, mockRes, mockNext);
    
    console.log('\n2. Testando autenticação sem token...');
    
    const mockReqNoToken = {
      headers: {}
    };
    
    await authenticateSupabaseToken(mockReqNoToken, mockRes, mockNext);
    
    console.log('\n3. Testando conexão com Supabase...');
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .limit(1);
      
    if (error) {
      console.log('❌ Erro ao acessar users:', error.message);
    } else {
      console.log('✅ Conexão com Supabase funcionando');
      console.log('📊 Usuários encontrados:', users?.length || 0);
      
      if (users && users.length > 0) {
        console.log('👤 Exemplo de usuário:', users[0]);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testMiddleware().then(() => {
  console.log('\n✅ Teste do middleware concluído');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
