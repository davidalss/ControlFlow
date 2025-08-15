const axios = require('axios');

async function testarOpenRouter() {
  console.log('🧪 TESTE OPENROUTER API - ControlFlow');
  console.log('======================================');
  
  // OpenRouter tem modelos gratuitos mais acessíveis
  const chave = 'sk-or-v1-1234567890abcdef'; // Chave de exemplo - você precisará criar uma conta
  console.log('🔑 Chave OpenRouter (exemplo):', chave.substring(0, 10) + '...');
  console.log('📊 Modelos gratuitos disponíveis: llama-3.1-8b, mistral-7b, etc.');
  console.log('');
  
  const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  
  const requestData = {
    model: "meta-llama/llama-3.1-8b-instruct", // Modelo gratuito
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
    
    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA!');
    console.log('✅ OpenRouter API funcionando perfeitamente');
    console.log('✅ Severino com IA ativa e inteligente');
    console.log('✅ Modelos gratuitos disponíveis');
    console.log('✅ Sem problemas de quota');
    
    return true;
    
  } catch (error) {
    console.log('❌ Erro na API:');
    
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📝 Erro:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('💡 Problema: Chave da API inválida');
        console.log('💡 Solução: Crie uma conta em https://openrouter.ai');
      } else if (error.response.status === 402) {
        console.log('💡 Problema: Saldo insuficiente');
        console.log('💡 Solução: Verifique o saldo gratuito da conta');
      }
    } else if (error.request) {
      console.log('🌐 Erro de rede:', error.message);
    } else {
      console.log('❓ Erro desconhecido:', error.message);
    }
    
    return false;
  }
}

console.log('🚀 MIGRAÇÃO PARA OPENROUTER');
console.log('============================');
console.log('');
console.log('📝 VANTAGENS DA OPENROUTER:');
console.log('• Modelos gratuitos mais acessíveis');
console.log('• Não requer cartão de crédito');
console.log('• Múltiplos provedores de IA');
console.log('• Limites generosos');
console.log('');
console.log('🔗 CRIE SUA CONTA:');
console.log('https://openrouter.ai');
console.log('');
console.log('📋 MODELOS GRATUITOS DISPONÍVEIS:');
console.log('• meta-llama/llama-3.1-8b-instruct');
console.log('• mistralai/mistral-7b-instruct');
console.log('• google/gemma-2-9b-it');
console.log('• microsoft/phi-3-mini-4k-instruct');
console.log('');

// Executar teste
testarOpenRouter().then(sucesso => {
  if (sucesso) {
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('1. Crie uma conta em https://openrouter.ai');
    console.log('2. Obtenha sua chave API gratuita');
    console.log('3. Atualize o código com a nova chave');
    console.log('4. Teste o Severino no navegador');
  } else {
    console.log('\n❌ Ainda com problemas');
    console.log('💡 Crie uma conta gratuita em OpenRouter');
  }
});
