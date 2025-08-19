import fetch from 'node-fetch';

const BACKEND_URL = 'https://enso-backend-0aa1.onrender.com';
const FRONTEND_URL = 'https://ensoapp.netlify.app';

async function testCORS() {
  console.log('🔍 Testando configuração CORS...');
  console.log('Backend:', BACKEND_URL);
  console.log('Frontend:', FRONTEND_URL);
  
  try {
    // Teste 1: Health check
    console.log('\n1. Testando health check...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Health check status:', healthResponse.status);
    console.log('CORS headers:', {
      'Access-Control-Allow-Origin': healthResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': healthResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': healthResponse.headers.get('Access-Control-Allow-Headers')
    });
    
    // Teste 2: API health check
    console.log('\n2. Testando API health check...');
    const apiHealthResponse = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API health check status:', apiHealthResponse.status);
    console.log('CORS headers:', {
      'Access-Control-Allow-Origin': apiHealthResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': apiHealthResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': apiHealthResponse.headers.get('Access-Control-Allow-Headers')
    });
    
    // Teste 3: Preflight request (OPTIONS)
    console.log('\n3. Testando preflight request...');
    const preflightResponse = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('Preflight status:', preflightResponse.status);
    console.log('Preflight CORS headers:', {
      'Access-Control-Allow-Origin': preflightResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': preflightResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': preflightResponse.headers.get('Access-Control-Allow-Headers')
    });
    
    // Teste 4: Simular requisição de produtos
    console.log('\n4. Testando requisição de produtos...');
    const productsResponse = await fetch(`${BACKEND_URL}/api/products`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('Products request status:', productsResponse.status);
    console.log('Products CORS headers:', {
      'Access-Control-Allow-Origin': productsResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': productsResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': productsResponse.headers.get('Access-Control-Allow-Headers')
    });
    
    console.log('\n✅ Teste CORS concluído!');
    console.log('📋 Resumo:');
    console.log('   - Health check:', healthResponse.status === 200 ? '✅' : '❌');
    console.log('   - API health:', apiHealthResponse.status === 200 ? '✅' : '❌');
    console.log('   - Preflight:', preflightResponse.status === 200 ? '✅' : '❌');
    console.log('   - Products:', productsResponse.status === 401 ? '✅ (auth required)' : '❌');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Executar o teste
console.log('🚀 Iniciando teste de CORS...');
testCORS()
  .then(() => {
    console.log('✅ Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
