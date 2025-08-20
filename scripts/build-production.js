#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔨 Iniciando build de produção...\n');

async function buildProduction() {
  try {
    // 1. Verificar se node_modules existe
    if (!fs.existsSync('node_modules')) {
      console.log('📦 Instalando dependências...');
      execSync('npm install', { stdio: 'inherit' });
    }

    // 2. Verificar se vite está instalado
    console.log('🔍 Verificando se vite está instalado...');
    try {
      execSync('npx vite --version', { stdio: 'pipe' });
      console.log('✅ Vite encontrado!');
    } catch (error) {
      console.log('❌ Vite não encontrado, instalando...');
      execSync('npm install vite@^5.4.19', { stdio: 'inherit' });
    }

    // 3. Verificar se esbuild está instalado
    console.log('🔍 Verificando se esbuild está instalado...');
    try {
      execSync('npx esbuild --version', { stdio: 'pipe' });
      console.log('✅ Esbuild encontrado!');
    } catch (error) {
      console.log('❌ Esbuild não encontrado, instalando...');
      execSync('npm install esbuild@^0.25.0', { stdio: 'inherit' });
    }

    // 4. Instalar dependências do cliente
    console.log('📦 Instalando dependências do cliente...');
    execSync('npm install', { stdio: 'inherit', cwd: 'client' });
    console.log('✅ Dependências do cliente instaladas!');

    // 5. Fazer build do frontend
    console.log('🎨 Fazendo build do frontend...');
    execSync('npx vite build', { stdio: 'inherit', cwd: 'client' });
    console.log('✅ Frontend buildado!');

    // 6. Fazer build do backend
    console.log('⚙️  Fazendo build do backend...');
    
    // Usar esbuild com --packages=external (mais confiável)
    execSync('npx esbuild server/index.ts --platform=node --bundle --format=esm --outdir=dist --packages=external', { stdio: 'inherit', cwd: '.' });
    console.log('✅ Backend buildado!');

    // 7. Copiar package.json para dist
    console.log('📦 Copiando package.json para dist...');
    const packageJson = JSON.parse(fs.readFileSync('server/package.json', 'utf8'));
    
    // Criar package.json de produção (sem devDependencies)
    const productionPackage = {
      name: packageJson.name,
      version: packageJson.version,
      type: packageJson.type,
      main: packageJson.main,
      dependencies: packageJson.dependencies,
      engines: packageJson.engines
    };
    
    // Garantir que o diretório dist existe
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist', { recursive: true });
    }
    
    fs.writeFileSync('dist/package.json', JSON.stringify(productionPackage, null, 2));
    console.log('✅ package.json copiado');

    // 8. Copiar pasta public do client para dist
    console.log('📁 Copiando pasta public...');
    if (fs.existsSync('client/dist')) {
      if (!fs.existsSync('dist/public')) {
        fs.mkdirSync('dist/public', { recursive: true });
      }
      execSync('cp -r client/dist/* dist/public/', { stdio: 'inherit' });
      console.log('✅ Pasta public copiada');
    } else {
      console.log('⚠️  Pasta client/dist não encontrada, pulando cópia');
    }

    // 9. Instalar dependências de produção na pasta dist
    console.log('📦 Instalando dependências de produção...');
    execSync('npm install --prefix dist --production', { stdio: 'inherit' });
    console.log('✅ Dependências instaladas');

    // 10. Verificar se dist/index.js existe
    if (!fs.existsSync('dist/index.js')) {
      throw new Error('dist/index.js não foi criado!');
    }

    console.log('🎉 Build de produção concluído com sucesso!');
    console.log('📁 Arquivos gerados:');
    console.log('- dist/index.js (backend)');
    console.log('- dist/public/ (frontend)');

  } catch (error) {
    console.error('❌ Erro durante o build:', error.message);
    process.exit(1);
  }
}

buildProduction();
