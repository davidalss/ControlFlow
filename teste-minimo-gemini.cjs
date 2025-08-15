const axios = require('axios');

async function testeMinimo() {
  console.log('🧪 TESTE MÍNIMO GEMINI API');
  console.log('===========================');
  
  const chave = 'AIzaSyC3fcnb_xcF54I-pC4u3mxlN8kznT7nY9Q';
  console.log('🔑 Chave:', chave.substring(0, 10) + '...');
  
  // Teste com fetch nativo (mais simples)
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
  
  const requestData = {
    contents: [{
      parts: [{
        text: "Olá"
      }]
    }]
  };
  
  console.log('📡 Testando com fetch nativo...');
  
  try {
    const response = await fetch(`${apiUrl}?key=${chave}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ControlFlow/1.0'
      },
      body: JSON.stringify(requestData)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCESSO com fetch!');
      console.log('📝 Resposta:', data.candidates[0].content.parts[0].text);
    } else {
      console.log('❌ ERRO com fetch:');
      console.log('📊 Status:', response.status);
      const errorData = await response.text();
      console.log('📝 Erro:', errorData);
    }
    
  } catch (error) {
    console.log('❌ ERRO de rede:', error.message);
  }
  
  console.log('\n📡 Testando com axios...');
  
  try {
    const response = await axios.post(`${apiUrl}?key=${chave}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ControlFlow/1.0'
      },
      timeout: 10000
    });
    
    console.log('✅ SUCESSO com axios!');
    console.log('📝 Resposta:', response.data.candidates[0].content.parts[0].text);
    
  } catch (error) {
    console.log('❌ ERRO com axios:');
    console.log('📊 Status:', error.response?.status);
    console.log('📝 Mensagem:', error.response?.data?.error?.message);
  }
}

testeMinimo();
