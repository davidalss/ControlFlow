#!/usr/bin/env node
/**
 * Script de Teste para API do Severino
 * Testa todas as funcionalidades da API
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api/severino';

// Configuração do axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': 'test_user_' + Date.now()
  }
});

// Cores para console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Teste 1: Chat básico
async function testChat() {
  logInfo('Testando chat básico...');
  
  try {
    const response = await api.post('/chat', {
      message: 'Olá Severino, como você pode me ajudar?',
      context: {
        currentPage: 'dashboard',
        pageData: { user: 'test_user' }
      }
    });

    if (response.data.success) {
      logSuccess('Chat funcionando!');
      log(`Resposta: ${response.data.data.message.substring(0, 100)}...`, 'cyan');
      return true;
    } else {
      logError('Chat falhou');
      return false;
    }
  } catch (error) {
    logError(`Erro no chat: ${error.message}`);
    return false;
  }
}

// Teste 2: Comandos específicos
async function testCommands() {
  logInfo('Testando comandos específicos...');
  
  const commands = [
    'Criar plano de inspeção para linha A',
    'Analisar dados de qualidade do mês',
    'Verificar treinamentos pendentes',
    'Gerar relatório de não conformidades'
  ];

  for (const command of commands) {
    try {
      log(`Testando comando: "${command}"`, 'yellow');
      
      const response = await api.post('/chat', {
        message: command,
        context: {
          currentPage: 'inspections',
          pageData: { product: 'AFB002' }
        }
      });

      if (response.data.success) {
        logSuccess(`Comando "${command}" processado com sucesso`);
        log(`Resposta: ${response.data.data.message.substring(0, 80)}...`, 'cyan');
      } else {
        logError(`Comando "${command}" falhou`);
      }
      
      // Aguardar um pouco entre comandos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      logError(`Erro no comando "${command}": ${error.message}`);
    }
  }
}

// Teste 3: Execução de ações
async function testActions() {
  logInfo('Testando execução de ações...');
  
  try {
    const response = await api.post('/actions/execute', {
      action: {
        type: 'create_inspection',
        data: {
          productCode: 'AFB002',
          line: 'A',
          inspector: 'João Silva'
        }
      },
      data: {
        priority: 'high',
        notes: 'Teste via API'
      }
    });

    if (response.data.success) {
      logSuccess('Ação executada com sucesso!');
      log(`Resultado: ${JSON.stringify(response.data.data, null, 2)}`, 'cyan');
      return true;
    } else {
      logError('Execução de ação falhou');
      return false;
    }
  } catch (error) {
    logError(`Erro na execução de ação: ${error.message}`);
    return false;
  }
}

// Teste 4: Análise de dados
async function testDataAnalysis() {
  logInfo('Testando análise de dados...');
  
  try {
    const response = await api.post('/analytics/analyze', {
      type: 'quality_trends',
      filters: {
        period: 'last_month',
        product: 'AFB002',
        line: 'A'
      }
    });

    if (response.data.success) {
      logSuccess('Análise de dados funcionando!');
      log(`Resultado: ${JSON.stringify(response.data.data, null, 2)}`, 'cyan');
      return true;
    } else {
      logError('Análise de dados falhou');
      return false;
    }
  } catch (error) {
    logError(`Erro na análise de dados: ${error.message}`);
    return false;
  }
}

// Teste 5: Verificação de treinamentos
async function testTrainingCheck() {
  logInfo('Testando verificação de treinamentos...');
  
  try {
    const response = await api.post('/training/check', {
      team: 'Equipe A',
      department: 'Qualidade'
    });

    if (response.data.success) {
      logSuccess('Verificação de treinamentos funcionando!');
      log(`Resultado: ${JSON.stringify(response.data.data, null, 2)}`, 'cyan');
      return true;
    } else {
      logError('Verificação de treinamentos falhou');
      return false;
    }
  } catch (error) {
    logError(`Erro na verificação de treinamentos: ${error.message}`);
    return false;
  }
}

// Teste 6: Contexto e preferências
async function testContext() {
  logInfo('Testando contexto e preferências...');
  
  try {
    const response = await api.get('/context');
    
    if (response.data.success) {
      logSuccess('Contexto recuperado com sucesso!');
      log(`Contexto: ${JSON.stringify(response.data.data, null, 2)}`, 'cyan');
      return true;
    } else {
      logError('Recuperação de contexto falhou');
      return false;
    }
  } catch (error) {
    logError(`Erro na recuperação de contexto: ${error.message}`);
    return false;
  }
}

// Teste 7: Estatísticas
async function testStats() {
  logInfo('Testando estatísticas...');
  
  try {
    const response = await api.get('/stats');
    
    if (response.data.success) {
      logSuccess('Estatísticas recuperadas com sucesso!');
      log(`Estatísticas: ${JSON.stringify(response.data.data, null, 2)}`, 'cyan');
      return true;
    } else {
      logError('Recuperação de estatísticas falhou');
      return false;
    }
  } catch (error) {
    logError(`Erro na recuperação de estatísticas: ${error.message}`);
    return false;
  }
}

// Teste 8: Criação de inspeção
async function testInspectionCreation() {
  logInfo('Testando criação de inspeção...');
  
  try {
    const response = await api.post('/inspections/create', {
      productCode: 'AFB002',
      line: 'A',
      inspector: 'João Silva',
      planId: 'PLAN001',
      priority: 'high',
      notes: 'Teste via API do Severino'
    });

    if (response.data.success) {
      logSuccess('Inspeção criada com sucesso!');
      log(`Inspeção: ${JSON.stringify(response.data.data, null, 2)}`, 'cyan');
      return true;
    } else {
      logError('Criação de inspeção falhou');
      return false;
    }
  } catch (error) {
    logError(`Erro na criação de inspeção: ${error.message}`);
    return false;
  }
}

// Função principal de teste
async function runAllTests() {
  log('🚀 Iniciando testes da API do Severino...', 'magenta');
  log('==========================================', 'magenta');
  
  const tests = [
    { name: 'Chat Básico', fn: testChat },
    { name: 'Comandos Específicos', fn: testCommands },
    { name: 'Execução de Ações', fn: testActions },
    { name: 'Análise de Dados', fn: testDataAnalysis },
    { name: 'Verificação de Treinamentos', fn: testTrainingCheck },
    { name: 'Contexto e Preferências', fn: testContext },
    { name: 'Estatísticas', fn: testStats },
    { name: 'Criação de Inspeção', fn: testInspectionCreation }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    log(`\n📋 Executando: ${test.name}`, 'white');
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logError(`Erro inesperado no teste ${test.name}: ${error.message}`);
      failed++;
    }
  }

  // Resumo final
  log('\n📊 RESUMO DOS TESTES', 'magenta');
  log('====================', 'magenta');
  log(`✅ Testes aprovados: ${passed}`, 'green');
  log(`❌ Testes falharam: ${failed}`, 'red');
  log(`📈 Taxa de sucesso: ${((passed / (passed + failed)) * 100).toFixed(1)}%`, 'cyan');
  
  if (failed === 0) {
    log('\n🎉 Todos os testes passaram! API do Severino está funcionando perfeitamente!', 'green');
  } else {
    log('\n⚠️  Alguns testes falharam. Verifique os logs acima para mais detalhes.', 'yellow');
  }
}

// Verificar se o servidor está rodando
async function checkServer() {
  try {
    await axios.get('http://localhost:5001/health');
    logSuccess('Servidor está rodando!');
    return true;
  } catch (error) {
    logError('Servidor não está rodando. Inicie o servidor primeiro com: npm run dev');
    return false;
  }
}

// Executar testes
async function main() {
  log('🔍 Verificando se o servidor está rodando...', 'blue');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await runAllTests();
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    logError(`Erro fatal: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testChat,
  testCommands,
  testActions,
  testDataAnalysis,
  testTrainingCheck,
  testContext,
  testStats,
  testInspectionCreation,
  runAllTests
};
