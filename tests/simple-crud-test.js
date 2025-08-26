/**
 * Teste CRUD Simples - Demonstração
 * Testa operações básicas e gera logs
 */

import axios from 'axios';
import { logCrudTest } from '../server/lib/logger.js';

// Configuração
const BASE_URL = process.env.TEST_BASE_URL || 'https://enso-backend-0aa1.onrender.com';

console.log('🚀 Iniciando Teste CRUD Simples...');
console.log(`📍 Base URL: ${BASE_URL}`);

async function testSimpleCRUD() {
  const results = [];
  
  // 1. Teste READ - Listar produtos
  try {
    console.log('📦 Testando listagem de produtos...');
    const startTime = Date.now();
    
    const response = await axios.get(`${BASE_URL}/api/products?limit=5`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const responseTime = Date.now() - startTime;
    
    console.log(`✅ Produtos encontrados: ${response.data.length || 0}`);
    
    await logCrudTest(
      'read_products_success',
      '/api/products',
      response.status,
      responseTime,
      'read'
    );
    
    results.push({
      operation: 'READ_PRODUCTS',
      status: response.status,
      responseTime,
      passed: true,
      count: response.data.length || 0
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const status = error.response?.status || 500;
    
    console.log(`❌ Erro ao listar produtos: ${error.message}`);
    
    await logCrudTest(
      'read_products_error',
      '/api/products',
      status,
      responseTime,
      'read',
      error.message
    );
    
    results.push({
      operation: 'READ_PRODUCTS',
      status,
      responseTime,
      passed: false,
      error: error.message
    });
  }
  
  // 2. Teste READ - Listar usuários
  try {
    console.log('👤 Testando listagem de usuários...');
    const startTime = Date.now();
    
    const response = await axios.get(`${BASE_URL}/api/users?limit=5`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const responseTime = Date.now() - startTime;
    
    console.log(`✅ Usuários encontrados: ${response.data.length || 0}`);
    
    await logCrudTest(
      'read_users_success',
      '/api/users',
      response.status,
      responseTime,
      'read'
    );
    
    results.push({
      operation: 'READ_USERS',
      status: response.status,
      responseTime,
      passed: true,
      count: response.data.length || 0
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const status = error.response?.status || 500;
    
    console.log(`❌ Erro ao listar usuários: ${error.message}`);
    
    await logCrudTest(
      'read_users_error',
      '/api/users',
      status,
      responseTime,
      'read',
      error.message
    );
    
    results.push({
      operation: 'READ_USERS',
      status,
      responseTime,
      passed: false,
      error: error.message
    });
  }
  
  // Resumo
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = results.filter(r => !r.passed).length;
  
  console.log('');
  console.log('📊 RESUMO:');
  console.log(`✅ Passaram: ${passedTests}/${results.length}`);
  console.log(`❌ Falharam: ${failedTests}/${results.length}`);
  console.log(`📈 Taxa de sucesso: ${((passedTests / results.length) * 100).toFixed(1)}%`);
  console.log('');
  console.log('📝 Logs gerados na tabela system_logs do Supabase');
  
  return results;
}

// Executar teste
testSimpleCRUD()
  .then(() => {
    console.log('🎉 Teste concluído!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
