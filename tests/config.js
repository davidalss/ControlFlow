/**
 * Configuração para Testes
 * Centraliza configurações e variáveis de ambiente para todos os testes
 */

// Configurações de ambiente
export const TEST_CONFIG = {
  // URLs base para testes
  BASE_URL: process.env.TEST_BASE_URL || 'http://localhost:5002',
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://smvohmdytczfouslcaju.supabase.co',
  
  // Timeouts
  DEFAULT_TIMEOUT: 15000,
  UPLOAD_TIMEOUT: 30000,
  PERFORMANCE_TIMEOUT: 10000,
  
  // Configurações de teste
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // Dados de teste
  TEST_USER: {
    email: process.env.TEST_USER_EMAIL || 'test@example.com',
    password: process.env.TEST_USER_PASSWORD || 'testpassword123'
  },
  
  // IDs de teste
  TEST_PRODUCT_ID: process.env.TEST_PRODUCT_ID || '00000000-0000-0000-0000-000000000001',
  TEST_SUPPLIER_ID: process.env.TEST_SUPPLIER_ID || '00000000-0000-0000-0000-000000000002',
  TEST_PLAN_ID: process.env.TEST_PLAN_ID || '00000000-0000-0000-0000-000000000003',
  
  // Configurações de Supabase Storage
  STORAGE_BUCKET: 'ENSOS',
  STORAGE_FOLDER: 'PLANOS',
  ETIQUETA_FOLDER: 'etiquetas',
  
  // Limites de performance
  PERFORMANCE_LIMITS: {
    API_RESPONSE_TIME: 2000, // 2 segundos
    UPLOAD_TIME: 10000, // 10 segundos
    DATABASE_QUERY_TIME: 1000 // 1 segundo
  }
};

// Headers padrão para requisições
export const DEFAULT_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'TestSuite/1.0'
};

// Headers para upload de arquivos
export const UPLOAD_HEADERS = {
  'Accept': 'application/json',
  'User-Agent': 'TestSuite/1.0'
};

// Configurações de validação
export const VALIDATION_CONFIG = {
  // Schemas de validação
  SCHEMAS: {
    PRODUCT: {
      required: ['id', 'code', 'description'],
      optional: ['category', 'business_unit', 'technical_parameters']
    },
    SUPPLIER: {
      required: ['id', 'name', 'email', 'status'],
      optional: ['phone', 'rating']
    },
    INSPECTION_PLAN: {
      required: ['id', 'status'],
      optional: ['planCode', 'planName', 'planType', 'version', 'productId']
    },
    ETIQUETA_QUESTION: {
      required: ['id', 'inspection_plan_id', 'titulo', 'arquivo_referencia', 'limite_aprovacao'],
      optional: ['descricao', 'pdf_original_url']
    }
  },
  
  // Valores de teste válidos
  VALID_VALUES: {
    STATUSES: ['active', 'inactive', 'pending', 'draft', 'archived'],
    PLAN_TYPES: ['product', 'parts'],
    VOLTAGES: ['127V', '220V', '12V', '24V', 'BIVOLT'],
    RESULT_TYPES: ['APROVADO', 'REPROVADO']
  },
  
  // Valores de teste inválidos
  INVALID_VALUES: {
    EMAILS: ['invalid-email', 'test@', '@test.com', ''],
    LIMITS: [-1, 1.5, 2, 'abc'],
    UUIDs: ['invalid-uuid', '123', 'abc-def-ghi']
  }
};

// Configurações de logging
export const LOGGING_CONFIG = {
  ENABLE_LOGS: process.env.TEST_LOGGING !== 'false',
  LOG_LEVEL: process.env.TEST_LOG_LEVEL || 'info',
  LOG_FORMAT: 'detailed' // 'simple' | 'detailed'
};

// Funções utilitárias para testes
export const TEST_UTILS = {
  // Gerar ID único para testes
  generateTestId: () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  
  // Aguardar tempo específico
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Retry com backoff exponencial
  retry: async (fn, maxAttempts = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        await TEST_UTILS.wait(delay * Math.pow(2, attempt - 1));
      }
    }
  },
  
  // Validar resposta HTTP
  validateResponse: (response, expectedStatus = 200) => {
    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }
    return response;
  },
  
  // Criar dados de teste
  createTestData: {
    product: (overrides = {}) => ({
      code: `TEST-${Date.now()}`,
      description: 'Produto de teste',
      category: 'Teste',
      business_unit: 'Teste',
      ...overrides
    }),
    
    supplier: (overrides = {}) => ({
      name: `Fornecedor Teste ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      status: 'active',
      ...overrides
    }),
    
    inspectionPlan: (overrides = {}) => ({
      planName: `Plano Teste ${Date.now()}`,
      planType: 'product',
      status: 'draft',
      ...overrides
    }),
    
    etiquetaQuestion: (overrides = {}) => ({
      titulo: `Etiqueta Teste ${Date.now()}`,
      descricao: 'Descrição de teste',
      limite_aprovacao: 0.9,
      inspection_plan_id: TEST_CONFIG.TEST_PLAN_ID,
      step_id: 'test-step',
      question_id: 'test-question',
      ...overrides
    })
  }
};

// Configurações de ambiente específicas
export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // Verificar se todas as variáveis necessárias estão definidas
  validateEnvironment: () => {
    const required = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.warn(`⚠️  Variáveis de ambiente ausentes: ${missing.join(', ')}`);
      return false;
    }
    
    return true;
  }
};

export default {
  TEST_CONFIG,
  DEFAULT_HEADERS,
  UPLOAD_HEADERS,
  VALIDATION_CONFIG,
  LOGGING_CONFIG,
  TEST_UTILS,
  ENV_CONFIG
};
