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

  console.log('🎉 Build concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}
