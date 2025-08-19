import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔨 Iniciando build do backend...');

try {
  // 1. Compilar TypeScript
  console.log('1️⃣ Compilando TypeScript...');
  execSync('tsc', { stdio: 'inherit' });
  console.log('✅ TypeScript compilado');

  // 2. Copiar package.json para dist
  console.log('2️⃣ Copiando package.json...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Criar package.json de produção (sem devDependencies)
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

  // 4. Verificar se tudo foi instalado corretamente
  console.log('4️⃣ Verificando instalação...');
  const distPackageJson = JSON.parse(fs.readFileSync('dist/package.json', 'utf8'));
  console.log('📦 Dependências no dist:', Object.keys(distPackageJson.dependencies || {}));
  
  if (!fs.existsSync('dist/node_modules')) {
    console.log('⚠️  node_modules não encontrado, instalando novamente...');
    execSync('npm install --prefix dist --production', { stdio: 'inherit' });
  }
  
  // 5. Verificar se cors está instalado
  console.log('5️⃣ Verificando se cors está instalado...');
  if (fs.existsSync('dist/node_modules/cors')) {
    console.log('✅ cors encontrado em dist/node_modules/cors');
  } else {
    console.log('❌ cors NÃO encontrado em dist/node_modules/cors');
    console.log('📁 Conteúdo de dist/node_modules:', fs.readdirSync('dist/node_modules'));
  }
  
  // 6. Verificar se o arquivo index.js foi compilado
  console.log('6️⃣ Verificando arquivo index.js...');
  if (fs.existsSync('dist/index.js')) {
    console.log('✅ dist/index.js encontrado');
    const indexContent = fs.readFileSync('dist/index.js', 'utf8');
    if (indexContent.includes('cors')) {
      console.log('✅ cors está sendo importado no index.js');
    } else {
      console.log('⚠️  cors não encontrado no conteúdo do index.js');
    }
  } else {
    console.log('❌ dist/index.js NÃO encontrado');
  }
  
  console.log('✅ Verificação concluída');

  console.log('🎉 Build concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}
