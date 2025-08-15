const axios = require('axios');

async function testeSimples() {
  console.log('🧪 TESTE SIMPLES GEMINI API');
  console.log('============================');
  
  const chave = 'AIzaSyC3fcnb_xcF54I-pC4u3mxlN8kznT7nY9Q';
  console.log('🔑 Chave:', chave.substring(0, 10) + '...');
  
  // Teste 1: Verificar se a URL está correta
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
  console.log('🌐 URL:', apiUrl);
  
  // Teste 2: Requisição mais simples
  const requestData = {
    contents: [{
      parts: [{
        text: "Diga apenas: Olá, teste funcionando!"
      }]
    }]
  };
  
  console.log('📝 Dados da requisição:', JSON.stringify(requestData, null, 2));
  
  try {
    console.log('📡 Enviando requisição...');
    
    const response = await axios.post(`${apiUrl}?key=${chave}`, requestData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ SUCESSO!');
    console.log('📊 Status:', response.status);
    console.log('📝 Resposta:', response.data.candidates[0].content.parts[0].text);
    
  } catch (error) {
    console.log('❌ ERRO:');
    console.log('📊 Status:', error.response?.status);
    console.log('📝 Mensagem:', error.response?.data?.error?.message);
    console.log('🔍 Código:', error.response?.data?.error?.code);
    
    // Verificar se é problema de quota ou outro erro
    if (error.response?.status === 429) {
      console.log('💡 PROBLEMA: Quota excedida mesmo com nova conta');
      console.log('💡 POSSÍVEIS CAUSAS:');
      console.log('   1. IP bloqueado por muitas tentativas');
      console.log('   2. Conta Google com restrições');
      console.log('   3. Problema temporário da API');
    } else if (error.response?.status === 400) {
      console.log('💡 PROBLEMA: Formato da requisição incorreto');
    } else if (error.response?.status === 403) {
      console.log('💡 PROBLEMA: Chave sem permissões');
    }
  }
}

testeSimples();
