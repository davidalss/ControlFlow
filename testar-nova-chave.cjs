const axios = require('axios');

async function testarNovaChave() {
  console.log('🧪 TESTANDO NOVA CHAVE GEMINI API');
  console.log('==================================');
  
  const novaChave = 'AIzaSyC3fcnb_xcF54I-pC4u3mxlN8kznT7nY9Q';
  console.log('🔑 Nova API Key:', novaChave.substring(0, 10) + '...');
  
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
  
  const requestData = {
    contents: [{
      parts: [{
        text: "Olá! Você é o Severino, um assistente de IA especializado em controle de qualidade. Responda de forma amigável e profissional."
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1000
    }
  };
  
  try {
    console.log('📡 Enviando requisição para Gemini API...');
    
    const response = await axios.post(`${apiUrl}?key=${novaChave}`, requestData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ SUCESSO! Nova chave funcionando!');
    console.log('📊 Status:', response.status);
    console.log('📝 Resposta da IA:');
    console.log(response.data.candidates[0].content.parts[0].text);
    
    return true;
    
  } catch (error) {
    console.log('❌ Erro na API:');
    
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📝 Erro:', error.response.data);
      
      if (error.response.status === 400) {
        console.log('💡 Problema: Chave da API inválida ou formato de requisição incorreto');
      } else if (error.response.status === 403) {
        console.log('💡 Problema: Chave da API sem permissões');
      } else if (error.response.status === 429) {
        console.log('💡 Problema: Rate limit excedido');
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
testarNovaChave().then(sucesso => {
  if (sucesso) {
    console.log('\n🎉 NOVA CHAVE FUNCIONANDO!');
    console.log('✅ Pode configurar no sistema');
  } else {
    console.log('\n❌ NOVA CHAVE COM PROBLEMA');
    console.log('❌ Verifique a chave ou tente novamente');
  }
});
