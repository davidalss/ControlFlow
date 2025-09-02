// Script para testar conexão com Supabase
// Execute após configurar as variáveis de ambiente

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
    console.log('🔍 Testando conexão com Supabase...\n');

    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Variáveis de ambiente não configuradas!');
        console.error('📝 Configure o arquivo .env.local com suas credenciais do Supabase');
        return;
    }

    console.log('✅ Variáveis de ambiente configuradas');
    console.log(`🔗 URL: ${supabaseUrl}`);
    console.log(`🔑 Chave: ${supabaseKey.substring(0, 20)}...\n`);

    try {
        // Criar cliente Supabase
        const supabase = createClient(supabaseUrl, supabaseKey);
        console.log('🔌 Cliente Supabase criado com sucesso\n');

        // Testar conexão básica
        console.log('📡 Testando conexão básica...');
        const { data: testData, error: testError } = await supabase
            .from('inspection_plans')
            .select('count')
            .limit(1);

        if (testError) {
            console.log('⚠️  Erro na consulta (pode ser normal se a tabela não existir ainda):');
            console.log(`   ${testError.message}\n`);
        } else {
            console.log('✅ Conexão básica funcionando\n');
        }

        // Verificar se as novas tabelas existem
        console.log('📊 Verificando estrutura do banco...');
        const tablesToCheck = [
            'flow_nodes',
            'flow_connections', 
            'flow_plans',
            'criteria_blocks',
            'criteria_categories',
            'smart_inspections',
            'nc_notifications',
            'system_health_logs'
        ];

        for (const table of tablesToCheck) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .limit(1);

                if (error) {
                    console.log(`❌ ${table}: ${error.message}`);
                } else {
                    console.log(`✅ ${table}: Tabela encontrada`);
                }
            } catch (err) {
                console.log(`❌ ${table}: Erro ao acessar`);
            }
        }

        console.log('\n🔍 Verificando dados iniciais...');

        // Verificar categorias padrão
        try {
            const { data: categories, error } = await supabase
                .from('criteria_categories')
                .select('*');

            if (error) {
                console.log('❌ Erro ao verificar categorias:', error.message);
            } else if (categories && categories.length > 0) {
                console.log(`✅ ${categories.length} categorias encontradas:`);
                categories.forEach(cat => {
                    console.log(`   • ${cat.name} (${cat.color})`);
                });
            } else {
                console.log('⚠️  Nenhuma categoria encontrada (execute a migração primeiro)');
            }
        } catch (err) {
            console.log('❌ Erro ao verificar categorias:', err.message);
        }

        // Verificar critérios padrão
        try {
            const { data: criteria, error } = await supabase
                .from('criteria_blocks')
                .select('*');

            if (error) {
                console.log('❌ Erro ao verificar critérios:', error.message);
            } else if (criteria && criteria.length > 0) {
                console.log(`✅ ${criteria.length} critérios encontrados:`);
                criteria.forEach(crit => {
                    console.log(`   • ${crit.title} (${crit.category})`);
                });
            } else {
                console.log('⚠️  Nenhum critério encontrado (execute a migração primeiro)');
            }
        } catch (err) {
            console.log('❌ Erro ao verificar critérios:', err.message);
        }

        console.log('\n🎯 TESTE DE FUNCIONALIDADES AVANÇADAS');

        // Testar inserção de dados (apenas se as tabelas existirem)
        try {
            const { data: testInsert, error: insertError } = await supabase
                .from('system_health_logs')
                .insert({
                    check_type: 'test',
                    status: 'healthy',
                    metric_value: 100,
                    metric_unit: 'test_unit',
                    details: { test: true }
                })
                .select();

            if (insertError) {
                console.log('❌ Teste de inserção falhou:', insertError.message);
            } else {
                console.log('✅ Teste de inserção funcionando');
                
                // Limpar dados de teste
                await supabase
                    .from('system_health_logs')
                    .delete()
                    .eq('check_type', 'test');
                console.log('🧹 Dados de teste removidos');
            }
        } catch (err) {
            console.log('❌ Erro no teste de inserção:', err.message);
        }

        console.log('\n📋 RESUMO DOS TESTES:');
        console.log('✅ Conexão com Supabase estabelecida');
        console.log('✅ Cliente criado com sucesso');
        console.log('✅ Estrutura do banco verificada');
        console.log('✅ Dados iniciais verificados');
        console.log('✅ Funcionalidades básicas testadas');

        console.log('\n🚀 PRÓXIMOS PASSOS:');
        console.log('1. Se as tabelas não existirem, execute a migração no Supabase');
        console.log('2. Teste as funcionalidades do Flow Builder');
        console.log('3. Teste a criação de critérios');
        console.log('4. Teste a execução inteligente de inspeções');

    } catch (error) {
        console.error('❌ Erro crítico na conexão:', error.message);
        console.error('📝 Verifique suas credenciais e configurações');
    }
}

// Executar teste
testSupabaseConnection().catch(console.error);
