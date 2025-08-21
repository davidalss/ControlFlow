#!/usr/bin/env node

/**
 * Script para verificar variáveis de ambiente críticas antes do build
 * Executar: node scripts/check-env-vars.js
 */

const fs = require('fs');
const path = require('path');

// Cores para output no terminal
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Variáveis críticas que devem estar definidas
const CRITICAL_VARS = {
  VITE_API_URL: {
    required: true,
    description: 'URL da API do backend',
    example: 'https://enso-backend-0aa1.onrender.com'
  },
  VITE_SUPABASE_URL: {
    required: true,
    description: 'URL do Supabase',
    example: 'https://smvohmdytczfouslcaju.supabase.co'
  },
  VITE_SUPABASE_ANON_KEY: {
    required: true,
    description: 'Chave anônima do Supabase',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  VITE_WEBSOCKET_URL: {
    required: false, // Pode ser derivada do VITE_API_URL
    description: 'URL do WebSocket (opcional, pode ser derivada do VITE_API_URL)',
    example: 'wss://enso-backend-0aa1.onrender.com'
  }
};

// Variáveis recomendadas para produção
const RECOMMENDED_VARS = {
  VITE_ENABLE_ANALYTICS: {
    description: 'Habilitar analytics',
    example: 'true'
  },
  VITE_ENABLE_DEBUG: {
    description: 'Habilitar modo debug',
    example: 'false'
  },
  VITE_ENABLE_SOURCE_MAPS: {
    description: 'Habilitar source maps',
    example: 'false'
  }
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${colors.bold}${colors.blue}${'='.repeat(60)}${colors.reset}`);
  log(`${colors.bold}${colors.blue}${message}${colors.reset}`);
  log(`${colors.bold}${colors.blue}${'='.repeat(60)}${colors.reset}`);
}

function checkEnvFile() {
  logHeader('🔍 VERIFICANDO ARQUIVO .env');
  
  const envPath = path.join(__dirname, '..', '.env');
  const envLocalPath = path.join(__dirname, '..', '.env.local');
  const envProductionPath = path.join(__dirname, '..', 'env.production');
  
  let envContent = '';
  let envFile = '';
  
  // Tentar ler diferentes arquivos de ambiente
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    envFile = '.env';
  } else if (fs.existsSync(envLocalPath)) {
    envContent = fs.readFileSync(envLocalPath, 'utf8');
    envFile = '.env.local';
  } else if (fs.existsSync(envProductionPath)) {
    envContent = fs.readFileSync(envProductionPath, 'utf8');
    envFile = 'env.production';
  } else {
    log('❌ Nenhum arquivo de ambiente encontrado!', 'red');
    log('   Arquivos verificados:', 'yellow');
    log('   - .env', 'yellow');
    log('   - .env.local', 'yellow');
    log('   - env.production', 'yellow');
    return false;
  }
  
  log(`✅ Arquivo de ambiente encontrado: ${envFile}`, 'green');
  
  // Parse das variáveis do arquivo
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
      }
    }
  });
  
  return { envVars, envFile };
}

function checkCriticalVars(envVars) {
  logHeader('🚨 VERIFICANDO VARIÁVEIS CRÍTICAS');
  
  let allCriticalVarsPresent = true;
  const missingVars = [];
  const presentVars = [];
  
  for (const [varName, config] of Object.entries(CRITICAL_VARS)) {
    const value = envVars[varName] || process.env[varName];
    
    if (value && value.trim() !== '') {
      log(`✅ ${varName}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`, 'green');
      presentVars.push(varName);
    } else if (config.required) {
      log(`❌ ${varName}: AUSENTE`, 'red');
      log(`   Descrição: ${config.description}`, 'yellow');
      log(`   Exemplo: ${config.example}`, 'yellow');
      missingVars.push(varName);
      allCriticalVarsPresent = false;
    } else {
      log(`⚠️  ${varName}: AUSENTE (opcional)`, 'yellow');
      log(`   Descrição: ${config.description}`, 'yellow');
    }
  }
  
  // Verificar se VITE_WEBSOCKET_URL pode ser derivada do VITE_API_URL
  if (!envVars.VITE_WEBSOCKET_URL && !process.env.VITE_WEBSOCKET_URL) {
    const apiUrl = envVars.VITE_API_URL || process.env.VITE_API_URL;
    if (apiUrl) {
      const wsUrl = apiUrl.replace('https://', 'wss://').replace('http://', 'ws://');
      log(`💡 VITE_WEBSOCKET_URL pode ser derivada: ${wsUrl}`, 'blue');
    }
  }
  
  return { allCriticalVarsPresent, missingVars, presentVars };
}

function checkRecommendedVars(envVars) {
  logHeader('📋 VERIFICANDO VARIÁVEIS RECOMENDADAS');
  
  for (const [varName, config] of Object.entries(RECOMMENDED_VARS)) {
    const value = envVars[varName] || process.env[varName];
    
    if (value && value.trim() !== '') {
      log(`✅ ${varName}: ${value}`, 'green');
    } else {
      log(`💡 ${varName}: Não definida`, 'blue');
      log(`   Descrição: ${config.description}`, 'yellow');
      log(`   Exemplo: ${config.example}`, 'yellow');
    }
  }
}

function checkBuildEnvironment() {
  logHeader('🏗️  VERIFICANDO AMBIENTE DE BUILD');
  
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  
  log(`Ambiente: ${nodeEnv}`, isProduction ? 'yellow' : 'green');
  
  if (isProduction) {
    log('⚠️  Build em produção detectado!', 'yellow');
    log('   Certifique-se de que todas as variáveis críticas estão definidas.', 'yellow');
  }
  
  return isProduction;
}

function generateEnvTemplate() {
  logHeader('📝 TEMPLATE DE ARQUIVO .env');
  
  log('Crie um arquivo .env na raiz do projeto client/ com o seguinte conteúdo:', 'blue');
  log('');
  
  log('# Configurações de Ambiente', 'blue');
  log('NODE_ENV=development', 'blue');
  log('VITE_NODE_ENV=development', 'blue');
  log('');
  
  log('# URLs das APIs (OBRIGATÓRIO)', 'red');
  log('VITE_API_URL=https://enso-backend-0aa1.onrender.com', 'blue');
  log('');
  
  log('# Configurações do Supabase (OBRIGATÓRIO)', 'red');
  log('VITE_SUPABASE_URL=https://smvohmdytczfouslcaju.supabase.co', 'blue');
  log('VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 'blue');
  log('');
  
  log('# Configurações do WebSocket (OPCIONAL)', 'yellow');
  log('VITE_WEBSOCKET_URL=wss://enso-backend-0aa1.onrender.com', 'blue');
  log('');
  
  log('# Configurações de Performance (RECOMENDADO)', 'blue');
  log('VITE_ENABLE_ANALYTICS=true', 'blue');
  log('VITE_ENABLE_DEBUG=false', 'blue');
  log('VITE_ENABLE_SOURCE_MAPS=false', 'blue');
  log('');
}

function main() {
  logHeader('🔧 VERIFICADOR DE VARIÁVEIS DE AMBIENTE');
  
  const isProduction = checkBuildEnvironment();
  
  const envCheck = checkEnvFile();
  if (!envCheck) {
    generateEnvTemplate();
    process.exit(1);
  }
  
  const { envVars, envFile } = envCheck;
  const { allCriticalVarsPresent, missingVars, presentVars } = checkCriticalVars(envVars);
  
  checkRecommendedVars(envVars);
  
  // Resumo final
  logHeader('📊 RESUMO DA VERIFICAÇÃO');
  
  if (allCriticalVarsPresent) {
    log('✅ Todas as variáveis críticas estão presentes!', 'green');
    log(`📁 Arquivo usado: ${envFile}`, 'green');
    log(`🔢 Variáveis críticas: ${presentVars.length}/${Object.keys(CRITICAL_VARS).length}`, 'green');
    
    if (isProduction) {
      log('🚀 Pronto para build de produção!', 'green');
    } else {
      log('🔧 Pronto para desenvolvimento!', 'green');
    }
    
    return true;
  } else {
    log('❌ Variáveis críticas ausentes!', 'red');
    log(`📁 Arquivo usado: ${envFile}`, 'yellow');
    log(`🔢 Variáveis críticas: ${presentVars.length}/${Object.keys(CRITICAL_VARS).length}`, 'red');
    log(`❌ Ausentes: ${missingVars.join(', ')}`, 'red');
    
    if (isProduction) {
      log('🚫 Build de produção bloqueado!', 'red');
      log('   Defina todas as variáveis críticas antes de fazer deploy.', 'red');
    } else {
      log('⚠️  Desenvolvimento pode ter problemas!', 'yellow');
      log('   Defina as variáveis ausentes para melhor experiência.', 'yellow');
    }
    
    generateEnvTemplate();
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}

module.exports = { main, checkCriticalVars, checkEnvFile };
