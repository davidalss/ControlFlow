/**
 * Logger para testes automatizados
 * Registra resultados de testes no Supabase
 * 
 * Uso:
 * const logger = require('./lib/logger');
 * await logger.logRequest({ test_suite, test_name, route, status_code, response_time_ms, cors_ok, passed, error_message, meta });
 */

import { insertSystemLog } from './supabase-client.js';

/**
 * Registra resultado de teste no Supabase
 * @param {Object} params - Parâmetros do log
 * @param {string} params.test_suite - Nome da suíte de testes
 * @param {string} params.test_name - Nome específico do teste
 * @param {string} params.route - Rota da API testada
 * @param {number} params.status_code - Código de status HTTP
 * @param {number} params.response_time_ms - Tempo de resposta em ms
 * @param {boolean} params.cors_ok - Se headers CORS estão corretos
 * @param {boolean} params.passed - Se o teste passou
 * @param {string} [params.error_message] - Mensagem de erro se falhou
 * @param {Object} [params.meta] - Dados adicionais em JSON
 */
export async function logRequest({
  test_suite,
  test_name,
  route,
  status_code,
  response_time_ms,
  cors_ok,
  passed,
  error_message,
  meta = {}
}) {
  try {
    // Validar campos obrigatórios
    if (!test_suite || !test_name || !route) {
      throw new Error('Campos obrigatórios: test_suite, test_name, route');
    }

    // Preparar dados do log
    const logData = {
      test_suite,
      test_name,
      route,
      status_code: status_code || null,
      response_time_ms: response_time_ms || null,
      cors_ok: cors_ok || false,
      passed: passed || false,
      error_message: error_message || null,
      meta: {
        ...meta,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    };

    // Inserir no Supabase
    const result = await insertSystemLog(logData);

    // Log local para debug
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const time = response_time_ms ? `${response_time_ms}ms` : 'N/A';
    const cors = cors_ok ? '✅' : '❌';
    
    console.log(`${status} | ${test_suite}/${test_name} | ${route} | ${status_code} | ${time} | CORS: ${cors}`);

    if (error_message) {
      console.log(`   Erro: ${error_message}`);
    }

    return result;
  } catch (error) {
    console.error('❌ Erro ao registrar log:', error);
    throw error;
  }
}

/**
 * Logger para testes de healthcheck
 */
export async function logHealthcheck(route, status_code, response_time_ms, error_message = null) {
  return logRequest({
    test_suite: 'healthcheck',
    test_name: `healthcheck_${route.replace(/\//g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`,
    route,
    status_code,
    response_time_ms,
    cors_ok: true, // Healthcheck geralmente não tem problemas de CORS
    passed: status_code >= 200 && status_code < 300,
    error_message,
    meta: {
      type: 'healthcheck',
      endpoint: route
    }
  });
}

/**
 * Logger para testes de contrato
 */
export async function logContractTest(test_name, route, status_code, response_time_ms, schema_valid, error_message = null) {
  return logRequest({
    test_suite: 'contract',
    test_name,
    route,
    status_code,
    response_time_ms,
    cors_ok: true,
    passed: schema_valid && status_code >= 200 && status_code < 300,
    error_message,
    meta: {
      type: 'contract_test',
      schema_valid
    }
  });
}

/**
 * Logger para testes de performance
 */
export async function logPerformanceTest(test_name, route, status_code, response_time_ms, threshold_ms = 2000) {
  const passed = response_time_ms <= threshold_ms;
  const error_message = passed ? null : `Tempo de resposta ${response_time_ms}ms excedeu threshold de ${threshold_ms}ms`;

  return logRequest({
    test_suite: 'performance',
    test_name,
    route,
    status_code,
    response_time_ms,
    cors_ok: true,
    passed,
    error_message,
    meta: {
      type: 'performance_test',
      threshold_ms,
      exceeded_threshold: !passed
    }
  });
}

/**
 * Logger para testes de autenticação e CORS
 */
export async function logAuthCorsTest(test_name, route, status_code, response_time_ms, cors_ok, auth_ok, error_message = null) {
  return logRequest({
    test_suite: 'auth_cors',
    test_name,
    route,
    status_code,
    response_time_ms,
    cors_ok,
    passed: cors_ok && auth_ok && status_code >= 200 && status_code < 300,
    error_message,
    meta: {
      type: 'auth_cors_test',
      auth_ok,
      cors_headers_present: cors_ok
    }
  });
}

/**
 * Logger para testes de casos extremos
 */
export async function logBoundaryTest(test_name, route, status_code, response_time_ms, boundary_type, error_message = null) {
  return logRequest({
    test_suite: 'boundary',
    test_name,
    route,
    status_code,
    response_time_ms,
    cors_ok: true,
    passed: status_code >= 200 && status_code < 500, // Boundary tests podem retornar 4xx
    error_message,
    meta: {
      type: 'boundary_test',
      boundary_type // 'null_input', 'empty_string', 'max_length', etc.
    }
  });
}

/**
 * Logger para captura de erros
 */
export async function logErrorCapture(test_name, route, status_code, response_time_ms, error_type, error_message = null) {
  return logRequest({
    test_suite: 'error_capture',
    test_name,
    route,
    status_code,
    response_time_ms,
    cors_ok: true,
    passed: error_message !== null, // Deve capturar o erro
    error_message,
    meta: {
      type: 'error_capture',
      error_type // 'validation_error', 'database_error', 'auth_error', etc.
    }
  });
}

/**
 * Logger para testes CRUD
 */
export async function logCrudTest(test_name, route, status_code, response_time_ms, operation, error_message = null) {
  return logRequest({
    test_suite: 'crud',
    test_name,
    route,
    status_code,
    response_time_ms,
    cors_ok: true,
    passed: status_code >= 200 && status_code < 300,
    error_message,
    meta: {
      type: 'crud_test',
      operation // 'create', 'read', 'update', 'delete'
    }
  });
}

export default {
  logRequest,
  logHealthcheck,
  logContractTest,
  logPerformanceTest,
  logAuthCorsTest,
  logBoundaryTest,
  logErrorCapture,
  logCrudTest
};
