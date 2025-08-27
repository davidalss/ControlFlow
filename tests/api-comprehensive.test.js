/**
 * Testes Abrangentes de API
 * Testa todas as APIs do sistema incluindo CRUD, validações e funcionalidades específicas
 * 
 * Executar: npm test -- api-comprehensive.test.js
 */

import axios from 'axios';
import { z } from 'zod';
import { logContractTest } from '../server/lib/logger.js';

// Configuração
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5002';
const TIMEOUT = 15000;

// Schemas de validação
const ProductSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  description: z.string(),
  category: z.string().optional(),
  business_unit: z.string().optional(),
  technical_parameters: z.any().optional(),
  created_at: z.string().datetime()
});

const SupplierSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']),
  rating: z.number().min(0).max(10).optional(),
  created_at: z.string().datetime()
});

const InspectionPlanSchema = z.object({
  id: z.string().uuid(),
  planCode: z.string().optional(),
  planName: z.string().optional(),
  planType: z.enum(['product', 'parts']).optional(),
  version: z.string().optional(),
  status: z.enum(['draft', 'active', 'inactive', 'expired', 'archived']),
  productId: z.string().optional(),
  productName: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional()
});

const EtiquetaQuestionSchema = z.object({
  id: z.string().uuid(),
  inspection_plan_id: z.string().uuid(),
  step_id: z.string(),
  question_id: z.string(),
  titulo: z.string(),
  descricao: z.string().optional(),
  arquivo_referencia: z.string().url(),
  limite_aprovacao: z.number().min(0).max(1),
  pdf_original_url: z.string().url().optional(),
  created_at: z.string().datetime()
});

const EtiquetaInspectionResultSchema = z.object({
  id: z.string().uuid(),
  etiqueta_question_id: z.string().uuid(),
  inspection_session_id: z.string().optional(),
  foto_enviada: z.string().url(),
  percentual_similaridade: z.number().min(0).max(1),
  resultado_final: z.enum(['APROVADO', 'REPROVADO']),
  detalhes_comparacao: z.any().optional(),
  created_at: z.string().datetime(),
  created_by: z.string().uuid().optional()
});

// Cliente axios configurado
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

/**
 * Testes para API de Produtos
 */
async function testProductsAPI() {
  console.log('🔍 Testando API de Produtos...');
  const results = [];

  try {
    // GET /api/products
    const getProductsResponse = await apiClient.get('/api/products');
    const products = getProductsResponse.data;
    
    // Validar schema
    z.array(ProductSchema).parse(products);
    results.push({
      test: 'GET /api/products',
      status: getProductsResponse.status,
      passed: true,
      message: `Listou ${products.length} produtos`
    });

    // GET /api/products/:id (se houver produtos)
    if (products.length > 0) {
      const firstProduct = products[0];
      const getProductResponse = await apiClient.get(`/api/products/${firstProduct.id}`);
      ProductSchema.parse(getProductResponse.data);
      
      results.push({
        test: 'GET /api/products/:id',
        status: getProductResponse.status,
        passed: true,
        message: 'Produto individual recuperado'
      });
    }

  } catch (error) {
    results.push({
      test: 'Products API',
      status: error.response?.status || 500,
      passed: false,
      message: error.message
    });
  }

  return results;
}

/**
 * Testes para API de Fornecedores
 */
async function testSuppliersAPI() {
  console.log('🔍 Testando API de Fornecedores...');
  const results = [];

  try {
    // GET /api/suppliers
    const getSuppliersResponse = await apiClient.get('/api/suppliers');
    const suppliers = getSuppliersResponse.data;
    
    // Validar schema
    z.array(SupplierSchema).parse(suppliers);
    results.push({
      test: 'GET /api/suppliers',
      status: getSuppliersResponse.status,
      passed: true,
      message: `Listou ${suppliers.length} fornecedores`
    });

    // GET /api/suppliers/stats/overview
    const statsResponse = await apiClient.get('/api/suppliers/stats/overview');
    z.object({
      totalSuppliers: z.number(),
      activeSuppliers: z.number(),
      averageRating: z.number()
    }).parse(statsResponse.data);
    
    results.push({
      test: 'GET /api/suppliers/stats/overview',
      status: statsResponse.status,
      passed: true,
      message: 'Estatísticas recuperadas'
    });

  } catch (error) {
    results.push({
      test: 'Suppliers API',
      status: error.response?.status || 500,
      passed: false,
      message: error.message
    });
  }

  return results;
}

/**
 * Testes para API de Planos de Inspeção
 */
async function testInspectionPlansAPI() {
  console.log('🔍 Testando API de Planos de Inspeção...');
  const results = [];

  try {
    // GET /api/inspection-plans
    const getPlansResponse = await apiClient.get('/api/inspection-plans');
    const plans = getPlansResponse.data;
    
    // Validar schema
    z.array(InspectionPlanSchema).parse(plans);
    results.push({
      test: 'GET /api/inspection-plans',
      status: getPlansResponse.status,
      passed: true,
      message: `Listou ${plans.length} planos`
    });

    // GET /api/inspection-plans/:id (se houver planos)
    if (plans.length > 0) {
      const firstPlan = plans[0];
      const getPlanResponse = await apiClient.get(`/api/inspection-plans/${firstPlan.id}`);
      InspectionPlanSchema.parse(getPlanResponse.data);
      
      results.push({
        test: 'GET /api/inspection-plans/:id',
        status: getPlanResponse.status,
        passed: true,
        message: 'Plano individual recuperado'
      });
    }

  } catch (error) {
    results.push({
      test: 'Inspection Plans API',
      status: error.response?.status || 500,
      passed: false,
      message: error.message
    });
  }

  return results;
}

/**
 * Testes para API de Etiqueta Questions
 */
async function testEtiquetaQuestionsAPI() {
  console.log('🔍 Testando API de Etiqueta Questions...');
  const results = [];

  try {
    // GET /api/etiqueta-questions
    const getQuestionsResponse = await apiClient.get('/api/etiqueta-questions');
    const questions = getQuestionsResponse.data;
    
    // Validar schema
    z.array(EtiquetaQuestionSchema).parse(questions);
    results.push({
      test: 'GET /api/etiqueta-questions',
      status: getQuestionsResponse.status,
      passed: true,
      message: `Listou ${questions.length} perguntas de etiqueta`
    });

    // GET /api/etiqueta-questions/:id (se houver perguntas)
    if (questions.length > 0) {
      const firstQuestion = questions[0];
      const getQuestionResponse = await apiClient.get(`/api/etiqueta-questions/${firstQuestion.id}`);
      EtiquetaQuestionSchema.parse(getQuestionResponse.data);
      
      results.push({
        test: 'GET /api/etiqueta-questions/:id',
        status: getQuestionResponse.status,
        passed: true,
        message: 'Pergunta individual recuperada'
      });

      // GET /api/etiqueta-questions/:id/results
      const getResultsResponse = await apiClient.get(`/api/etiqueta-questions/${firstQuestion.id}/results`);
      z.array(EtiquetaInspectionResultSchema).parse(getResultsResponse.data);
      
      results.push({
        test: 'GET /api/etiqueta-questions/:id/results',
        status: getResultsResponse.status,
        passed: true,
        message: 'Resultados de inspeção recuperados'
      });
    }

  } catch (error) {
    results.push({
      test: 'Etiqueta Questions API',
      status: error.response?.status || 500,
      passed: false,
      message: error.message
    });
  }

  return results;
}

/**
 * Testes de Validação de Entrada
 */
async function testInputValidation() {
  console.log('🔍 Testando Validações de Entrada...');
  const results = [];

  try {
    // Testar criação de produto com dados inválidos
    try {
      await apiClient.post('/api/products', {
        code: '', // código vazio
        description: '' // descrição vazia
      });
      results.push({
        test: 'POST /api/products (validação)',
        status: 400,
        passed: false,
        message: 'Deveria ter rejeitado dados inválidos'
      });
    } catch (error) {
      if (error.response?.status === 400) {
        results.push({
          test: 'POST /api/products (validação)',
          status: error.response.status,
          passed: true,
          message: 'Rejeitou dados inválidos corretamente'
        });
      } else {
        results.push({
          test: 'POST /api/products (validação)',
          status: error.response?.status || 500,
          passed: false,
          message: error.message
        });
      }
    }

    // Testar criação de fornecedor com email inválido
    try {
      await apiClient.post('/api/suppliers', {
        name: 'Teste',
        email: 'email-invalido', // email inválido
        status: 'active'
      });
      results.push({
        test: 'POST /api/suppliers (validação)',
        status: 400,
        passed: false,
        message: 'Deveria ter rejeitado email inválido'
      });
    } catch (error) {
      if (error.response?.status === 400) {
        results.push({
          test: 'POST /api/suppliers (validação)',
          status: error.response.status,
          passed: true,
          message: 'Rejeitou email inválido corretamente'
        });
      } else {
        results.push({
          test: 'POST /api/suppliers (validação)',
          status: error.response?.status || 500,
          passed: false,
          message: error.message
        });
      }
    }

  } catch (error) {
    results.push({
      test: 'Input Validation',
      status: error.response?.status || 500,
      passed: false,
      message: error.message
    });
  }

  return results;
}

/**
 * Testes de Performance
 */
async function testPerformance() {
  console.log('🔍 Testando Performance...');
  const results = [];

  try {
    // Testar tempo de resposta da API de produtos
    const startTime = Date.now();
    await apiClient.get('/api/products');
    const responseTime = Date.now() - startTime;
    
    results.push({
      test: 'Performance - Products API',
      status: 200,
      passed: responseTime < 2000, // menos de 2 segundos
      message: `Tempo de resposta: ${responseTime}ms`
    });

    // Testar tempo de resposta da API de fornecedores
    const startTime2 = Date.now();
    await apiClient.get('/api/suppliers');
    const responseTime2 = Date.now() - startTime2;
    
    results.push({
      test: 'Performance - Suppliers API',
      status: 200,
      passed: responseTime2 < 2000,
      message: `Tempo de resposta: ${responseTime2}ms`
    });

  } catch (error) {
    results.push({
      test: 'Performance Tests',
      status: error.response?.status || 500,
      passed: false,
      message: error.message
    });
  }

  return results;
}

/**
 * Testes de Integração
 */
async function testIntegration() {
  console.log('🔍 Testando Integração...');
  const results = [];

  try {
    // Testar se os dados estão relacionados corretamente
    const [productsResponse, plansResponse] = await Promise.all([
      apiClient.get('/api/products'),
      apiClient.get('/api/inspection-plans')
    ]);

    const products = productsResponse.data;
    const plans = plansResponse.data;

    // Verificar se há planos que referenciam produtos existentes
    const validProductIds = new Set(products.map(p => p.id));
    const plansWithValidProducts = plans.filter(plan => 
      plan.productId && validProductIds.has(plan.productId)
    );

    results.push({
      test: 'Integration - Products & Plans',
      status: 200,
      passed: plansWithValidProducts.length === plans.length || plans.length === 0,
      message: `${plansWithValidProducts.length}/${plans.length} planos têm produtos válidos`
    });

  } catch (error) {
    results.push({
      test: 'Integration Tests',
      status: error.response?.status || 500,
      passed: false,
      message: error.message
    });
  }

  return results;
}

/**
 * Executa todos os testes
 */
async function runComprehensiveTests() {
  console.log('🚀 Iniciando Testes Abrangentes de API...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TIMEOUT}ms`);
  console.log('');

  const startTime = Date.now();
  const allResults = [];

  // Executar todos os testes
  const testFunctions = [
    testProductsAPI,
    testSuppliersAPI,
    testInspectionPlansAPI,
    testEtiquetaQuestionsAPI,
    testInputValidation,
    testPerformance,
    testIntegration
  ];

  for (const testFunction of testFunctions) {
    try {
      const results = await testFunction();
      allResults.push(...results);
      
      // Pequena pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Erro no teste ${testFunction.name}:`, error.message);
    }
  }

  const totalTime = Date.now() - startTime;
  const passedTests = allResults.filter(r => r.passed).length;
  const failedTests = allResults.filter(r => !r.passed).length;

  // Resumo
  console.log('');
  console.log('📊 RESUMO DOS TESTES ABRANGENTES:');
  console.log(`⏱️  Tempo total: ${totalTime}ms`);
  console.log(`✅ Passaram: ${passedTests}/${allResults.length}`);
  console.log(`❌ Falharam: ${failedTests}/${allResults.length}`);
  console.log(`📈 Taxa de sucesso: ${((passedTests / allResults.length) * 100).toFixed(1)}%`);

  // Detalhes dos testes que falharam
  if (failedTests > 0) {
    console.log('');
    console.log('❌ TESTES QUE FALHARAM:');
    allResults.filter(r => !r.passed).forEach(result => {
      console.log(`   ${result.test}`);
      console.log(`     Status: ${result.status}`);
      console.log(`     Erro: ${result.message}`);
      console.log('');
    });
  }

  // Detalhes dos testes que passaram
  if (passedTests > 0) {
    console.log('');
    console.log('✅ TESTES QUE PASSARAM:');
    allResults.filter(r => r.passed).forEach(result => {
      console.log(`   ${result.test}`);
      console.log(`     Status: ${result.status}`);
      console.log(`     Resultado: ${result.message}`);
      console.log('');
    });
  }

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
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveTests()
    .then(summary => {
      console.log('');
      console.log('🏁 Testes Abrangentes concluídos!');
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Erro fatal nos testes:', error);
      process.exit(1);
    });
}

export { runComprehensiveTests };
