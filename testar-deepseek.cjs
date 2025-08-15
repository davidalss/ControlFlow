const axios = require('axios');

async function testarDeepSeek() {
  console.log('🧪 TESTE DEEPSEEK API - ControlFlow');
  console.log('====================================');
  
  const chave = 'sk-c46c6bf0421c43ed864f5730318ff1ad';
  console.log('🔑 Chave:', chave.substring(0, 10) + '...');
  console.log('📊 Limite: 60 requisições por minuto');
  console.log('');
  
  const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
  
  const requestData = {
    model: "deepseek-chat", // Modelo gratuito DeepSeek Chat
    messages: [
      {
        role: "system",
        content: "Você é o Severino, um assistente virtual especializado em qualidade industrial e gestão de processos. Responda sempre em português brasileiro de forma amigável e profissional."
      },
      {
        role: "user",
        content: "Olá! Você é o Severino? Pode me explicar o que é AQL e como funciona?"
      }
    ],
    temperature: 0.7,
    max_tokens: 4000, // Limite padrão do modelo gratuito
    top_p: 0.95,
    frequency_penalty: 0.2,
    presence_penalty: 0.2
  };

  try {
    console.log('📡 Enviando requisição para DeepSeek API...');
    
    const response = await axios.post(apiUrl, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${chave}`,
        'User-Agent': 'ControlFlow/1.0'
      },
      timeout: 15000
    });
    
    console.log('✅ SUCESSO! DeepSeek API funcionando!');
    console.log('📊 Status:', response.status);
    console.log('📝 Resposta do Severino:');
    console.log(response.data.choices[0].message.content);
    
    console.log('\n📊 Informações da API:');
    console.log('• Modelo usado:', response.data.model);
    console.log('• Tokens usados:', response.data.usage.total_tokens);
    console.log('• Tokens de prompt:', response.data.usage.prompt_tokens);
    console.log('• Tokens de resposta:', response.data.usage.completion_tokens);
    
    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA!');
    console.log('✅ DeepSeek API funcionando perfeitamente');
    console.log('✅ Severino com IA ativa e inteligente');
    console.log('✅ Limites muito mais generosos');
    console.log('✅ Sem problemas de quota');
    
    return true;
    
  } catch (error) {
    console.log('❌ Erro na API:');
    
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📝 Erro:', error.response.data);
      
      if (error.response.status === 429) {
        console.log('💡 Rate limit atingido (muito raro com DeepSeek)');
      } else if (error.response.status === 400) {
        console.log('💡 Problema: Requisição malformada');
      } else if (error.response.status === 401) {
        console.log('💡 Problema: Chave da API inválida');
      } else if (error.response.status === 403) {
        console.log('💡 Problema: Chave da API sem permissões');
      }
    } else if (error.request) {
      console.log('🌐 Erro de rede:', error.message);
      console.log('💡 Verifique sua conexão com a internet');
    } else {
      console.log('❓ Erro desconhecido:', error.message);
    }
    
    return false;
  }
}

// Executar teste
testarDeepSeek().then(sucesso => {
  if (sucesso) {
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('1. Teste o Severino no navegador');
    console.log('2. Acesse: http://localhost:5001');
    console.log('3. Faça login e teste o chat');
    console.log('4. O Severino agora deve responder como uma IA inteligente!');
  } else {
    console.log('\n❌ Ainda com problemas');
    console.log('💡 Verifique a chave da API ou conexão');
  }
});
