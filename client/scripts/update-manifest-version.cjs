#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Função para gerar timestamp de versão
function generateVersion() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}.${month}.${day}.${hour}${minute}`;
}

// Função para atualizar o manifest
function updateManifest() {
  const manifestPath = path.join(__dirname, '../public/site.webmanifest');
  
  try {
    // Ler o manifest atual
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    // Adicionar versão dinâmica
    manifest.version = generateVersion();
    
    // Adicionar timestamp de build
    manifest.buildTime = new Date().toISOString();
    
    // Escrever o manifest atualizado
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log(`✅ Manifest atualizado com versão: ${manifest.version}`);
    console.log(`📅 Timestamp de build: ${manifest.buildTime}`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar manifest:', error);
    process.exit(1);
  }
}

// Função para atualizar o service worker com nova versão
function updateServiceWorker() {
  const swPath = path.join(__dirname, '../public/sw.js');
  
  try {
    let swContent = fs.readFileSync(swPath, 'utf8');
    
    // Atualizar versão do cache
    const newVersion = generateVersion();
    swContent = swContent.replace(
      /const CACHE_NAME = 'enso-cache-v\d+';/,
      `const CACHE_NAME = 'enso-cache-${newVersion}';`
    );
    
    swContent = swContent.replace(
      /const STATIC_CACHE_NAME = 'enso-static-v\d+';/,
      `const STATIC_CACHE_NAME = 'enso-static-${newVersion}';`
    );
    
    swContent = swContent.replace(
      /const DYNAMIC_CACHE_NAME = 'enso-dynamic-v\d+';/,
      `const DYNAMIC_CACHE_NAME = 'enso-dynamic-${newVersion}';`
    );
    
    // Atualizar comentário de versão
    swContent = swContent.replace(
      /\/\/ Versão: \d+\.\d+\.\d+\.\d+/,
      `// Versão: ${newVersion}`
    );
    
    fs.writeFileSync(swPath, swContent);
    
    console.log(`✅ Service Worker atualizado com versão: ${newVersion}`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar service worker:', error);
    process.exit(1);
  }
}

// Função principal
function main() {
  console.log('🔄 Atualizando versões para cache busting...');
  
  updateManifest();
  updateServiceWorker();
  
  console.log('✅ Cache busting configurado com sucesso!');
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { updateManifest, updateServiceWorker, generateVersion };
