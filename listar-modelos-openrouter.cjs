const axios = require('axios');

async function listarModelosOpenRouter() {
  console.log('🔍 LISTANDO MODELOS DISPONÍVEIS - OPENROUTER');
  console.log('=============================================');
  
  const chave = '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';
  console.log('🔑 Chave:', chave.substring(0, 10) + '...');
  console.log('');
  
  const apiUrl = 'https://openrouter.ai/api/v1/models';

  try {
    console.log('📡 Consultando modelos disponíveis...');
    
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${chave}`,
        'User-Agent': 'ControlFlow/1.0'
      },
      timeout: 15000
    });
    
    console.log('✅ SUCESSO! Modelos encontrados:');
    console.log('📊 Status:', response.status);
    console.log('');
    
    const modelos = response.data.data;
    console.log('📋 MODELOS DISPONÍVEIS:');
    console.log('========================');
    
    // Filtrar modelos gratuitos
    const modelosGratuitos = modelos.filter(modelo => 
      modelo.pricing && modelo.pricing.prompt === '0' && modelo.pricing.completion === '0'
    );
    
    console.log(`🎯 MODELOS GRATUITOS (${modelosGratuitos.length} encontrados):`);
    console.log('==========================================');
    
    modelosGratuitos.forEach((modelo, index) => {
      console.log(`${index + 1}. ID: ${modelo.id}`);
      console.log(`   Nome: ${modelo.name}`);
      console.log(`   Provedor: ${modelo.provider}`);
      console.log(`   Contexto: ${modelo.context_length}`);
      console.log(`   Prompt: $${modelo.pricing.prompt}/1M tokens`);
      console.log(`   Completion: $${modelo.pricing.completion}/1M tokens`);
      console.log('');
    });
    
    // Mostrar alguns modelos pagos populares também
    console.log('💰 MODELOS PAGOS POPULARES:');
    console.log('============================');
    
    const modelosPagos = modelos.filter(modelo => 
      modelo.id.includes('gpt-4') || modelo.id.includes('claude') || modelo.id.includes('gemini')
    ).slice(0, 5);
    
    modelosPagos.forEach((modelo, index) => {
      console.log(`${index + 1}. ID: ${modelo.id}`);
      console.log(`   Nome: ${modelo.name}`);
      console.log(`   Provedor: ${modelo.provider}`);
      console.log(`   Prompt: $${modelo.pricing.prompt}/1M tokens`);
      console.log(`   Completion: $${modelo.pricing.completion}/1M tokens`);
      console.log('');
    });
    
    return true;
    
  } catch (error) {
    console.log('❌ Erro ao listar modelos:');
    
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📝 Erro:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('💡 Problema: Chave da API inválida');
      } else if (error.response.status === 403) {
        console.log('💡 Problema: Sem permissão para listar modelos');
      }
    } else if (error.request) {
      console.log('🌐 Erro de rede:', error.message);
    } else {
      console.log('❓ Erro desconhecido:', error.message);
    }
    
    return false;
  }
}

// Executar teste
listarModelosOpenRouter().then(sucesso => {
  if (sucesso) {
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('1. Escolha um modelo gratuito da lista acima');
    console.log('2. Atualize o código com o ID correto');
    console.log('3. Teste novamente a API');
  } else {
    console.log('\n❌ Não foi possível listar os modelos');
    console.log('💡 Verifique a chave da API ou conexão');
  }
});
