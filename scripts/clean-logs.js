/**
 * Clean Logs Script
 * Remove logs antigos do Supabase baseado na variável LOG_RETENTION_DAYS
 * 
 * Uso:
 * node scripts/clean-logs.js
 * 
 * Variáveis de ambiente:
 * - LOG_RETENTION_DAYS: Dias para manter logs (padrão: 30)
 * - DRY_RUN: Se true, apenas mostra o que seria removido (padrão: false)
 */

import { cleanOldLogs, getSystemLogs } from '../server/lib/supabase-client.js';

// Configuração
const LOG_RETENTION_DAYS = parseInt(process.env.LOG_RETENTION_DAYS) || 30;
const DRY_RUN = process.env.DRY_RUN === 'true';

console.log('🧹 Clean Logs Script iniciado');
console.log(`🗑️  Retenção: ${LOG_RETENTION_DAYS} dias`);
console.log(`🔍 Modo: ${DRY_RUN ? 'DRY RUN (apenas simulação)' : 'EXECUÇÃO REAL'}`);
console.log('');

/**
 * Calcula estatísticas dos logs
 */
async function getLogStats() {
  try {
    const logs = await getSystemLogs({ limit: 10000 }); // Buscar mais logs para estatísticas
    
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    
    const totalLogs = logs.length;
    const oldLogs = logs.filter(log => new Date(log.created_at) < cutoffDate);
    const recentLogs = logs.filter(log => new Date(log.created_at) >= cutoffDate);
    
    // Estatísticas por suíte
    const statsBySuite = {};
    logs.forEach(log => {
      statsBySuite[log.test_suite] = (statsBySuite[log.test_suite] || 0) + 1;
    });
    
    // Estatísticas por status
    const statsByStatus = {
      passed: logs.filter(log => log.passed).length,
      failed: logs.filter(log => !log.passed).length
    };
    
    return {
      total: totalLogs,
      old: oldLogs.length,
      recent: recentLogs.length,
      cutoffDate: cutoffDate.toISOString(),
      bySuite: statsBySuite,
      byStatus: statsByStatus
    };
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    throw error;
  }
}

/**
 * Executa a limpeza de logs
 */
async function cleanLogs() {
  try {
    console.log('📊 Obtendo estatísticas dos logs...');
    const stats = await getLogStats();
    
    console.log('');
    console.log('📈 ESTATÍSTICAS ATUAIS:');
    console.log(`   Total de logs: ${stats.total}`);
    console.log(`   Logs antigos (antes de ${new Date(stats.cutoffDate).toLocaleDateString('pt-BR')}): ${stats.old}`);
    console.log(`   Logs recentes: ${stats.recent}`);
    console.log(`   Taxa de sucesso: ${((stats.byStatus.passed / stats.total) * 100).toFixed(1)}%`);
    
    console.log('');
    console.log('📋 LOGS POR SUÍTE:');
    Object.entries(stats.bySuite).forEach(([suite, count]) => {
      console.log(`   ${suite}: ${count}`);
    });
    
    if (stats.old === 0) {
      console.log('');
      console.log('✅ Não há logs antigos para remover!');
      return { removed: 0, kept: stats.total };
    }
    
    console.log('');
    if (DRY_RUN) {
      console.log('🔍 DRY RUN - Simulando remoção...');
      console.log(`   Seriam removidos: ${stats.old} logs`);
      console.log(`   Permaneceriam: ${stats.recent} logs`);
      return { removed: stats.old, kept: stats.recent };
    } else {
      console.log('🗑️  Executando limpeza...');
      const result = await cleanOldLogs(LOG_RETENTION_DAYS);
      
      console.log('✅ Limpeza concluída!');
      console.log(`   Removidos: ${stats.old} logs`);
      console.log(`   Mantidos: ${stats.recent} logs`);
      
      return { removed: stats.old, kept: stats.recent };
    }
    
  } catch (error) {
    console.error('❌ Erro durante limpeza:', error);
    throw error;
  }
}

/**
 * Função principal
 */
async function main() {
  try {
    const result = await cleanLogs();
    
    console.log('');
    console.log('🏁 Clean Logs concluído!');
    console.log(`📊 Resultado: ${result.removed} logs removidos, ${result.kept} mantidos`);
    
    if (DRY_RUN) {
      console.log('');
      console.log('💡 Para executar a limpeza real, remova a variável DRY_RUN=true');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { cleanLogs, getLogStats };
