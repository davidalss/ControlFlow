/**
 * Script para criar tabela system_logs no Supabase
 * 
 * Uso:
 * node scripts/create-system-logs-table.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL para criar a tabela system_logs
const createTableSQL = `
CREATE TABLE IF NOT EXISTS system_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    test_suite text NOT NULL,
    test_name text NOT NULL,
    route text NOT NULL,
    status_code integer,
    response_time_ms integer,
    cors_ok boolean DEFAULT false,
    passed boolean DEFAULT false,
    error_message text,
    meta jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);
`;

// SQL para criar índices
const createIndexesSQL = `
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_test_suite ON system_logs(test_suite);
CREATE INDEX IF NOT EXISTS idx_system_logs_route ON system_logs(route);
CREATE INDEX IF NOT EXISTS idx_system_logs_passed ON system_logs(passed);
CREATE INDEX IF NOT EXISTS idx_system_logs_status_code ON system_logs(status_code);
`;

// SQL para adicionar comentários
const addCommentsSQL = `
COMMENT ON TABLE system_logs IS 'Logs de testes automatizados e healthchecks do sistema';
COMMENT ON COLUMN system_logs.test_suite IS 'Nome da suíte de testes (ex: healthcheck, contract, smoke)';
COMMENT ON COLUMN system_logs.test_name IS 'Nome específico do teste';
COMMENT ON COLUMN system_logs.route IS 'Rota da API testada';
COMMENT ON COLUMN system_logs.status_code IS 'Código de status HTTP retornado';
COMMENT ON COLUMN system_logs.response_time_ms IS 'Tempo de resposta em milissegundos';
COMMENT ON COLUMN system_logs.cors_ok IS 'Se os headers CORS estão corretos';
COMMENT ON COLUMN system_logs.passed IS 'Se o teste passou (true) ou falhou (false)';
COMMENT ON COLUMN system_logs.error_message IS 'Mensagem de erro se o teste falhou';
COMMENT ON COLUMN system_logs.meta IS 'Dados adicionais em formato JSON';
COMMENT ON COLUMN system_logs.created_at IS 'Timestamp de criação do log';
`;

async function createSystemLogsTable() {
  try {
    console.log('🚀 Criando tabela system_logs no Supabase...');
    console.log(`📍 URL: ${supabaseUrl}`);
    console.log('');

    // 1. Criar tabela
    console.log('📋 Criando tabela system_logs...');
    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (tableError) {
      console.error('❌ Erro ao criar tabela:', tableError);
      throw tableError;
    }
    console.log('✅ Tabela system_logs criada com sucesso!');

    // 2. Criar índices
    console.log('📊 Criando índices...');
    const { error: indexError } = await supabase.rpc('exec_sql', { sql: createIndexesSQL });
    
    if (indexError) {
      console.error('❌ Erro ao criar índices:', indexError);
      throw indexError;
    }
    console.log('✅ Índices criados com sucesso!');

    // 3. Adicionar comentários
    console.log('💬 Adicionando comentários...');
    const { error: commentError } = await supabase.rpc('exec_sql', { sql: addCommentsSQL });
    
    if (commentError) {
      console.error('❌ Erro ao adicionar comentários:', commentError);
      throw commentError;
    }
    console.log('✅ Comentários adicionados com sucesso!');

    // 4. Verificar se a tabela foi criada
    console.log('🔍 Verificando tabela...');
    const { data: tables, error: checkError } = await supabase
      .from('system_logs')
      .select('*')
      .limit(1);

    if (checkError) {
      console.error('❌ Erro ao verificar tabela:', checkError);
      throw checkError;
    }

    console.log('');
    console.log('🎉 Tabela system_logs criada e configurada com sucesso!');
    console.log('📊 A tabela está pronta para receber logs de testes automatizados.');
    console.log('');
    console.log('📋 Estrutura da tabela:');
    console.log('   - id: uuid (chave primária)');
    console.log('   - test_suite: text (nome da suíte)');
    console.log('   - test_name: text (nome do teste)');
    console.log('   - route: text (rota testada)');
    console.log('   - status_code: integer (código HTTP)');
    console.log('   - response_time_ms: integer (tempo resposta)');
    console.log('   - cors_ok: boolean (CORS válido)');
    console.log('   - passed: boolean (teste passou)');
    console.log('   - error_message: text (mensagem erro)');
    console.log('   - meta: jsonb (dados adicionais)');
    console.log('   - created_at: timestamptz (timestamp)');

  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createSystemLogsTable();
}

export default createSystemLogsTable;
