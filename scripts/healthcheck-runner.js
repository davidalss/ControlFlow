/**
 * Healthcheck Runner
 * Script independente para rodar healthcheck e gravar logs no Supabase
 * 
 * Uso:
 * node scripts/healthcheck-runner.js
 * 
 * Variáveis de ambiente:
 * - TEST_BASE_URL: URL base para testes (padrão: https://enso-backend-0aa1.onrender.com)
 * - LOG_RETENTION_DAYS: Dias para manter logs (padrão: 30)
 * - RUN_INTERVAL: Intervalo entre execuções em ms (padrão: 300000 = 5 min)
 */

import { runHealthcheckTests } from '../tests/healthcheck.test.js';
import { cleanOldLogs } from '../server/lib/supabase-client.js';

// Configuração
const LOG_RETENTION_DAYS = parseInt(process.env.LOG_RETENTION_DAYS) || 30;
const RUN_INTERVAL = parseInt(process.env.RUN_INTERVAL) || 300000; // 5 minutos
const BASE_URL = process.env.TEST_BASE_URL || 'https://enso-backend-0aa1.onrender.com';

console.log('🚀 Healthcheck Runner iniciado');
console.log(`📍 Base URL: ${BASE_URL}`);
console.log(`⏱️  Intervalo: ${RUN_INTERVAL / 1000} segundos`);
console.log(`🗑️  Retenção de logs: ${LOG_RETENTION_DAYS} dias`);
console.log('');

/**
 * Executa uma rodada de healthcheck
 */
async function runHealthcheck() {
  const startTime = new Date();
  console.log(`🕐 [${startTime.toLocaleString('pt-BR')}] Iniciando healthcheck...`);

  try {
    const summary = await runHealthcheckTests();
    
    const endTime = new Date();
    const duration = endTime - startTime;
    
    console.log(`✅ [${endTime.toLocaleString('pt-BR')}] Healthcheck concluído em ${duration}ms`);
    console.log(`📊 Resultado: ${summary.passed}/${summary.total} testes passaram (${summary.success_rate.toFixed(1)}%)`);
    
    // Alertar se muitos testes falharam
    if (summary.failed > 0) {
      console.log(`⚠️  ATENÇÃO: ${summary.failed} testes falharam!`);
      
      // Aqui você pode adicionar notificações (email, Slack, etc.)
      // await sendAlert(`Healthcheck falhou: ${summary.failed}/${summary.total} testes`);
    }
    
    return summary;
    
  } catch (error) {
    const endTime = new Date();
    console.error(`❌ [${endTime.toLocaleString('pt-BR')}] Erro fatal no healthcheck:`, error);
    
    // Aqui você pode adicionar notificações de erro
    // await sendAlert(`Erro fatal no healthcheck: ${error.message}`);
    
    throw error;
  }
}

/**
 * Limpa logs antigos
 */
async function cleanupOldLogs() {
  try {
    console.log(`🗑️  Limpando logs com mais de ${LOG_RETENTION_DAYS} dias...`);
    await cleanOldLogs(LOG_RETENTION_DAYS);
    console.log('✅ Limpeza de logs concluída');
  } catch (error) {
    console.error('❌ Erro ao limpar logs antigos:', error);
  }
}

/**
 * Executa healthcheck em loop
 */
async function runHealthcheckLoop() {
  console.log('🔄 Iniciando loop de healthcheck...');
  
  // Executar limpeza inicial
  await cleanupOldLogs();
  
  // Executar primeiro healthcheck
  await runHealthcheck();
  
  // Configurar intervalo
  setInterval(async () => {
    try {
      await runHealthcheck();
    } catch (error) {
      console.error('❌ Erro no healthcheck loop:', error);
    }
  }, RUN_INTERVAL);
  
  // Executar limpeza diária (a cada 24 horas)
  setInterval(async () => {
    try {
      await cleanupOldLogs();
    } catch (error) {
      console.error('❌ Erro na limpeza automática:', error);
    }
  }, 24 * 60 * 60 * 1000); // 24 horas
}

/**
 * Executa healthcheck uma única vez
 */
async function runHealthcheckOnce() {
  try {
    console.log('🔄 Executando healthcheck único...');
    await cleanupOldLogs();
    const summary = await runHealthcheck();
    
    console.log('');
    console.log('🏁 Healthcheck único concluído!');
    process.exit(summary.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
const isOnce = args.includes('--once') || args.includes('-o');
const isCleanup = args.includes('--cleanup') || args.includes('-c');

if (isCleanup) {
  // Apenas limpeza
  cleanupOldLogs()
    .then(() => {
      console.log('✅ Limpeza concluída');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro na limpeza:', error);
      process.exit(1);
    });
} else if (isOnce) {
  // Execução única
  runHealthcheckOnce();
} else {
  // Loop contínuo
  runHealthcheckLoop();
  
  // Tratamento de sinais para graceful shutdown
  process.on('SIGINT', () => {
    console.log('');
    console.log('🛑 Recebido SIGINT, encerrando healthcheck runner...');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('');
    console.log('🛑 Recebido SIGTERM, encerrando healthcheck runner...');
    process.exit(0);
  });
  
  console.log('🔄 Healthcheck runner rodando em loop...');
  console.log('   Pressione Ctrl+C para parar');
  console.log('');
}

export { runHealthcheck, cleanupOldLogs };
