const axios = require('axios');

async function testarOpenRouterFinal() {
  console.log('🧪 TESTE FINAL OPENROUTER API - ControlFlow');
  console.log('============================================');
  
  const chave = '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';
  console.log('🔑 Chave:', chave.substring(0, 10) + '...');
  console.log('📊 Modelo: DeepSeek R1 (gratuito)');
  console.log('');
  
  const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  
  const requestData = {
    model: "deepseek/deepseek-r1:free", // Modelo gratuito OpenRouter
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
    max_tokens: 1000,
    top_p: 0.95
  };

  try {
    console.log('📡 Enviando requisição para OpenRouter API...');
    
    const response = await axios.post(apiUrl, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${chave}`,
        'HTTP-Referer': 'http://localhost:5001',
        'X-Title': 'ControlFlow'
      },
      timeout: 15000
    });
    
    console.log('✅ SUCESSO! OpenRouter API funcionando!');
    console.log('📊 Status:', response.status);
    console.log('📝 Resposta do Severino:');
    console.log(response.data.choices[0].message.content);
    
    console.log('\n📊 Informações da API:');
    console.log('• Modelo usado:', response.data.model);
    console.log('• Tokens usados:', response.data.usage.total_tokens);
    console.log('• Tokens de prompt:', response.data.usage.prompt_tokens);
    console.log('• Tokens de resposta:', response.data.usage.completion_tokens);
    
    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('✅ OpenRouter API funcionando perfeitamente');
    console.log('✅ Severino com IA ativa e inteligente');
    console.log('✅ Modelo DeepSeek R1 (gratuito) configurado');
    console.log('✅ Sem problemas de quota');
    console.log('✅ Sistema pronto para uso');
    
    return true;
    
  } catch (error) {
    console.log('❌ Erro na API:');
    
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📝 Erro:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('💡 Problema: Chave da API inválida');
      } else if (error.response.status === 402) {
        console.log('💡 Problema: Saldo insuficiente');
      } else if (error.response.status === 429) {
        console.log('💡 Problema: Rate limit atingido');
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
testarOpenRouterFinal().then(sucesso => {
  if (sucesso) {
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('1. Teste o Severino no navegador');
    console.log('2. Acesse: http://localhost:5001');
    console.log('3. Faça login e teste o chat');
    console.log('4. O Severino agora deve responder como uma IA inteligente!');
    console.log('');
    console.log('🎯 RESULTADO ESPERADO:');
    console.log('• Severino com IA ativa');
    console.log('• Respostas inteligentes e contextuais');
    console.log('• Sem mais modo offline');
    console.log('• Performance de alta qualidade');
  } else {
    console.log('\n❌ Ainda com problemas');
    console.log('💡 Verifique a chave da API ou conexão');
  }
});
