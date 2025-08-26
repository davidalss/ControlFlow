/**
 * Teste CRUD Completo (Smoke Test)
 * Testa todas as operações CRUD do sistema e gera logs detalhados
 * 
 * Operações testadas:
 * - CREATE: Criar produtos, usuários, planos de inspeção
 * - READ: Buscar dados com filtros e paginação
 * - UPDATE: Atualizar registros existentes
 * - DELETE: Excluir registros (soft delete)
 * 
 * Executar: npm test -- smoke.test.js
 */

import axios from 'axios';
import { logCrudTest } from '../server/lib/logger.js';

// Configuração
const BASE_URL = process.env.TEST_BASE_URL || 'https://enso-backend-0aa1.onrender.com';
const TIMEOUT = 15000; // 15 segundos para operações CRUD

// Dados de teste
const TEST_DATA = {
  product: {
    code: `TEST-${Date.now()}`,
    description: `Produto de Teste CRUD ${Date.now()}`,
    ean: '1234567890123',
    category: 'Teste',
    businessUnit: 'TECH'
  },
  
  user: {
    name: `Usuário Teste ${Date.now()}`,
    email: `teste.crud.${Date.now()}@exemplo.com`,
    password: 'senha123',
    role: 'inspector',
    businessUnit: 'TECH'
  },
  
  inspectionPlan: {
    planCode: `PLAN-${Date.now()}`,
    planName: `Plano de Inspeção Teste ${Date.now()}`,
    planType: 'product',
    version: '1.0',
    status: 'draft'
  }
};

// IDs para rastreamento
let createdProductId = null;
let createdUserId = null;
let createdPlanId = null;

/**
 * Testa operação CREATE
 */
async function testCreateOperations() {
  console.log('🔧 Testando operações CREATE...');
  
  const results = [];
  
  // 1. Criar Produto
  let startTime = Date.now();
  try {
    console.log('  📦 Criando produto...');
    
    const response = await axios.post(`${BASE_URL}/api/products`, TEST_DATA.product, {
      timeout: TIMEOUT,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Token de teste
      }
    });
    
    const responseTime = Date.now() - startTime;
    createdProductId = response.data.id;
    
    console.log(`  ✅ Produto criado: ${createdProductId}`);
    
    await logCrudTest(
      'create_product_success',
      '/api/products',
      response.status,
      responseTime,
      'create'
    );
    
    results.push({
      operation: 'CREATE_PRODUCT',
      status: response.status,
      responseTime,
      passed: true,
      id: createdProductId
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const status = error.response?.status || 500;
    
    console.log(`  ❌ Erro ao criar produto: ${error.message}`);
    
    await logCrudTest(
      'create_product_error',
      '/api/products',
      status,
      responseTime,
      'create',
      error.message
    );
    
    results.push({
      operation: 'CREATE_PRODUCT',
      status,
      responseTime,
      passed: false,
      error: error.message
    });
  }
  
  // 2. Criar Usuário
  startTime = Date.now();
  try {
    console.log('  👤 Criando usuário...');
    
    const response = await axios.post(`${BASE_URL}/api/users`, TEST_DATA.user, {
      timeout: TIMEOUT,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Token de teste
      }
    });
    
    const responseTime = Date.now() - startTime;
    createdUserId = response.data.id;
    
    console.log(`  ✅ Usuário criado: ${createdUserId}`);
    
    await logCrudTest(
      'create_user_success',
      '/api/users',
      response.status,
      responseTime,
      'create'
    );
    
    results.push({
      operation: 'CREATE_USER',
      status: response.status,
      responseTime,
      passed: true,
      id: createdUserId
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const status = error.response?.status || 500;
    
    console.log(`  ❌ Erro ao criar usuário: ${error.message}`);
    
    await logCrudTest(
      'create_user_error',
      '/api/users',
      status,
      responseTime,
      'create',
      error.message
    );
    
    results.push({
      operation: 'CREATE_USER',
      status,
      responseTime,
      passed: false,
      error: error.message
    });
  }
  
  // 3. Criar Plano de Inspeção
  startTime = Date.now();
  try {
    console.log('  📋 Criando plano de inspeção...');
    
    const response = await axios.post(`${BASE_URL}/api/inspection-plans`, TEST_DATA.inspectionPlan, {
      timeout: TIMEOUT,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Token de teste
      }
    });
    
    const responseTime = Date.now() - startTime;
    createdPlanId = response.data.id;
    
    console.log(`  ✅ Plano criado: ${createdPlanId}`);
    
    await logCrudTest(
      'create_inspection_plan_success',
      '/api/inspection-plans',
      response.status,
      responseTime,
      'create'
    );
    
    results.push({
      operation: 'CREATE_INSPECTION_PLAN',
      status: response.status,
      responseTime,
      passed: true,
      id: createdPlanId
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const status = error.response?.status || 500;
    
    console.log(`  ❌ Erro ao criar plano: ${error.message}`);
    
    await logCrudTest(
      'create_inspection_plan_error',
      '/api/inspection-plans',
      status,
      responseTime,
      'create',
      error.message
    );
    
    results.push({
      operation: 'CREATE_INSPECTION_PLAN',
      status,
      responseTime,
      passed: false,
      error: error.message
    });
  }
  
  return results;
}

/**
 * Testa operações READ
 */
async function testReadOperations() {
  console.log('📖 Testando operações READ...');
  
  const results = [];
  
  // 1. Listar Produtos
  let startTime = Date.now();
  try {
    console.log('  📦 Listando produtos...');
    
    const response = await axios.get(`${BASE_URL}/api/products?limit=10`, {
      timeout: TIMEOUT,
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer test-token' // Token de teste
      }
    });
    
    const responseTime = Date.now() - startTime;
    
    console.log(`  ✅ Produtos listados: ${response.data.length || 0} encontrados`);
    
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
    
    console.log(`  ❌ Erro ao listar produtos: ${error.message}`);
    
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
  
  // 2. Listar Usuários
  startTime = Date.now();
  try {
    console.log('  👤 Listando usuários...');
    
    const response = await axios.get(`${BASE_URL}/api/users?limit=10`, {
      timeout: TIMEOUT,
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer test-token' // Token de teste
      }
    });
    
    const responseTime = Date.now() - startTime;
    
    console.log(`  ✅ Usuários listados: ${response.data.length || 0} encontrados`);
    
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
    
    console.log(`  ❌ Erro ao listar usuários: ${error.message}`);
    
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
  
  // 3. Listar Planos de Inspeção
  startTime = Date.now();
  try {
    console.log('  📋 Listando planos de inspeção...');
    
    const response = await axios.get(`${BASE_URL}/api/inspection-plans?limit=10`, {
      timeout: TIMEOUT,
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer test-token' // Token de teste
      }
    });
    
    const responseTime = Date.now() - startTime;
    
    console.log(`  ✅ Planos listados: ${response.data.length || 0} encontrados`);
    
    await logCrudTest(
      'read_inspection_plans_success',
      '/api/inspection-plans',
      response.status,
      responseTime,
      'read'
    );
    
    results.push({
      operation: 'READ_INSPECTION_PLANS',
      status: response.status,
      responseTime,
      passed: true,
      count: response.data.length || 0
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const status = error.response?.status || 500;
    
    console.log(`  ❌ Erro ao listar planos: ${error.message}`);
    
    await logCrudTest(
      'read_inspection_plans_error',
      '/api/inspection-plans',
      status,
      responseTime,
      'read',
      error.message
    );
    
    results.push({
      operation: 'READ_INSPECTION_PLANS',
      status,
      responseTime,
      passed: false,
      error: error.message
    });
  }
  
  return results;
}

/**
 * Testa operações UPDATE
 */
async function testUpdateOperations() {
  console.log('✏️ Testando operações UPDATE...');
  
  const results = [];
  
  // 1. Atualizar Produto
  if (createdProductId) {
    let startTime = Date.now();
    try {
      console.log('  📦 Atualizando produto...');
      
      const updateData = {
        description: `Produto Atualizado ${Date.now()}`,
        category: 'Teste Atualizado'
      };
      
      const response = await axios.put(`${BASE_URL}/api/products/${createdProductId}`, updateData, {
        timeout: TIMEOUT,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token' // Token de teste
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      console.log(`  ✅ Produto atualizado: ${createdProductId}`);
      
      await logCrudTest(
        'update_product_success',
        `/api/products/${createdProductId}`,
        response.status,
        responseTime,
        'update'
      );
      
      results.push({
        operation: 'UPDATE_PRODUCT',
        status: response.status,
        responseTime,
        passed: true,
        id: createdProductId
      });
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const status = error.response?.status || 500;
      
      console.log(`  ❌ Erro ao atualizar produto: ${error.message}`);
      
      await logCrudTest(
        'update_product_error',
        `/api/products/${createdProductId}`,
        status,
        responseTime,
        'update',
        error.message
      );
      
      results.push({
        operation: 'UPDATE_PRODUCT',
        status,
        responseTime,
        passed: false,
        error: error.message
      });
    }
  }
  
  // 2. Atualizar Usuário
  if (createdUserId) {
    let startTime = Date.now();
    try {
      console.log('  👤 Atualizando usuário...');
      
      const updateData = {
        name: `Usuário Atualizado ${Date.now()}`,
        role: 'supervisor'
      };
      
      const response = await axios.put(`${BASE_URL}/api/users/${createdUserId}`, updateData, {
        timeout: TIMEOUT,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token' // Token de teste
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      console.log(`  ✅ Usuário atualizado: ${createdUserId}`);
      
      await logCrudTest(
        'update_user_success',
        `/api/users/${createdUserId}`,
        response.status,
        responseTime,
        'update'
      );
      
      results.push({
        operation: 'UPDATE_USER',
        status: response.status,
        responseTime,
        passed: true,
        id: createdUserId
      });
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const status = error.response?.status || 500;
      
      console.log(`  ❌ Erro ao atualizar usuário: ${error.message}`);
      
      await logCrudTest(
        'update_user_error',
        `/api/users/${createdUserId}`,
        status,
        responseTime,
        'update',
        error.message
      );
      
      results.push({
        operation: 'UPDATE_USER',
        status,
        responseTime,
        passed: false,
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * Testa operações DELETE (Soft Delete)
 */
async function testDeleteOperations() {
  console.log('🗑️ Testando operações DELETE (Soft Delete)...');
  
  const results = [];
  
  // 1. Desativar Produto
  if (createdProductId) {
    let startTime = Date.now();
    try {
      console.log('  📦 Desativando produto...');
      
      const response = await axios.delete(`${BASE_URL}/api/products/${createdProductId}`, {
        timeout: TIMEOUT,
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer test-token' // Token de teste
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      console.log(`  ✅ Produto desativado: ${createdProductId}`);
      
      await logCrudTest(
        'delete_product_success',
        `/api/products/${createdProductId}`,
        response.status,
        responseTime,
        'delete'
      );
      
      results.push({
        operation: 'DELETE_PRODUCT',
        status: response.status,
        responseTime,
        passed: true,
        id: createdProductId
      });
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const status = error.response?.status || 500;
      
      console.log(`  ❌ Erro ao desativar produto: ${error.message}`);
      
      await logCrudTest(
        'delete_product_error',
        `/api/products/${createdProductId}`,
        status,
        responseTime,
        'delete',
        error.message
      );
      
      results.push({
        operation: 'DELETE_PRODUCT',
        status,
        responseTime,
        passed: false,
        error: error.message
      });
    }
  }
  
  // 2. Desativar Usuário
  if (createdUserId) {
    let startTime = Date.now();
    try {
      console.log('  👤 Desativando usuário...');
      
      const response = await axios.delete(`${BASE_URL}/api/users/${createdUserId}`, {
        timeout: TIMEOUT,
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer test-token' // Token de teste
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      console.log(`  ✅ Usuário desativado: ${createdUserId}`);
      
      await logCrudTest(
        'delete_user_success',
        `/api/users/${createdUserId}`,
        response.status,
        responseTime,
        'delete'
      );
      
      results.push({
        operation: 'DELETE_USER',
        status: response.status,
        responseTime,
        passed: true,
        id: createdUserId
      });
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const status = error.response?.status || 500;
      
      console.log(`  ❌ Erro ao desativar usuário: ${error.message}`);
      
      await logCrudTest(
        'delete_user_error',
        `/api/users/${createdUserId}`,
        status,
        responseTime,
        'delete',
        error.message
      );
      
      results.push({
        operation: 'DELETE_USER',
        status,
        responseTime,
        passed: false,
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * Executa todos os testes CRUD
 */
async function runSmokeTests() {
  console.log('🚀 Iniciando Testes CRUD Completos...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TIMEOUT}ms`);
  console.log('');
  
  const allResults = [];
  const startTime = Date.now();
  
  // 1. Testar CREATE
  console.log('='.repeat(50));
  const createResults = await testCreateOperations();
  allResults.push(...createResults);
  
  // Pequena pausa entre operações
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 2. Testar READ
  console.log('='.repeat(50));
  const readResults = await testReadOperations();
  allResults.push(...readResults);
  
  // Pequena pausa entre operações
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 3. Testar UPDATE
  console.log('='.repeat(50));
  const updateResults = await testUpdateOperations();
  allResults.push(...updateResults);
  
  // Pequena pausa entre operações
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 4. Testar DELETE
  console.log('='.repeat(50));
  const deleteResults = await testDeleteOperations();
  allResults.push(...deleteResults);
  
  const totalTime = Date.now() - startTime;
  const passedTests = allResults.filter(r => r.passed).length;
  const failedTests = allResults.filter(r => !r.passed).length;
  
  // Resumo final
  console.log('');
  console.log('='.repeat(60));
  console.log('📊 RESUMO DOS TESTES CRUD:');
  console.log(`⏱️  Tempo total: ${totalTime}ms`);
  console.log(`✅ Passaram: ${passedTests}/${allResults.length}`);
  console.log(`❌ Falharam: ${failedTests}/${allResults.length}`);
  console.log(`📈 Taxa de sucesso: ${((passedTests / allResults.length) * 100).toFixed(1)}%`);
  
  // Detalhes por operação
  console.log('');
  console.log('📋 DETALHES POR OPERAÇÃO:');
  
  const operations = ['CREATE', 'READ', 'UPDATE', 'DELETE'];
  operations.forEach(op => {
    const opResults = allResults.filter(r => r.operation.startsWith(op));
    const opPassed = opResults.filter(r => r.passed).length;
    const opTotal = opResults.length;
    
    if (opTotal > 0) {
      console.log(`  ${op}: ${opPassed}/${opTotal} (${((opPassed / opTotal) * 100).toFixed(1)}%)`);
    }
  });
  
  // Logs gerados
  console.log('');
  console.log('📝 LOGS GERADOS:');
  console.log(`  Total de logs: ${allResults.length}`);
  console.log(`  Logs de sucesso: ${passedTests}`);
  console.log(`  Logs de erro: ${failedTests}`);
  console.log('  Verifique a tabela system_logs no Supabase para detalhes');
  
  return {
    total: allResults.length,
    passed: passedTests,
    failed: failedTests,
    success_rate: (passedTests / allResults.length) * 100,
    total_time: totalTime,
    results: allResults
  };
}

// Executar se chamado diretamente
console.log('🔍 Verificando se deve executar...');
console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);

if (import.meta.url.includes(process.argv[1].replace(/\\/g, '/'))) {
  console.log('✅ Executando testes CRUD...');
  runSmokeTests()
    .then(summary => {
      console.log('');
      console.log('🎉 Testes CRUD concluídos!');
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Erro fatal nos testes CRUD:', error);
      process.exit(1);
    });
} else {
  console.log('❌ Não executando - condição não atendida');
}

export { runSmokeTests };
