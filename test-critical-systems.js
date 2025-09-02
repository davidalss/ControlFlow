#!/usr/bin/env node

/**
 * Script de Teste dos Sistemas Críticos - NÍVEL 5
 * 
 * Este script testa todas as funcionalidades implementadas:
 * - Health Monitor
 * - Cache Manager
 * - Security Manager
 * - Backup Manager
 * - Rotas Administrativas
 */

const axios = require('axios');

// Configuração
const BASE_URL = process.env.BASE_URL || 'http://localhost:5002';
const TEST_DELAY = 1000; // 1 segundo entre testes

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, status, details = '') {
  const icon = status === 'PASS' ? '✅' : '❌';
  const color = status === 'PASS' ? 'green' : 'red';
  log(`${icon} ${name}: ${status}`, color);
  if (details) {
    log(`   ${details}`, 'cyan');
  }
}

function logSection(name) {
  log(`\n${colors.bright}${colors.blue}=== ${name} ===${colors.reset}`);
}

function logSubsection(name) {
  log(`\n${colors.yellow}--- ${name} ---${colors.reset}`);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testHealthMonitor() {
  logSection('TESTE DO HEALTH MONITOR');
  
  try {
    // Testar endpoint de saúde
    logSubsection('Endpoint de Saúde');
    const healthResponse = await axios.get(`${BASE_URL}/api/admin/health`);
    
    if (healthResponse.status === 200 && healthResponse.data.success) {
      const { health, alerts, metrics } = healthResponse.data.data;
      
      logTest('Status de Saúde', 'PASS', `Status: ${health.status}`);
      logTest('Métricas de Memória', 'PASS', `${health.memory.percentage}% usado`);
      logTest('Status do Banco', 'PASS', `DB: ${health.database.status}`);
      logTest('Status do WebSocket', 'PASS', `WS: ${health.websocket.status}`);
      logTest('Alertas', 'PASS', `${alerts.length} alertas encontrados`);
      logTest('Métricas', 'PASS', `${metrics.length} métricas encontradas`);
      
      return true;
    } else {
      logTest('Endpoint de Saúde', 'FAIL', 'Resposta inválida');
      return false;
    }
  } catch (error) {
    logTest('Endpoint de Saúde', 'FAIL', error.message);
    return false;
  }
}

async function testSecurityManager() {
  logSection('TESTE DO SECURITY MANAGER');
  
  try {
    // Testar endpoint de segurança
    logSubsection('Estatísticas de Segurança');
    const securityResponse = await axios.get(`${BASE_URL}/api/admin/security`);
    
    if (securityResponse.status === 200 && securityResponse.data.success) {
      const { events, stats } = securityResponse.data.data;
      
      logTest('Eventos de Segurança', 'PASS', `${events.length} eventos encontrados`);
      logTest('Estatísticas', 'PASS', `Total: ${stats.totalEvents}`);
      
      // Testar desbloqueio de IP (simulado)
      logSubsection('Desbloqueio de IP');
      try {
        await axios.post(`${BASE_URL}/api/admin/security/unblock/test-ip`);
        logTest('Desbloqueio de IP', 'PASS', 'Endpoint funcionando');
      } catch (error) {
        if (error.response?.status === 404) {
          logTest('Desbloqueio de IP', 'PASS', 'IP não estava bloqueado (esperado)');
        } else {
          logTest('Desbloqueio de IP', 'FAIL', error.message);
        }
      }
      
      return true;
    } else {
      logTest('Endpoint de Segurança', 'FAIL', 'Resposta inválida');
      return false;
    }
  } catch (error) {
    logTest('Endpoint de Segurança', 'FAIL', error.message);
    return false;
  }
}

async function testCacheManager() {
  logSection('TESTE DO CACHE MANAGER');
  
  try {
    // Testar endpoint de cache
    logSubsection('Estatísticas do Cache');
    const cacheResponse = await axios.get(`${BASE_URL}/api/admin/cache`);
    
    if (cacheResponse.status === 200 && cacheResponse.data.success) {
      const { stats, debug } = cacheResponse.data.data;
      
      logTest('Estatísticas do Cache', 'PASS', `Entradas: ${stats.totalEntries}`);
      logTest('Taxa de Hit', 'PASS', `${stats.hitRate.toFixed(1)}%`);
      logTest('Uso de Memória', 'PASS', `${stats.memoryUsage.toFixed(1)}MB`);
      logTest('Informações de Debug', 'PASS', `Chaves: ${debug.cacheKeys.length}`);
      
      // Testar limpeza de cache
      logSubsection('Limpeza de Cache');
      const clearResponse = await axios.post(`${BASE_URL}/api/admin/cache/clear`);
      
      if (clearResponse.status === 200 && clearResponse.data.success) {
        logTest('Limpeza de Cache', 'PASS', clearResponse.data.data.message);
      } else {
        logTest('Limpeza de Cache', 'FAIL', 'Falha na limpeza');
      }
      
      return true;
    } else {
      logTest('Endpoint de Cache', 'FAIL', 'Resposta inválida');
      return false;
    }
  } catch (error) {
    logTest('Endpoint de Cache', 'FAIL', error.message);
    return false;
  }
}

async function testBackupManager() {
  logSection('TESTE DO BACKUP MANAGER');
  
  try {
    // Testar endpoint de backup
    logSubsection('Informações de Backup');
    const backupResponse = await axios.get(`${BASE_URL}/api/admin/backup`);
    
    if (backupResponse.status === 200 && backupResponse.data.success) {
      const { backups, stats } = backupResponse.data.data;
      
      logTest('Lista de Backups', 'PASS', `${backups.length} backups encontrados`);
      logTest('Estatísticas', 'PASS', `Total: ${stats.totalBackups}`);
      
      // Testar criação de backup
      logSubsection('Criação de Backup');
      try {
        const createResponse = await axios.post(`${BASE_URL}/api/admin/backup/create`, {
          type: 'DATABASE_ONLY'
        });
        
        if (createResponse.status === 200 && createResponse.data.success) {
          logTest('Criação de Backup', 'PASS', 'Backup iniciado com sucesso');
          
          // Aguardar um pouco e verificar status
          await delay(2000);
          const updatedResponse = await axios.get(`${BASE_URL}/api/admin/backup`);
          const updatedBackups = updatedResponse.data.data.backups;
          const newBackup = updatedBackups.find(b => b.status === 'IN_PROGRESS' || b.status === 'COMPLETED');
          
          if (newBackup) {
            logTest('Status do Backup', 'PASS', `Status: ${newBackup.status}`);
          } else {
            logTest('Status do Backup', 'FAIL', 'Backup não encontrado');
          }
        } else {
          logTest('Criação de Backup', 'FAIL', 'Falha na criação');
        }
      } catch (error) {
        logTest('Criação de Backup', 'FAIL', error.message);
      }
      
      return true;
    } else {
      logTest('Endpoint de Backup', 'FAIL', 'Resposta inválida');
      return false;
    }
  } catch (error) {
    logTest('Endpoint de Backup', 'FAIL', error.message);
    return false;
  }
}

async function testSystemInfo() {
  logSection('TESTE DE INFORMAÇÕES DO SISTEMA');
  
  try {
    // Testar endpoint de informações do sistema
    logSubsection('Informações Gerais');
    const systemResponse = await axios.get(`${BASE_URL}/api/admin/system`);
    
    if (systemResponse.status === 200 && systemResponse.data.success) {
      const { system, health, security, cache, backup } = systemResponse.data.data;
      
      logTest('Informações do Sistema', 'PASS', `Node: ${system.nodeVersion}`);
      logTest('Uptime do Sistema', 'PASS', `${Math.round(system.uptime / 3600)}h`);
      logTest('Uso de Memória', 'PASS', `${Math.round(system.memory.heapUsed / 1024 / 1024)}MB`);
      logTest('Status de Saúde', 'PASS', `Status: ${health.status}`);
      logTest('Estatísticas de Segurança', 'PASS', `Eventos: ${security.totalEvents}`);
      logTest('Estatísticas de Cache', 'PASS', `Entradas: ${cache.totalEntries}`);
      logTest('Estatísticas de Backup', 'PASS', `Backups: ${backup.totalBackups}`);
      
      return true;
    } else {
      logTest('Endpoint do Sistema', 'FAIL', 'Resposta inválida');
      return false;
    }
  } catch (error) {
    logTest('Endpoint do Sistema', 'FAIL', error.message);
    return false;
  }
}

async function testHealthCheck() {
  logSection('TESTE DE HEALTH CHECK FORÇADO');
  
  try {
    // Testar health check forçado
    logSubsection('Verificação Forçada');
    const healthCheckResponse = await axios.post(`${BASE_URL}/api/admin/health/check`);
    
    if (healthCheckResponse.status === 200 && healthCheckResponse.data.success) {
      const { health, message } = healthCheckResponse.data.data;
      
      logTest('Health Check Forçado', 'PASS', message);
      logTest('Status Atualizado', 'PASS', `Status: ${health.status}`);
      
      return true;
    } else {
      logTest('Health Check Forçado', 'FAIL', 'Resposta inválida');
      return false;
    }
  } catch (error) {
    logTest('Health Check Forçado', 'FAIL', error.message);
    return false;
  }
}

async function testSystemRestart() {
  logSection('TESTE DE REINICIALIZAÇÃO DO SISTEMA');
  
  try {
    // Testar reinicialização de sistemas
    logSubsection('Reinicialização Soft');
    const restartResponse = await axios.post(`${BASE_URL}/api/admin/system/restart`, {
      systems: ['cache']
    });
    
    if (restartResponse.status === 200 && restartResponse.data.success) {
      const { message, results } = restartResponse.data.data;
      
      logTest('Reinicialização do Sistema', 'PASS', message);
      logTest('Resultados', 'PASS', `Cache: ${results.cache}`);
      
      return true;
    } else {
      logTest('Reinicialização do Sistema', 'FAIL', 'Resposta inválida');
      return false;
    }
  } catch (error) {
    logTest('Reinicialização do Sistema', 'FAIL', error.message);
    return false;
  }
}

async function runAllTests() {
  log(`${colors.bright}${colors.magenta}🚀 INICIANDO TESTES DOS SISTEMAS CRÍTICOS - NÍVEL 5${colors.reset}`);
  log(`${colors.cyan}URL Base: ${BASE_URL}${colors.reset}`);
  log(`${colors.cyan}Timestamp: ${new Date().toISOString()}${colors.reset}\n`);
  
  const results = [];
  
  // Executar todos os testes
  results.push(await testHealthMonitor());
  await delay(TEST_DELAY);
  
  results.push(await testSecurityManager());
  await delay(TEST_DELAY);
  
  results.push(await testCacheManager());
  await delay(TEST_DELAY);
  
  results.push(await testBackupManager());
  await delay(TEST_DELAY);
  
  results.push(await testSystemInfo());
  await delay(TEST_DELAY);
  
  results.push(await testHealthCheck());
  await delay(TEST_DELAY);
  
  results.push(await testSystemRestart());
  
  // Resumo dos resultados
  logSection('RESUMO DOS TESTES');
  
  const passed = results.filter(r => r === true).length;
  const failed = results.filter(r => r === false).length;
  const total = results.length;
  
  logTest('Total de Testes', passed === total ? 'PASS' : 'FAIL', `${total} testes executados`);
  logTest('Testes Aprovados', 'PASS', `${passed} testes`);
  logTest('Testes Falharam', failed === 0 ? 'PASS' : 'FAIL', `${failed} testes`);
  
  const successRate = ((passed / total) * 100).toFixed(1);
  logTest('Taxa de Sucesso', passed === total ? 'PASS' : 'FAIL', `${successRate}%`);
  
  if (passed === total) {
    log(`\n${colors.bright}${colors.green}🎉 TODOS OS TESTES PASSARAM! SISTEMAS CRÍTICOS FUNCIONANDO PERFEITAMENTE!${colors.reset}`);
  } else {
    log(`\n${colors.bright}${colors.red}⚠️  ALGUNS TESTES FALHARAM. VERIFIQUE OS SISTEMAS CRÍTICOS.${colors.reset}`);
  }
  
  return passed === total;
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`\n${colors.red}❌ ERRO CRÍTICO: ${error.message}${colors.reset}`);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testHealthMonitor,
  testSecurityManager,
  testCacheManager,
  testBackupManager,
  testSystemInfo,
  testHealthCheck,
  testSystemRestart
};
