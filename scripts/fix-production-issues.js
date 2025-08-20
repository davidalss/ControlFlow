#!/usr/bin/env node

/**
 * Script para testar e corrigir problemas de produção identificados
 * 
 * Problemas identificados:
 * 1. Login da página de vendas vai direto para dashboard
 * 2. Logout não funciona corretamente
 * 3. WebSocket falha na conexão
 * 4. CORS bloqueia requisições
 * 5. Botões de planos de inspeção não funcionam
 * 6. Performance na página de vendas
 */

import fetch from 'node-fetch';

const BACKEND_URL = 'https://enso-backend-0aa1.onrender.com';
const FRONTEND_URL = 'https://enso-frontend-pp6s.onrender.com';

console.log('🔧 Iniciando diagnóstico e correção de problemas de produção...\n');

async function testBackendHealth() {
  console.log('1. Testando saúde do backend...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Database: ${data.database?.connected ? '✅ Conectado' : '❌ Desconectado'}`);
    console.log(`   Uptime: ${Math.round(data.uptime)}s`);
    
    return response.status === 200;
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return false;
  }
}

async function testCORS() {
  console.log('\n2. Testando configuração CORS...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
      }
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
    };
    
    console.log(`   Status: ${response.status}`);
    console.log(`   CORS Headers:`, corsHeaders);
    
    return response.status === 200 && corsHeaders['Access-Control-Allow-Origin'];
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return false;
  }
}

async function testInspectionPlansAPI() {
  console.log('\n3. Testando API de planos de inspeção...');
  
  try {
    // Teste sem autenticação (deve retornar 401)
    const response = await fetch(`${BACKEND_URL}/api/inspection-plans`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   GET /api/inspection-plans: ${response.status}`);
    
    if (response.status === 401) {
      console.log('   ✅ Autenticação requerida (correto)');
    } else if (response.status === 200) {
      console.log('   ⚠️  API retornou dados sem autenticação');
    } else {
      console.log('   ❌ Erro inesperado');
    }
    
    return response.status === 401;
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return false;
  }
}

async function testWebSocket() {
  console.log('\n4. Testando endpoint WebSocket...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/websocket/status`);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   WebSocket Available: ${data.available ? '✅' : '❌'}`);
    console.log(`   Endpoint: ${data.endpoint}`);
    console.log(`   Connections: ${data.connections}`);
    
    return data.available;
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return false;
  }
}

async function testAuthEndpoints() {
  console.log('\n5. Testando endpoints de autenticação...');
  
  try {
    // Teste de login (deve retornar 400 sem credenciais)
    const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    console.log(`   POST /api/auth/login: ${loginResponse.status}`);
    
    if (loginResponse.status !== 200) {
      try {
        const errorData = await loginResponse.text();
        console.log(`   📄 Resposta: ${errorData.substring(0, 200)}...`);
      } catch (e) {
        console.log(`   📄 Erro ao ler resposta: ${e.message}`);
      }
    }
    
    // Teste de logout (deve retornar 401 sem token)
    const logoutResponse = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   POST /api/auth/logout: ${logoutResponse.status}`);
    
    return loginResponse.status === 400 && logoutResponse.status === 401;
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return false;
  }
}

async function generateReport() {
  console.log('\n📋 Gerando relatório de diagnóstico...\n');
  
  const results = {
    backendHealth: await testBackendHealth(),
    cors: await testCORS(),
    inspectionPlans: await testInspectionPlansAPI(),
    websocket: await testWebSocket(),
    auth: await testAuthEndpoints()
  };
  
  console.log('📊 RESUMO DOS TESTES:');
  console.log('=====================');
  console.log(`Backend Health: ${results.backendHealth ? '✅' : '❌'}`);
  console.log(`CORS Config: ${results.cors ? '✅' : '❌'}`);
  console.log(`Inspection Plans API: ${results.inspectionPlans ? '✅' : '❌'}`);
  console.log(`WebSocket: ${results.websocket ? '✅' : '❌'}`);
  console.log(`Auth Endpoints: ${results.auth ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  console.log(`\n${allPassed ? '🎉 Todos os testes passaram!' : '⚠️  Alguns problemas foram identificados.'}`);
  
  if (!allPassed) {
    console.log('\n🔧 RECOMENDAÇÕES:');
    console.log('================');
    
    if (!results.backendHealth) {
      console.log('• Verificar se o backend está rodando no Render');
      console.log('• Verificar logs do backend para erros');
    }
    
    if (!results.cors) {
      console.log('• Atualizar configuração CORS no backend');
      console.log('• Adicionar domínio do frontend à lista de origens permitidas');
    }
    
    if (!results.inspectionPlans) {
      console.log('• Verificar se as rotas de planos de inspeção estão funcionando');
      console.log('• Verificar se o middleware de autenticação está correto');
    }
    
    if (!results.websocket) {
      console.log('• Verificar se o WebSocket está inicializado corretamente');
      console.log('• Verificar se o servidor HTTP está configurado para WebSocket');
    }
    
    if (!results.auth) {
      console.log('• Verificar se os endpoints de autenticação estão funcionando');
      console.log('• Verificar se o Supabase está configurado corretamente');
    }
  }
  
  return allPassed;
}

// Executar diagnóstico
generateReport().catch(console.error);
