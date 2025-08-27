/**
 * Testes Específicos para Funcionalidade de Etiqueta
 * Testa a nova funcionalidade de comparação de etiquetas com upload de arquivos
 * 
 * Executar: npm test -- etiqueta-feature.test.js
 */

import axios from 'axios';
import { z } from 'zod';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Configuração
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5002';
const TIMEOUT = 30000; // Timeout maior para uploads

// Cliente axios configurado para multipart
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Accept': 'application/json'
  }
});

// Schemas de validação específicos para etiqueta
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

/**
 * Teste de Upload de PDF de Referência
 */
async function testPDFUpload() {
  console.log('🔍 Testando Upload de PDF de Referência...');
  const results = [];

  try {
    // Criar um PDF de teste simples (simulado)
    const testPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test PDF) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF');

    const formData = new FormData();
    formData.append('pdf_reference', testPdfBuffer, {
      filename: 'test_reference.pdf',
      contentType: 'application/pdf'
    });
    formData.append('titulo', 'Teste de Etiqueta');
    formData.append('descricao', 'Descrição de teste');
    formData.append('limite_aprovacao', '0.9');
    formData.append('inspection_plan_id', '00000000-0000-0000-0000-000000000001');
    formData.append('step_id', 'test-step');
    formData.append('question_id', 'test-question');

    const response = await apiClient.post('/api/etiqueta-questions', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    // Validar resposta
    EtiquetaQuestionSchema.parse(response.data);
    
    results.push({
      test: 'POST /api/etiqueta-questions (upload PDF)',
      status: response.status,
      passed: true,
      message: 'PDF enviado e processado com sucesso'
    });

    return { questionId: response.data.id, results };

  } catch (error) {
    results.push({
      test: 'POST /api/etiqueta-questions (upload PDF)',
      status: error.response?.status || 500,
      passed: false,
      message: error.message
    });

    return { questionId: null, results };
  }
}

/**
 * Teste de Inspeção de Etiqueta
 */
async function testEtiquetaInspection(questionId) {
  console.log('🔍 Testando Inspeção de Etiqueta...');
  const results = [];

  if (!questionId) {
    results.push({
      test: 'POST /api/etiqueta-questions/:id/inspect',
      status: 400,
      passed: false,
      message: 'Question ID não disponível para teste'
    });
    return results;
  }

  try {
    // Criar uma imagem de teste (simulada)
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

    const formData = new FormData();
    formData.append('test_photo', testImageBuffer, {
      filename: 'test_photo.jpg',
      contentType: 'image/jpeg'
    });
    formData.append('inspection_session_id', 'test-session-123');

    const response = await apiClient.post(`/api/etiqueta-questions/${questionId}/inspect`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    // Validar resposta
    z.object({
      success: z.boolean(),
      result: EtiquetaInspectionResultSchema,
      comparison: z.any(),
      approved: z.boolean(),
      similarity_score: z.number(),
      similarity_percentage: z.number()
    }).parse(response.data);

    results.push({
      test: 'POST /api/etiqueta-questions/:id/inspect',
      status: response.status,
      passed: true,
      message: `Inspeção realizada - Similaridade: ${response.data.similarity_percentage}%`
    });

  } catch (error) {
    results.push({
      test: 'POST /api/etiqueta-questions/:id/inspect',
      status: error.response?.status || 500,
      passed: false,
      message: error.message
    });
  }

  return results;
}

/**
 * Teste de Recuperação de Resultados
 */
async function testResultsRetrieval(questionId) {
  console.log('🔍 Testando Recuperação de Resultados...');
  const results = [];

  if (!questionId) {
    results.push({
      test: 'GET /api/etiqueta-questions/:id/results',
      status: 400,
      passed: false,
      message: 'Question ID não disponível para teste'
    });
    return results;
  }

  try {
    const response = await apiClient.get(`/api/etiqueta-questions/${questionId}/results`);
    
    // Validar resposta
    z.array(EtiquetaInspectionResultSchema).parse(response.data);
    
    results.push({
      test: 'GET /api/etiqueta-questions/:id/results',
      status: response.status,
      passed: true,
      message: `Recuperados ${response.data.length} resultados`
    });

  } catch (error) {
    results.push({
      test: 'GET /api/etiqueta-questions/:id/results',
      status: error.response?.status || 500,
      passed: false,
      message: error.message
    });
  }

  return results;
}

/**
 * Teste de Validação de Limite de Aprovação
 */
async function testApprovalLimitValidation() {
  console.log('🔍 Testando Validação de Limite de Aprovação...');
  const results = [];

  try {
    // Testar limite inválido (maior que 1)
    const formData = new FormData();
    formData.append('pdf_reference', Buffer.from('test'), {
      filename: 'test.pdf',
      contentType: 'application/pdf'
    });
    formData.append('titulo', 'Teste');
    formData.append('limite_aprovacao', '1.5'); // Inválido
    formData.append('inspection_plan_id', '00000000-0000-0000-0000-000000000001');
    formData.append('step_id', 'test');
    formData.append('question_id', 'test');

    try {
      await apiClient.post('/api/etiqueta-questions', formData, {
        headers: {
          ...formData.getHeaders()
        }
      });
      
      results.push({
        test: 'Validação de limite de aprovação',
        status: 400,
        passed: false,
        message: 'Deveria ter rejeitado limite inválido'
      });
    } catch (error) {
      if (error.response?.status === 400) {
        results.push({
          test: 'Validação de limite de aprovação',
          status: error.response.status,
          passed: true,
          message: 'Rejeitou limite inválido corretamente'
        });
      } else {
        results.push({
          test: 'Validação de limite de aprovação',
          status: error.response?.status || 500,
          passed: false,
          message: error.message
        });
      }
    }

  } catch (error) {
    results.push({
      test: 'Validação de limite de aprovação',
      status: error.response?.status || 500,
      passed: false,
      message: error.message
    });
  }

  return results;
}

/**
 * Teste de Performance de Upload
 */
async function testUploadPerformance() {
  console.log('🔍 Testando Performance de Upload...');
  const results = [];

  try {
    // Criar um PDF maior para teste de performance
    const largePdfBuffer = Buffer.alloc(1024 * 1024); // 1MB
    
    const formData = new FormData();
    formData.append('pdf_reference', largePdfBuffer, {
      filename: 'large_test.pdf',
      contentType: 'application/pdf'
    });
    formData.append('titulo', 'Teste Performance');
    formData.append('limite_aprovacao', '0.9');
    formData.append('inspection_plan_id', '00000000-0000-0000-0000-000000000001');
    formData.append('step_id', 'test');
    formData.append('question_id', 'test-perf');

    const startTime = Date.now();
    
    try {
      await apiClient.post('/api/etiqueta-questions', formData, {
        headers: {
          ...formData.getHeaders()
        }
      });
      
      const uploadTime = Date.now() - startTime;
      
      results.push({
        test: 'Performance de Upload',
        status: 200,
        passed: uploadTime < 10000, // menos de 10 segundos
        message: `Upload concluído em ${uploadTime}ms`
      });
    } catch (error) {
      const uploadTime = Date.now() - startTime;
      
      results.push({
        test: 'Performance de Upload',
        status: error.response?.status || 500,
        passed: false,
        message: `Upload falhou após ${uploadTime}ms: ${error.message}`
      });
    }

  } catch (error) {
    results.push({
      test: 'Performance de Upload',
      status: error.response?.status || 500,
      passed: false,
      message: error.message
    });
  }

  return results;
}

/**
 * Teste de Integração Completa
 */
async function testCompleteIntegration() {
  console.log('🔍 Testando Integração Completa...');
  const results = [];

  try {
    // 1. Criar pergunta de etiqueta
    const { questionId, results: uploadResults } = await testPDFUpload();
    results.push(...uploadResults);

    if (questionId) {
      // 2. Realizar inspeção
      const inspectionResults = await testEtiquetaInspection(questionId);
      results.push(...inspectionResults);

      // 3. Recuperar resultados
      const retrievalResults = await testResultsRetrieval(questionId);
      results.push(...retrievalResults);

      // 4. Verificar se tudo está conectado
      const questionResponse = await apiClient.get(`/api/etiqueta-questions/${questionId}`);
      const question = questionResponse.data;

      if (question.arquivo_referencia && question.arquivo_referencia.includes('ENSOS/PLANOS/etiquetas/')) {
        results.push({
          test: 'Integração - Storage',
          status: 200,
          passed: true,
          message: 'Arquivo salvo no Supabase Storage corretamente'
        });
      } else {
        results.push({
          test: 'Integração - Storage',
          status: 400,
          passed: false,
          message: 'Arquivo não foi salvo no local correto'
        });
      }
    }

  } catch (error) {
    results.push({
      test: 'Integração Completa',
      status: error.response?.status || 500,
      passed: false,
      message: error.message
    });
  }

  return results;
}

/**
 * Executa todos os testes de etiqueta
 */
async function runEtiquetaTests() {
  console.log('🚀 Iniciando Testes de Funcionalidade de Etiqueta...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TIMEOUT}ms`);
  console.log('');

  const startTime = Date.now();
  const allResults = [];

  // Executar todos os testes
  const testFunctions = [
    testPDFUpload,
    testApprovalLimitValidation,
    testUploadPerformance,
    testCompleteIntegration
  ];

  for (const testFunction of testFunctions) {
    try {
      const results = await testFunction();
      allResults.push(...results);
      
      // Pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Erro no teste ${testFunction.name}:`, error.message);
    }
  }

  const totalTime = Date.now() - startTime;
  const passedTests = allResults.filter(r => r.passed).length;
  const failedTests = allResults.filter(r => !r.passed).length;

  // Resumo
  console.log('');
  console.log('📊 RESUMO DOS TESTES DE ETIQUETA:');
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
  runEtiquetaTests()
    .then(summary => {
      console.log('');
      console.log('🏁 Testes de Etiqueta concluídos!');
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Erro fatal nos testes:', error);
      process.exit(1);
    });
}

export { runEtiquetaTests };
