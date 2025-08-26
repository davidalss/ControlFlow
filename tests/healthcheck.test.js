/**
 * Teste de Healthcheck
 * Verifica se rotas críticas respondem 200
 * 
 * Rotas testadas:
 * - /api/products
 * - /api/suppliers?limit=10
 * - /api/suppliers/stats/overview
 * - /api/inspection-plans
 * 
 * Executar: npm test -- healthcheck.test.js
 */

import axios from 'axios';
import { logHealthcheck } from '../server/lib/logger.js';

// Configuração
const BASE_URL = process.env.TEST_BASE_URL || 'https://enso-backend-0aa1.onrender.com';
const TIMEOUT = 10000; // 10 segundos

// Rotas críticas para testar
const CRITICAL_ROUTES = [
  '/api/products',
  '/api/suppliers?limit=10',
  '/api/suppliers/stats/overview',
  '/api/inspection-plans'
];

/**
 * Testa uma rota específica
 */
async function testRoute(route) {
  const startTime = Date.now();
  let status_code = null;
  let error_message = null;

  try {
    console.log(`🔍 Testando: ${route}`);
    
    const response = await axios.get(`${BASE_URL}${route}`, {
      timeout: TIMEOUT,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    status_code = response.status;
    const response_time_ms = Date.now() - startTime;

    console.log(`✅ ${route} - Status: ${status_code}, Tempo: ${response_time_ms}ms`);

    // Registrar log no Supabase
    await logHealthcheck(route, status_code, response_time_ms, error_message);

    return {
      route,
      status_code,
      response_time_ms,
      passed: status_code >= 200 && status_code < 300,
      error_message: null
    };

  } catch (error) {
    const response_time_ms = Date.now() - startTime;
    
    if (error.response) {
      status_code = error.response.status;
      error_message = `HTTP ${error.response.status}: ${error.response.statusText}`;
    } else if (error.code === 'ECONNABORTED') {
      status_code = 408;
      error_message = 'Timeout - requisição demorou mais de 10 segundos';
    } else if (error.code === 'ENOTFOUND') {
      status_code = 503;
      error_message = 'Servidor não encontrado';
    } else {
      status_code = 500;
      error_message = error.message || 'Erro desconhecido';
    }

    console.log(`❌ ${route} - Status: ${status_code}, Erro: ${error_message}`);

    // Registrar log no Supabase
    await logHealthcheck(route, status_code, response_time_ms, error_message);

    return {
      route,
      status_code,
      response_time_ms,
      passed: false,
      error_message
    };
  }
}

/**
 * Executa todos os testes de healthcheck
 */
async function runHealthcheckTests() {
  console.log('🚀 Iniciando testes de Healthcheck...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TIMEOUT}ms`);
  console.log('');

  const results = [];
  const startTime = Date.now();

  // Testar cada rota
  for (const route of CRITICAL_ROUTES) {
    const result = await testRoute(route);
    results.push(result);
    
    // Pequena pausa entre requisições
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const totalTime = Date.now() - startTime;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = results.filter(r => !r.passed).length;

  // Resumo
  console.log('');
  console.log('📊 RESUMO DOS TESTES:');
  console.log(`⏱️  Tempo total: ${totalTime}ms`);
  console.log(`✅ Passaram: ${passedTests}/${results.length}`);
  console.log(`❌ Falharam: ${failedTests}/${results.length}`);
  console.log(`📈 Taxa de sucesso: ${((passedTests / results.length) * 100).toFixed(1)}%`);

  // Detalhes dos testes que falharam
  if (failedTests > 0) {
    console.log('');
    console.log('❌ TESTES QUE FALHARAM:');
    results.filter(r => !r.passed).forEach(result => {
      console.log(`   ${result.route} - ${result.status_code}: ${result.error_message}`);
    });
  }

  // Detalhes dos testes que passaram
  if (passedTests > 0) {
    console.log('');
    console.log('✅ TESTES QUE PASSARAM:');
    results.filter(r => r.passed).forEach(result => {
      console.log(`   ${result.route} - ${result.status_code} (${result.response_time_ms}ms)`);
    });
  }

  return {
    total: results.length,
    passed: passedTests,
    failed: failedTests,
    success_rate: (passedTests / results.length) * 100,
    total_time: totalTime,
    results
  };
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runHealthcheckTests()
    .then(summary => {
      console.log('');
      console.log('🏁 Testes de Healthcheck concluídos!');
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Erro fatal nos testes:', error);
      process.exit(1);
    });
}

export { runHealthcheckTests, testRoute };
