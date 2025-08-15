const axios = require('axios');

async function testarComVPN() {
  console.log('🧪 TESTE COM VPN - GEMINI API');
  console.log('==============================');
  
  const chave = 'AIzaSyC3fcnb_xcF54I-pC4u3mxlN8kznT7nY9Q';
  console.log('🔑 Chave:', chave.substring(0, 10) + '...');
  
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
    
    const response = await axios.post(`${apiUrl}?key=${chave}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ControlFlow/1.0'
      },
      timeout: 15000
    });
    
    console.log('✅ SUCESSO! VPN funcionando!');
    console.log('📊 Status:', response.status);
    console.log('📝 Resposta da IA:');
    console.log(response.data.candidates[0].content.parts[0].text);
    
    console.log('\n🎉 PROBLEMA RESOLVIDO!');
    console.log('✅ IP desbloqueado com VPN');
    console.log('✅ API Gemini funcionando');
    console.log('✅ Severino com IA ativa');
    
    return true;
    
  } catch (error) {
    console.log('❌ Erro na API:');
    
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📝 Erro:', error.response.data);
      
      if (error.response.status === 429) {
        console.log('💡 Ainda com quota excedida');
        console.log('💡 Tente conectar em outro servidor VPN');
      } else if (error.response.status === 400) {
        console.log('💡 Problema: Chave da API inválida');
      } else if (error.response.status === 403) {
        console.log('💡 Problema: Chave da API sem permissões');
      }
    } else if (error.request) {
      console.log('🌐 Erro de rede:', error.message);
      console.log('💡 Verifique se a VPN está conectada');
    } else {
      console.log('❓ Erro desconhecido:', error.message);
    }
    
    return false;
  }
}

// Executar teste
testarComVPN().then(sucesso => {
  if (sucesso) {
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('1. Teste o Severino no navegador');
    console.log('2. Acesse: http://localhost:5001');
    console.log('3. Faça login e teste o chat');
  } else {
    console.log('\n❌ Ainda com problemas');
    console.log('💡 Tente outro servidor VPN');
  }
});
