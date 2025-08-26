/**
 * Teste de Contrato
 * Valida schema das respostas usando zod
 * 
 * Testa se as respostas da API seguem o contrato esperado
 * 
 * Executar: npm test -- contract.test.js
 */

import axios from 'axios';
import { z } from 'zod';
import { logContractTest } from '../server/lib/logger.js';

// Configuração
const BASE_URL = process.env.TEST_BASE_URL || 'https://enso-backend-0aa1.onrender.com';
const TIMEOUT = 10000;

// Schemas de validação usando Zod
const ProductSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  description: z.string(),
  category: z.string(),
  business_unit: z.string(),
  technical_parameters: z.any().optional(),
  created_at: z.string().datetime()
});

const ProductsResponseSchema = z.array(ProductSchema);

const SupplierSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']),
  rating: z.number().min(0).max(10).optional(),
  created_at: z.string().datetime()
});

const SuppliersResponseSchema = z.object({
  suppliers: z.array(SupplierSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number()
});

const InspectionPlanSchema = z.object({
  id: z.string().uuid(),
  planCode: z.string().optional(),
  planName: z.string().optional(),
  planType: z.enum(['product', 'parts']).optional(),
  version: z.string().optional(),
  status: z.enum(['draft', 'active', 'inactive', 'expired', 'archived']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional()
});

const InspectionPlansResponseSchema = z.array(InspectionPlanSchema);

const StatsResponseSchema = z.object({
  totalSuppliers: z.number(),
  activeSuppliers: z.number(),
  averageRating: z.number(),
  topSuppliers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    rating: z.number()
  })).optional()
});

// Rotas e seus schemas correspondentes
const ROUTES_TO_TEST = [
  {
    route: '/api/products',
    schema: ProductsResponseSchema,
    description: 'Lista de produtos'
  },
  {
    route: '/api/suppliers?limit=10',
    schema: SuppliersResponseSchema,
    description: 'Lista de fornecedores'
  },
  {
    route: '/api/suppliers/stats/overview',
    schema: StatsResponseSchema,
    description: 'Estatísticas de fornecedores'
  },
  {
    route: '/api/inspection-plans',
    schema: InspectionPlansResponseSchema,
    description: 'Lista de planos de inspeção'
  }
];

/**
 * Testa uma rota específica contra seu schema
 */
async function testRouteContract(routeConfig) {
  const { route, schema, description } = routeConfig;
  const startTime = Date.now();
  let status_code = null;
  let error_message = null;
  let schema_valid = false;

  try {
    console.log(`🔍 Testando contrato: ${description} (${route})`);
    
    const response = await axios.get(`${BASE_URL}${route}`, {
      timeout: TIMEOUT,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    status_code = response.status;
    const response_time_ms = Date.now() - startTime;

    // Validar schema da resposta
    try {
      schema.parse(response.data);
      schema_valid = true;
      console.log(`✅ ${description} - Schema válido (${response_time_ms}ms)`);
    } catch (schemaError) {
      schema_valid = false;
      error_message = `Schema inválido: ${schemaError.message}`;
      console.log(`❌ ${description} - Schema inválido: ${schemaError.message}`);
    }

    // Registrar log no Supabase
    await logContractTest(
      `contract_${route.replace(/\//g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`,
      route,
      status_code,
      response_time_ms,
      schema_valid,
      error_message
    );

    return {
      route,
      description,
      status_code,
      response_time_ms,
      schema_valid,
      passed: schema_valid && status_code >= 200 && status_code < 300,
      error_message
    };

  } catch (error) {
    const response_time_ms = Date.now() - startTime;
    
    if (error.response) {
      status_code = error.response.status;
      error_message = `HTTP ${error.response.status}: ${error.response.statusText}`;
    } else if (error.code === 'ECONNABORTED') {
      status_code = 408;
      error_message = 'Timeout - requisição demorou mais de 10 segundos';
    } else {
      status_code = 500;
      error_message = error.message || 'Erro desconhecido';
    }

    console.log(`❌ ${description} - Erro: ${error_message}`);

    // Registrar log no Supabase
    await logContractTest(
      `contract_${route.replace(/\//g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`,
      route,
      status_code,
      response_time_ms,
      schema_valid,
      error_message
    );

    return {
      route,
      description,
      status_code,
      response_time_ms,
      schema_valid,
      passed: false,
      error_message
    };
  }
}

/**
 * Executa todos os testes de contrato
 */
async function runContractTests() {
  console.log('🚀 Iniciando testes de Contrato...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TIMEOUT}ms`);
  console.log('');

  const results = [];
  const startTime = Date.now();

  // Testar cada rota
  for (const routeConfig of ROUTES_TO_TEST) {
    const result = await testRouteContract(routeConfig);
    results.push(result);
    
    // Pequena pausa entre requisições
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const totalTime = Date.now() - startTime;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = results.filter(r => !r.passed).length;
  const schemaValidTests = results.filter(r => r.schema_valid).length;

  // Resumo
  console.log('');
  console.log('📊 RESUMO DOS TESTES DE CONTRATO:');
  console.log(`⏱️  Tempo total: ${totalTime}ms`);
  console.log(`✅ Passaram: ${passedTests}/${results.length}`);
  console.log(`❌ Falharam: ${failedTests}/${results.length}`);
  console.log(`📋 Schemas válidos: ${schemaValidTests}/${results.length}`);
  console.log(`📈 Taxa de sucesso: ${((passedTests / results.length) * 100).toFixed(1)}%`);

  // Detalhes dos testes que falharam
  if (failedTests > 0) {
    console.log('');
    console.log('❌ TESTES QUE FALHARAM:');
    results.filter(r => !r.passed).forEach(result => {
      console.log(`   ${result.description} (${result.route})`);
      console.log(`     Status: ${result.status_code}`);
      console.log(`     Schema válido: ${result.schema_valid ? '✅' : '❌'}`);
      if (result.error_message) {
        console.log(`     Erro: ${result.error_message}`);
      }
      console.log('');
    });
  }

  // Detalhes dos testes que passaram
  if (passedTests > 0) {
    console.log('');
    console.log('✅ TESTES QUE PASSARAM:');
    results.filter(r => r.passed).forEach(result => {
      console.log(`   ${result.description} (${result.route})`);
      console.log(`     Status: ${result.status_code} (${result.response_time_ms}ms)`);
      console.log(`     Schema: ✅ Válido`);
      console.log('');
    });
  }

  return {
    total: results.length,
    passed: passedTests,
    failed: failedTests,
    schema_valid: schemaValidTests,
    success_rate: (passedTests / results.length) * 100,
    total_time: totalTime,
    results
  };
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runContractTests()
    .then(summary => {
      console.log('');
      console.log('🏁 Testes de Contrato concluídos!');
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Erro fatal nos testes:', error);
      process.exit(1);
    });
}

export { runContractTests, testRouteContract };
