#!/usr/bin/env node

/**
 * Script de limpeza automática do projeto
 * Remove arquivos desnecessários e otimiza a estrutura
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Iniciando limpeza do projeto...');

// Arquivos e diretórios para remover
const filesToRemove = [
  'src/examples',
  'src/styles/theme.css',
  'src/pages/users-old.tsx',
  'src/pages/products-updated.tsx',
  'src/pages/dashboard-new.tsx',
  'src/styles/sales-page.css',
  'src/hooks/use-notifications.ts',
  'test-supabase.js'
];

// Diretórios para limpar
const dirsToClean = [
  'node_modules/.vite',
  'dist',
  '.vite'
];

function removeFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`✅ Removido: ${filePath}`);
    } catch (error) {
      console.log(`❌ Erro ao remover ${filePath}:`, error.message);
    }
  } else {
    console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
  }
}

function cleanDirectory(dirPath) {
  const fullPath = path.join(__dirname, '..', dirPath);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ Limpo: ${dirPath}`);
    } catch (error) {
      console.log(`❌ Erro ao limpar ${dirPath}:`, error.message);
    }
  }
}

// Executar limpeza
console.log('\n📁 Removendo arquivos desnecessários...');
filesToRemove.forEach(removeFile);

console.log('\n🗂️  Limpando diretórios de cache...');
dirsToClean.forEach(cleanDirectory);

console.log('\n✅ Limpeza concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. npm install (se necessário)');
console.log('2. npm run build (para testar)');
console.log('3. npm run dev (para desenvolvimento)');
