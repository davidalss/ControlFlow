const axios = require('axios');
require('dotenv').config();

async function testarGeminiAPI() {
  console.log('🧪 TESTANDO API GEMINI');
  console.log('========================');
  
  // Verificar se a chave está configurada
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('🔑 API Key configurada:', apiKey ? '✅ SIM' : '❌ NÃO');
  
  if (!apiKey) {
    console.log('❌ GEMINI_API_KEY não encontrada no .env');
    return;
  }
  
  console.log('🔑 API Key (primeiros 10 chars):', apiKey.substring(0, 10) + '...');
  
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
    
    const response = await axios.post(`${apiUrl}?key=${apiKey}`, requestData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ Resposta recebida!');
    console.log('📊 Status:', response.status);
    console.log('📝 Resposta da IA:');
    console.log(response.data.candidates[0].content.parts[0].text);
    
  } catch (error) {
    console.log('❌ Erro na API:');
    
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📝 Erro:', error.response.data);
      
      if (error.response.status === 400) {
        console.log('💡 Possível problema: Chave da API inválida ou formato de requisição incorreto');
      } else if (error.response.status === 403) {
        console.log('💡 Possível problema: Chave da API sem permissões ou quota excedida');
      } else if (error.response.status === 429) {
        console.log('💡 Possível problema: Rate limit excedido');
      }
    } else if (error.request) {
      console.log('🌐 Erro de rede:', error.message);
    } else {
      console.log('❓ Erro desconhecido:', error.message);
    }
  }
}

// Executar teste
testarGeminiAPI();
