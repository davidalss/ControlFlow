const axios = require('axios');

async function listarModelos() {
  console.log('🔍 LISTANDO MODELOS DISPONÍVEIS - DEEPSEEK API');
  console.log('==============================================');
  
  const chave = 'sk-c46c6bf0421c43ed864f5730318ff1ad';
  console.log('🔑 Chave:', chave.substring(0, 10) + '...');
  console.log('');
  
  const apiUrl = 'https://api.deepseek.com/v1/models';

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
    
    modelos.forEach((modelo, index) => {
      console.log(`${index + 1}. ID: ${modelo.id}`);
      console.log(`   Nome: ${modelo.object}`);
      console.log(`   Criado: ${new Date(modelo.created * 1000).toLocaleString()}`);
      console.log(`   Proprietário: ${modelo.owned_by}`);
      console.log('');
    });
    
    // Filtrar modelos gratuitos
    console.log('🎯 MODELOS GRATUITOS RECOMENDADOS:');
    console.log('===================================');
    
    const modelosGratuitos = modelos.filter(modelo => 
      modelo.id.includes('deepseek') && 
      (modelo.id.includes('chat') || modelo.id.includes('raciocinador') || modelo.id.includes('r1'))
    );
    
    if (modelosGratuitos.length > 0) {
      modelosGratuitos.forEach((modelo, index) => {
        console.log(`${index + 1}. ${modelo.id} (${modelo.owned_by})`);
      });
    } else {
      console.log('❌ Nenhum modelo gratuito encontrado');
      console.log('💡 Verifique a documentação da DeepSeek');
    }
    
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
listarModelos().then(sucesso => {
  if (sucesso) {
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('1. Escolha um modelo da lista acima');
    console.log('2. Atualize o código com o ID correto');
    console.log('3. Teste novamente a API');
  } else {
    console.log('\n❌ Não foi possível listar os modelos');
    console.log('💡 Verifique a chave da API ou documentação');
  }
});
