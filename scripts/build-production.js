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

    // 4. Fazer build do frontend
    console.log('🎨 Fazendo build do frontend...');
    execSync('npx vite build', { stdio: 'inherit' });
    console.log('✅ Frontend buildado!');

    // 5. Fazer build do backend
    console.log('⚙️  Fazendo build do backend...');
    execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
    console.log('✅ Backend buildado!');

    // 6. Verificar se dist/index.js existe
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
