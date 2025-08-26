/**
 * Setup para testes Jest
 * Configurações globais e utilitários para todos os testes
 */

import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.test' });

// Configurações globais
global.TEST_CONFIG = {
  BASE_URL: process.env.TEST_BASE_URL || 'https://enso-backend-0aa1.onrender.com',
  TIMEOUT: parseInt(process.env.TEST_TIMEOUT) || 30000,
  RETRY_ATTEMPTS: parseInt(process.env.TEST_RETRY_ATTEMPTS) || 3,
  LOG_RETENTION_DAYS: parseInt(process.env.LOG_RETENTION_DAYS) || 30,
};

// Utilitários globais
global.TEST_UTILS = {
  // Aguardar um tempo específico
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Gerar dados de teste aleatórios
  generateTestData: {
    product: () => ({
      code: `TEST-${Date.now()}`,
      description: `Produto de teste ${Date.now()}`,
      category: 'Teste',
      business_unit: 'Teste',
      technical_parameters: { test: true }
    }),
    
    supplier: () => ({
      name: `Fornecedor Teste ${Date.now()}`,
      email: `teste${Date.now()}@exemplo.com`,
      phone: '+55 11 99999-9999',
      status: 'active'
    }),
    
    inspectionPlan: () => ({
      planCode: `PLAN-${Date.now()}`,
      planName: `Plano de Inspeção Teste ${Date.now()}`,
      planType: 'product',
      version: '1.0',
      status: 'draft'
    })
  },
  
  // Validar resposta HTTP
  validateResponse: (response, expectedStatus = 200) => {
    expect(response).toBeDefined();
    expect(response.status).toBe(expectedStatus);
    expect(response.data).toBeDefined();
  },
  
  // Validar headers CORS
  validateCorsHeaders: (response) => {
    const headers = response.headers;
    expect(headers['access-control-allow-origin']).toBeDefined();
    expect(headers['access-control-allow-methods']).toBeDefined();
    expect(headers['access-control-allow-headers']).toBeDefined();
  },
  
  // Medir tempo de resposta
  measureResponseTime: async (requestFn) => {
    const startTime = Date.now();
    const response = await requestFn();
    const endTime = Date.now();
    return {
      response,
      responseTime: endTime - startTime
    };
  }
};

// Configurar console para testes
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Silenciar logs durante testes (exceto erros)
console.log = (...args) => {
  if (process.env.TEST_VERBOSE === 'true') {
    originalConsoleLog(...args);
  }
};

console.warn = (...args) => {
  if (process.env.TEST_VERBOSE === 'true') {
    originalConsoleWarn(...args);
  }
};

// Manter erros sempre visíveis
console.error = (...args) => {
  originalConsoleError(...args);
};

// Configurar timeout global
jest.setTimeout(global.TEST_CONFIG.TIMEOUT);

// Hook para limpeza após cada teste
afterEach(async () => {
  // Aguardar um pouco entre testes para evitar rate limiting
  await global.TEST_UTILS.sleep(1000);
});

// Hook para limpeza após todos os testes
afterAll(async () => {
  console.log('🧹 Limpeza final dos testes concluída');
});

// Configurar tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

// Exportar configurações para uso nos testes
export { global };
