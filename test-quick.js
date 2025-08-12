#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 ControlFlow - Verificação Rápida de Teste\n');

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - Arquivo não encontrado`, 'red');
    return false;
  }
}

function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - Diretório não encontrado`, 'red');
    return false;
  }
}

function checkPackageJson(dirPath, description) {
  const packagePath = path.join(dirPath, 'package.json');
  if (checkFile(packagePath, description)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      log(`   📦 Versão: ${packageJson.version || 'N/A'}`, 'blue');
      log(`   📦 Scripts disponíveis: ${Object.keys(packageJson.scripts || {}).join(', ')}`, 'blue');
      return true;
    } catch (error) {
      log(`   ❌ Erro ao ler package.json: ${error.message}`, 'red');
      return false;
    }
  }
  return false;
}

// Verificações do Web App
log('\n🌐 VERIFICANDO APLICATIVO WEB:', 'bold');

const webChecks = [
  checkDirectory('client', 'Diretório client/'),
  checkDirectory('server', 'Diretório server/'),
  checkDirectory('shared', 'Diretório shared/'),
  checkFile('package.json', 'package.json principal'),
  checkFile('drizzle.config.ts', 'Configuração Drizzle'),
  checkFile('tailwind.config.ts', 'Configuração Tailwind'),
  checkFile('vite.config.ts', 'Configuração Vite'),
  checkFile('tsconfig.json', 'Configuração TypeScript'),
];

if (checkPackageJson('.', 'Package.json principal')) {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const hasReact = packageJson.dependencies && packageJson.dependencies.react;
    const hasExpress = packageJson.dependencies && packageJson.dependencies.express;
    
    if (hasReact) log(`   ✅ React ${packageJson.dependencies.react}`, 'green');
    if (hasExpress) log(`   ✅ Express ${packageJson.dependencies.express}`, 'green');
  } catch (error) {
    log(`   ❌ Erro ao verificar dependências: ${error.message}`, 'red');
  }
}

// Verificações do Mobile App
log('\n📱 VERIFICANDO APLICATIVO MÓVEL:', 'bold');

const mobileChecks = [
  checkDirectory('mobile', 'Diretório mobile/'),
  checkDirectory('mobile/src', 'Diretório mobile/src/'),
  checkDirectory('mobile/src/screens', 'Diretório mobile/src/screens/'),
  checkDirectory('mobile/src/contexts', 'Diretório mobile/src/contexts/'),
  checkDirectory('mobile/src/types', 'Diretório mobile/src/types/'),
  checkFile('mobile/package.json', 'Package.json do mobile'),
  checkFile('mobile/app.json', 'Configuração Expo'),
  checkFile('mobile/App.tsx', 'App.tsx principal'),
];

if (checkPackageJson('mobile', 'Package.json do mobile')) {
  try {
    const packageJson = JSON.parse(fs.readFileSync('mobile/package.json', 'utf8'));
    const hasExpo = packageJson.dependencies && packageJson.dependencies.expo;
    const hasReactNative = packageJson.dependencies && packageJson.dependencies['react-native'];
    
    if (hasExpo) log(`   ✅ Expo ${packageJson.dependencies.expo}`, 'green');
    if (hasReactNative) log(`   ✅ React Native ${packageJson.dependencies['react-native']}`, 'green');
  } catch (error) {
    log(`   ❌ Erro ao verificar dependências mobile: ${error.message}`, 'red');
  }
}

// Verificar arquivos de tela importantes
log('\n📱 VERIFICANDO TELAS DO MOBILE:', 'bold');

const screenFiles = [
  'mobile/src/screens/LoginScreen.tsx',
  'mobile/src/screens/DashboardScreen.tsx',
  'mobile/src/screens/InspectionFormScreen.tsx',
  'mobile/src/screens/BarcodeScannerScreen.tsx',
  'mobile/src/screens/OfflineSyncScreen.tsx',
  'mobile/src/contexts/AuthContext.tsx',
  'mobile/src/contexts/OfflineContext.tsx',
  'mobile/src/types/navigation.ts',
  'mobile/src/types/index.ts'
];

screenFiles.forEach(file => {
  checkFile(file, `Arquivo ${path.basename(file)}`);
});

// Verificar arquivos do web app importantes
log('\n🌐 VERIFICANDO PÁGINAS DO WEB APP:', 'bold');

const webFiles = [
  'client/src/App.tsx',
  'client/src/pages/dashboard.tsx',
  'client/src/pages/spc-control.tsx',
  'client/src/pages/supplier-management.tsx',
  'server/index.ts',
  'server/routes.ts',
  'server/sap-integration.ts',
  'shared/schema.ts'
];

webFiles.forEach(file => {
  checkFile(file, `Arquivo ${path.basename(file)}`);
});

// Verificar Node.js e npm
log('\n🔧 VERIFICANDO AMBIENTE:', 'bold');

try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  log(`✅ Node.js ${nodeVersion}`, 'green');
} catch (error) {
  log('❌ Node.js não encontrado', 'red');
}

try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  log(`✅ npm ${npmVersion}`, 'green');
} catch (error) {
  log('❌ npm não encontrado', 'red');
}

// Verificar Expo CLI
try {
  const expoVersion = execSync('expo --version', { encoding: 'utf8' }).trim();
  log(`✅ Expo CLI ${expoVersion}`, 'green');
} catch (error) {
  log('❌ Expo CLI não encontrado - Instale com: npm install -g @expo/cli', 'yellow');
}

// Resumo
log('\n📊 RESUMO:', 'bold');

const totalChecks = webChecks.length + mobileChecks.length + screenFiles.length + webFiles.length;
const passedChecks = webChecks.filter(Boolean).length + mobileChecks.filter(Boolean).length + 
                    screenFiles.map(f => fs.existsSync(f)).filter(Boolean).length +
                    webFiles.map(f => fs.existsSync(f)).filter(Boolean).length;

log(`✅ Verificações passadas: ${passedChecks}/${totalChecks}`, 'green');

if (passedChecks === totalChecks) {
  log('\n🎉 TUDO PRONTO PARA TESTAR!', 'bold');
  log('\n📋 PRÓXIMOS PASSOS:', 'bold');
  log('1. Para testar o Web App:', 'blue');
  log('   cd ControlFlow && npm install && npm run dev', 'yellow');
  log('\n2. Para testar o Mobile App:', 'blue');
  log('   cd ControlFlow/mobile && npm install && npm start', 'yellow');
  log('\n3. Consulte o TESTING_GUIDE.md para instruções detalhadas', 'blue');
} else {
  log('\n⚠️  ALGUNS ARQUIVOS ESTÃO FALTANDO', 'yellow');
  log('Execute os comandos de criação novamente', 'yellow');
}

log('\n📖 Para instruções completas, consulte: TESTING_GUIDE.md', 'blue');
