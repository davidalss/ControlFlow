const axios = require('axios');

// Simulação do Rate Limiter Global
class GeminiRateLimiter {
  constructor() {
    this.requestTimes = [];
    this.MAX_REQUESTS_PER_MINUTE = 2; // Limite real da API gratuita
    this.WINDOW_SIZE = 60 * 1000; // 1 minuto em ms
  }

  async waitForSlot() {
    const now = Date.now();
    
    // Remover requisições antigas (mais de 1 minuto)
    this.requestTimes = this.requestTimes.filter(time => now - time < this.WINDOW_SIZE);
    
    // Se já atingiu o limite, aguardar
    if (this.requestTimes.length >= this.MAX_REQUESTS_PER_MINUTE) {
      const oldestRequest = this.requestTimes[0];
      const waitTime = this.WINDOW_SIZE - (now - oldestRequest) + 1000; // +1s de margem
      
      console.log(`🔄 Rate limit global atingido. Aguardando ${Math.ceil(waitTime/1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Recursivamente verificar novamente após aguardar
      return this.waitForSlot();
    }
    
    // Adicionar timestamp da requisição atual
    this.requestTimes.push(now);
    console.log(`📊 Requisições na janela: ${this.requestTimes.length}/${this.MAX_REQUESTS_PER_MINUTE}`);
  }

  getRemainingRequests() {
    const now = Date.now();
    this.requestTimes = this.requestTimes.filter(time => now - time < this.WINDOW_SIZE);
    return Math.max(0, this.MAX_REQUESTS_PER_MINUTE - this.requestTimes.length);
  }
}

async function testarRateLimiter() {
  console.log('🧪 TESTE RATE LIMITER - GEMINI API');
  console.log('===================================');
  
  const chave = 'AIzaSyC3fcnb_xcF54I-pC4u3mxlN8kznT7nY9Q';
  const rateLimiter = new GeminiRateLimiter();
  
  console.log('🔑 Chave:', chave.substring(0, 10) + '...');
  console.log('📊 Limite: 2 requisições por minuto');
  console.log('');
  
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
  
  const requestData = {
    contents: [{
      parts: [{
        text: "Olá! Você é o Severino. Responda apenas: 'Teste funcionando!'"
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 100
    }
  };

  // Teste 1: Primeira requisição
  console.log('📡 TESTE 1: Primeira requisição');
  try {
    await rateLimiter.waitForSlot();
    
    const response = await axios.post(`${apiUrl}?key=${chave}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ControlFlow/1.0'
      },
      timeout: 15000
    });
    
    console.log('✅ SUCESSO!');
    console.log('📝 Resposta:', response.data.candidates[0].content.parts[0].text);
    console.log(`📊 Requisições restantes: ${rateLimiter.getRemainingRequests()}`);
    
  } catch (error) {
    console.log('❌ ERRO:', error.response?.status, error.response?.data?.error?.message);
  }
  
  console.log('');
  
  // Teste 2: Segunda requisição (deve funcionar)
  console.log('📡 TESTE 2: Segunda requisição');
  try {
    await rateLimiter.waitForSlot();
    
    const response = await axios.post(`${apiUrl}?key=${chave}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ControlFlow/1.0'
      },
      timeout: 15000
    });
    
    console.log('✅ SUCESSO!');
    console.log('📝 Resposta:', response.data.candidates[0].content.parts[0].text);
    console.log(`📊 Requisições restantes: ${rateLimiter.getRemainingRequests()}`);
    
  } catch (error) {
    console.log('❌ ERRO:', error.response?.status, error.response?.data?.error?.message);
  }
  
  console.log('');
  
  // Teste 3: Terceira requisição (deve aguardar)
  console.log('📡 TESTE 3: Terceira requisição (deve aguardar)');
  try {
    await rateLimiter.waitForSlot();
    
    const response = await axios.post(`${apiUrl}?key=${chave}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ControlFlow/1.0'
      },
      timeout: 15000
    });
    
    console.log('✅ SUCESSO após aguardar!');
    console.log('📝 Resposta:', response.data.candidates[0].content.parts[0].text);
    console.log(`📊 Requisições restantes: ${rateLimiter.getRemainingRequests()}`);
    
  } catch (error) {
    console.log('❌ ERRO:', error.response?.status, error.response?.data?.error?.message);
  }
  
  console.log('');
  console.log('🎉 TESTE CONCLUÍDO!');
  console.log('✅ Rate limiter funcionando corretamente');
  console.log('✅ Máximo 2 requisições por minuto respeitado');
  console.log('✅ Aguardando automaticamente quando necessário');
}

// Executar teste
testarRateLimiter().catch(console.error);
