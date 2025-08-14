const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuração dos testes
const testConfig = {
  timeout: 30000,
  verbose: true,
  coverage: true,
  watch: false
};

// Lista de testes para executar
const testFiles = [
  'Layout.test.tsx',
  'TrainingPage.test.tsx',
  'InspectionPlansPage.test.tsx'
];

// Função para executar testes
function runTests() {
  console.log('🚀 Iniciando testes automatizados do QualiHUB...\n');

  let passedTests = 0;
  let failedTests = 0;
  let totalTests = 0;

  testFiles.forEach((testFile, index) => {
    console.log(`📋 Executando teste ${index + 1}/${testFiles.length}: ${testFile}`);
    
    try {
      const testPath = path.join(__dirname, testFile);
      
      if (!fs.existsSync(testPath)) {
        console.log(`❌ Arquivo de teste não encontrado: ${testFile}`);
        failedTests++;
        return;
      }

      // Executa o teste usando Jest
      const result = execSync(`npx jest ${testPath} --verbose --timeout=${testConfig.timeout}`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      console.log(`✅ ${testFile} - PASSED`);
      console.log(result);
      passedTests++;

    } catch (error) {
      console.log(`❌ ${testFile} - FAILED`);
      console.log(error.stdout || error.message);
      failedTests++;
    }

    console.log('─'.repeat(50));
  });

  // Relatório final
  totalTests = passedTests + failedTests;
  
  console.log('\n📊 RELATÓRIO FINAL DOS TESTES');
  console.log('─'.repeat(50));
  console.log(`✅ Testes Passados: ${passedTests}`);
  console.log(`❌ Testes Falharam: ${failedTests}`);
  console.log(`📈 Total de Testes: ${totalTests}`);
  console.log(`📊 Taxa de Sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (failedTests > 0) {
    console.log('\n⚠️  ALGUNS TESTES FALHARAM!');
    console.log('Verifique os erros acima e corrija os problemas identificados.');
    process.exit(1);
  } else {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('O sistema QualiHUB está funcionando corretamente.');
  }
}

// Função para verificar dependências
function checkDependencies() {
  console.log('🔍 Verificando dependências...');
  
  const requiredDeps = [
    '@testing-library/react',
    '@testing-library/jest-dom',
    'jest',
    'jest-environment-jsdom'
  ];

  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'));
  const installedDeps = Object.keys(packageJson.dependencies || {});
  const installedDevDeps = Object.keys(packageJson.devDependencies || {});

  const missingDeps = requiredDeps.filter(dep => 
    !installedDeps.includes(dep) && !installedDevDeps.includes(dep)
  );

  if (missingDeps.length > 0) {
    console.log('❌ Dependências faltando:');
    missingDeps.forEach(dep => console.log(`   - ${dep}`));
    console.log('\nExecute: npm install --save-dev ' + missingDeps.join(' '));
    process.exit(1);
  }

  console.log('✅ Todas as dependências estão instaladas.\n');
}

// Função para verificar estrutura de arquivos
function checkFileStructure() {
  console.log('📁 Verificando estrutura de arquivos...');
  
  const requiredFiles = [
    '../components/Layout.tsx',
    '../pages/training.tsx',
    '../pages/inspection-plans.tsx',
    '../components/AnimatedLogo.tsx',
    '../hooks/use-auth.tsx',
    '../hooks/use-toast.tsx'
  ];

  const missingFiles = requiredFiles.filter(file => {
    const filePath = path.join(__dirname, file);
    return !fs.existsSync(filePath);
  });

  if (missingFiles.length > 0) {
    console.log('❌ Arquivos faltando:');
    missingFiles.forEach(file => console.log(`   - ${file}`));
    console.log('\nCertifique-se de que todos os arquivos necessários existem.');
    process.exit(1);
  }

  console.log('✅ Estrutura de arquivos está correta.\n');
}

// Função principal
function main() {
  try {
    console.log('🔧 QUALIHUB - SISTEMA DE TESTES AUTOMATIZADOS');
    console.log('='.repeat(60));
    
    checkDependencies();
    checkFileStructure();
    runTests();
    
  } catch (error) {
    console.error('❌ Erro durante a execução dos testes:', error.message);
    process.exit(1);
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  runTests,
  checkDependencies,
  checkFileStructure
};
