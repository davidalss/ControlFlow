#!/usr/bin/env node

/**
 * Script de análise de performance do projeto
 * Identifica arquivos grandes, imports não utilizados e problemas de performance
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Iniciando análise de performance...');

// Configurações
const MAX_FILE_SIZE = 50 * 1024; // 50KB
const MAX_LINES = 1000;
const SRC_DIR = path.join(__dirname, '..', 'src');

// Estatísticas
const stats = {
  totalFiles: 0,
  largeFiles: [],
  longFiles: [],
  unusedImports: [],
  consoleLogs: [],
  performanceIssues: []
};

function analyzeFile(filePath) {
  const fullPath = path.join(SRC_DIR, filePath);
  if (!fs.existsSync(fullPath)) return;

  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  const size = fs.statSync(fullPath).size;

  stats.totalFiles++;

  // Verificar arquivos grandes
  if (size > MAX_FILE_SIZE) {
    stats.largeFiles.push({
      file: filePath,
      size: Math.round(size / 1024) + 'KB',
      lines: lines.length
    });
  }

  // Verificar arquivos com muitas linhas
  if (lines.length > MAX_LINES) {
    stats.longFiles.push({
      file: filePath,
      lines: lines.length,
      size: Math.round(size / 1024) + 'KB'
    });
  }

  // Verificar console.logs
  const consoleMatches = content.match(/console\.(log|warn|error|info)/g);
  if (consoleMatches) {
    stats.consoleLogs.push({
      file: filePath,
      count: consoleMatches.length,
      types: [...new Set(consoleMatches)]
    });
  }

  // Verificar imports não utilizados (heurística simples)
  const importLines = lines.filter(line => line.trim().startsWith('import'));
  const usedImports = [];
  
  importLines.forEach(importLine => {
    const match = importLine.match(/import\s+\{([^}]+)\}\s+from/);
    if (match) {
      const imports = match[1].split(',').map(i => i.trim());
      imports.forEach(imp => {
        if (content.includes(imp) && !importLine.includes(imp)) {
          usedImports.push(imp);
        }
      });
    }
  });

  if (usedImports.length > 0) {
    stats.unusedImports.push({
      file: filePath,
      imports: usedImports
    });
  }
}

function walkDirectory(dir, baseDir = '') {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const relativePath = path.join(baseDir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDirectory(fullPath, relativePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      analyzeFile(relativePath);
    }
  });
}

// Executar análise
console.log('\n📊 Analisando arquivos...');
walkDirectory(SRC_DIR);

// Relatório
console.log('\n📋 RELATÓRIO DE PERFORMANCE');
console.log('=' .repeat(50));

console.log(`\n📁 Total de arquivos analisados: ${stats.totalFiles}`);

if (stats.largeFiles.length > 0) {
  console.log('\n🔴 ARQUIVOS GRANDES (>50KB):');
  stats.largeFiles.forEach(file => {
    console.log(`  - ${file.file}: ${file.size} (${file.lines} linhas)`);
  });
}

if (stats.longFiles.length > 0) {
  console.log('\n🟡 ARQUIVOS LONGOS (>1000 linhas):');
  stats.longFiles.forEach(file => {
    console.log(`  - ${file.file}: ${file.lines} linhas (${file.size})`);
  });
}

if (stats.consoleLogs.length > 0) {
  console.log('\n🟠 CONSOLE.LOGS ENCONTRADOS:');
  stats.consoleLogs.forEach(log => {
    console.log(`  - ${log.file}: ${log.count} logs (${log.types.join(', ')})`);
  });
}

if (stats.unusedImports.length > 0) {
  console.log('\n🟢 POSSÍVEIS IMPORTS NÃO UTILIZADOS:');
  stats.unusedImports.forEach(imp => {
    console.log(`  - ${imp.file}: ${imp.imports.join(', ')}`);
  });
}

console.log('\n✅ Análise concluída!');
console.log('\n💡 RECOMENDAÇÕES:');
console.log('1. Considere dividir arquivos grandes em componentes menores');
console.log('2. Remova console.logs antes do deploy');
console.log('3. Verifique imports não utilizados');
console.log('4. Use lazy loading para componentes grandes');
