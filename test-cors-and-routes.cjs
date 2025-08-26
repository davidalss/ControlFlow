const axios = require('axios');

const BACKEND_URL = 'https://enso-backend-0aa1.onrender.com';
const FRONTEND_URL = 'https://enso-frontend-pp6s.onrender.com';

// 1. Teste de CORS Headers
async function testCors() {
  console.log('\n🔍 Testando CORS Headers...');
  
  try {
    const res = await axios.get(`${BACKEND_URL}/api/products`, {
      headers: { 
        Origin: FRONTEND_URL,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ CORS OK:', res.status);
    console.log('   Headers CORS:', {
      'Access-Control-Allow-Origin': res.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': res.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': res.headers['access-control-allow-headers']
    });
  } catch (err) {
    console.error('❌ CORS FAIL:', err.response?.status, err.response?.headers);
    if (err.response?.headers) {
      console.log('   Headers recebidos:', err.response.headers);
    }
  }
}

// 2. Teste de Rotas Existentes
async function testRoutes() {
  console.log('\n🔍 Testando Rotas Existentes...');
  
  const routes = [
    "/api/products",
    "/api/suppliers?limit=10",
    "/api/suppliers/stats/overview",
    "/api/inspection-plans"
  ];

  for (const route of routes) {
    try {
      const response = await fetch(`${BACKEND_URL}${route}`, {
        headers: {
          'Origin': FRONTEND_URL,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ ${route} -> ${response.status} ${response.statusText}`);
      
      if (response.status === 401) {
        console.log('   ℹ️  Status 401 é esperado (autenticação requerida)');
      }
      
    } catch (error) {
      console.error(`❌ ${route} -> FAIL: ${error.message}`);
    }
  }
}

// 3. Teste de Health Check
async function testHealthCheck() {
  console.log('\n🔍 Testando Health Check...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    const data = await response.json();
    console.log(`✅ Health Check: ${response.status}`);
    console.log('   Status:', data.status);
    console.log('   Database:', data.database?.connected ? '✅ Conectado' : '❌ Desconectado');
    console.log('   Environment:', data.environment);
  } catch (error) {
    console.error(`❌ Health Check FAIL: ${error.message}`);
  }
}

// 4. Teste de Preflight OPTIONS
async function testPreflight() {
  console.log('\n🔍 Testando Preflight OPTIONS...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/products`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log(`✅ Preflight OPTIONS: ${response.status}`);
    console.log('   Headers CORS:', {
      'Access-Control-Allow-Origin': response.headers.get('access-control-allow-origin'),
      'Access-Control-Allow-Methods': response.headers.get('access-control-allow-methods'),
      'Access-Control-Allow-Headers': response.headers.get('access-control-allow-headers')
    });
  } catch (error) {
    console.error(`❌ Preflight FAIL: ${error.message}`);
  }
}

// 5. Teste com Token de Autenticação
async function testWithAuth() {
  console.log('\n🔍 Testando com Autenticação...');
  
  try {
    // Primeiro fazer login para obter token
    const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      },
      body: JSON.stringify({
        email: 'admin@enso.com',
        password: 'admin123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.token;
      
      console.log('✅ Login realizado com sucesso');
      
      // Testar rota protegida com token
      const productsResponse = await fetch(`${BACKEND_URL}/api/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': FRONTEND_URL
        }
      });
      
      console.log(`✅ /api/products com token: ${productsResponse.status}`);
      
      if (productsResponse.ok) {
        const products = await productsResponse.json();
        console.log(`   Produtos encontrados: ${products.length || 0}`);
      }
      
    } else {
      console.log(`❌ Login falhou: ${loginResponse.status}`);
    }
    
  } catch (error) {
    console.error(`❌ Teste com auth FAIL: ${error.message}`);
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes de CORS e Rotas...');
  console.log(`Backend: ${BACKEND_URL}`);
  console.log(`Frontend: ${FRONTEND_URL}`);
  
  await testHealthCheck();
  await testCors();
  await testPreflight();
  await testRoutes();
  await testWithAuth();
  
  console.log('\n✅ Testes concluídos!');
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testCors,
  testRoutes,
  testHealthCheck,
  testPreflight,
  testWithAuth,
  runAllTests
};
