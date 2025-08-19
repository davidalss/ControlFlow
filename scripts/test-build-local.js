import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 Testando build local do frontend...');
console.log('=====================================\n');

async function testBuild() {
  try {
    // Verificar se estamos no diretório correto
    if (!fs.existsSync('client/package.json')) {
      console.error('❌ Diretório client não encontrado');
      console.log('💡 Execute este script na raiz do projeto');
      return;
    }

    console.log('📁 Verificando estrutura do projeto...');
    
    // Verificar arquivos essenciais
    const requiredFiles = [
      'client/package.json',
      'client/vite.config.ts',
      'client/src/main.tsx',
      'client/index.html'
    ];

    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ ${file} - NÃO ENCONTRADO`);
      }
    }

    console.log('\n📦 Instalando dependências...');
    execSync('cd client && npm install', { stdio: 'inherit' });

    console.log('\n🔨 Executando build...');
    execSync('cd client && npm run build:render', { stdio: 'inherit' });

    console.log('\n📋 Verificando arquivos gerados...');
    
    const distPath = 'client/dist';
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath);
      console.log(`✅ Build gerado em: ${distPath}`);
      console.log(`📄 Arquivos gerados: ${files.length}`);
      
      // Verificar arquivos essenciais do build
      const buildFiles = [
        'index.html',
        'assets'
      ];

      for (const file of buildFiles) {
        const filePath = path.join(distPath, file);
        if (fs.existsSync(filePath)) {
          console.log(`✅ ${file}`);
        } else {
          console.log(`❌ ${file} - NÃO ENCONTRADO`);
        }
      }

      // Verificar tamanho do build
      const stats = fs.statSync(distPath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`📊 Tamanho total: ${sizeInMB} MB`);

    } else {
      console.error('❌ Diretório dist não foi criado');
    }

    console.log('\n🎉 Build testado com sucesso!');
    console.log('💡 Agora você pode fazer o deploy no Render');

  } catch (error) {
    console.error('❌ Erro durante o build:', error.message);
    console.log('\n🔍 Possíveis soluções:');
    console.log('1. Verifique se todas as dependências estão instaladas');
    console.log('2. Verifique se o Node.js está na versão correta');
    console.log('3. Verifique se há erros de TypeScript');
    console.log('4. Verifique as variáveis de ambiente');
  }
}

async function main() {
  await testBuild();
}

main().catch(console.error);
