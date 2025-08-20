#!/usr/bin/env node

import fetch from 'node-fetch';

const BACKEND_URL = 'https://enso-backend-0aa1.onrender.com';

console.log('🔍 Testando endpoint de login em produção...\n');

async function testLoginEndpoint() {
  try {
    console.log('1. Testando POST /api/auth/login...');
    
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://enso-frontend-pp6s.onrender.com'
      },
      body: JSON.stringify({ email: 'test@test.com', password: 'test' })
    });

    console.log(`   Status: ${response.status}`);
    console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log(`   Body: ${text}`);
    
    if (response.status === 400) {
      console.log('   ✅ Endpoint funcionando corretamente (retornando 400 como esperado)');
      return true;
    } else {
      console.log(`   ❌ Status inesperado: ${response.status}`);
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return false;
  }
}

async function testHealthEndpoint() {
  try {
    console.log('\n2. Testando GET /api/health...');
    
    const response = await fetch(`${BACKEND_URL}/api/health`);
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log(`   ✅ Backend saudável - Uptime: ${Math.round(data.uptime)}s`);
      return true;
    } else {
      console.log(`   ❌ Backend não saudável`);
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return false;
  }
}

async function main() {
  const healthOk = await testHealthEndpoint();
  const loginOk = await testLoginEndpoint();
  
  console.log('\n📊 RESUMO:');
  console.log('==========');
  console.log(`Backend Health: ${healthOk ? '✅' : '❌'}`);
  console.log(`Login Endpoint: ${loginOk ? '✅' : '❌'}`);
  
  if (!loginOk) {
    console.log('\n🔧 POSSÍVEIS CAUSAS:');
    console.log('===================');
    console.log('• Servidor em produção não foi atualizado');
    console.log('• Cache do CDN/Proxy');
    console.log('• Problema de deploy');
    console.log('• Middleware interceptando a requisição');
  }
}

main().catch(console.error);
