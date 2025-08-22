#!/usr/bin/env node

/**
 * Script de correção imediata
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 CORREÇÃO IMEDIATA INICIADA...');

// 1. Verificar se o NotificationsProvider está no App.tsx
const appPath = path.join(__dirname, '..', 'src', 'App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

if (!appContent.includes('NotificationsProvider')) {
  console.log('❌ NotificationsProvider não encontrado!');
} else {
  console.log('✅ NotificationsProvider encontrado!');
}

// 2. Verificar se o arquivo notifications.ts tem o provider
const notificationsPath = path.join(__dirname, '..', 'src', 'lib', 'notifications.ts');
const notificationsContent = fs.readFileSync(notificationsPath, 'utf8');

if (!notificationsContent.includes('NotificationsProvider')) {
  console.log('❌ NotificationsProvider não encontrado em notifications.ts!');
} else {
  console.log('✅ NotificationsProvider encontrado em notifications.ts!');
}

// 3. Verificar CSS
const indexCssPath = path.join(__dirname, '..', 'src', 'index.css');
const globalsCssPath = path.join(__dirname, '..', 'src', 'styles', 'globals.css');

console.log('📁 Verificando CSS:');
console.log(`  index.css: ${fs.existsSync(indexCssPath) ? '✅' : '❌'}`);
console.log(`  globals.css: ${fs.existsSync(globalsCssPath) ? '✅' : '❌'}`);

// 4. Verificar main.tsx
const mainPath = path.join(__dirname, '..', 'src', 'main.tsx');
const mainContent = fs.readFileSync(mainPath, 'utf8');

console.log('📁 Verificando imports no main.tsx:');
console.log(`  index.css: ${mainContent.includes("import './index.css'") ? '✅' : '❌'}`);
console.log(`  globals.css: ${mainContent.includes("import './styles/globals.css'") ? '✅' : '❌'}`);

// 5. Verificar supabaseClient
const supabasePath = path.join(__dirname, '..', 'src', 'lib', 'supabaseClient.ts');
const supabaseContent = fs.readFileSync(supabasePath, 'utf8');

console.log('📁 Verificando supabaseClient:');
console.log(`  Cliente criado: ${supabaseContent.includes('createClient') ? '✅' : '❌'}`);
console.log(`  Tratamento de erro: ${supabaseContent.includes('console.error') ? '✅' : '❌'}`);

console.log('\n✅ VERIFICAÇÃO CONCLUÍDA!');
