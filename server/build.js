import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔨 Iniciando build do backend...');

try {
  // 1. Compilar TypeScript
  console.log('1️⃣ Compilando TypeScript...');
  execSync('tsc', { stdio: 'inherit' });
  console.log('✅ TypeScript compilado');

  // 2. Copiar package.json para dist (somente dependencies)
  console.log('2️⃣ Copiando package.json...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const productionPackage = {
    name: packageJson.name,
    version: packageJson.version,
    type: packageJson.type,
    main: packageJson.main,
    dependencies: packageJson.dependencies,
    engines: packageJson.engines
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(productionPackage, null, 2));
  console.log('✅ package.json copiado');

  // 3. Instalar dependências de produção
  console.log('3️⃣ Instalando dependências de produção...');
  execSync('npm install --prefix dist --production', { stdio: 'inherit' });
  console.log('✅ Dependências instaladas');

  // 4. Verificar instalação
  console.log('4️⃣ Verificando instalação...');
  const distNodeModules = path.join('dist', 'node_modules');
  if (!fs.existsSync(distNodeModules)) {
    console.log('⚠️  node_modules não encontrado, instalando novamente...');
    execSync('npm install --prefix dist --production', { stdio: 'inherit' });
  }

  // 5. Verificar se cors está instalado corretamente
  console.log('5️⃣ Verificando se cors está instalado...');
  try {
    require.resolve('cors', { paths: [path.resolve('dist')] });
    console.log('✅ cors está resolvível a partir de dist');
  } catch {
    console.log('❌ cors NÃO está resolvível');
    console.log('📁 Conteúdo de dist/node_modules:', fs.readdirSync(distNodeModules));
  }

  // 6. Verificar arquivo index.js
  console.log('6️⃣ Verificando arquivo index.js...');
  const indexPath = path.join('dist', 'index.js');
  if (fs.existsSync(indexPath)) {
    console.log('✅ dist/index.js encontrado');
  } else {
    console.log('❌ dist/index.js NÃO encontrado');
  }

  console.log('🎉 Build concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}
