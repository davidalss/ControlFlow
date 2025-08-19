import fetch from 'node-fetch';

// URLs dos serviços
const BACKEND_URL = 'https://enso-backend-0aa1.onrender.com';
const FRONTEND_URL = 'https://enso-frontend.onrender.com';

async function checkHealth(url, serviceName) {
  try {
    const startTime = Date.now();
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      timeout: 10000
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      service: serviceName,
      status: response.status,
      responseTime,
      healthy: response.ok,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      service: serviceName,
      status: 'ERROR',
      responseTime: null,
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function loadTest(endpoint, requests = 10) {
  console.log(`🚀 Iniciando load test para ${endpoint} (${requests} requests)`);
  
  const results = [];
  const promises = [];
  
  for (let i = 0; i < requests; i++) {
    promises.push(
      fetch(`${BACKEND_URL}${endpoint}`, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      }).then(async (response) => {
        const startTime = Date.now();
        const data = await response.text();
        const endTime = Date.now();
        
        return {
          request: i + 1,
          status: response.status,
          responseTime: endTime - startTime,
          dataSize: data.length
        };
      }).catch((error) => ({
        request: i + 1,
        status: 'ERROR',
        responseTime: null,
        error: error.message
      }))
    );
  }
  
  const responses = await Promise.all(promises);
  
  const successful = responses.filter(r => r.status === 200);
  const failed = responses.filter(r => r.status !== 200);
  
  const avgResponseTime = successful.length > 0 
    ? successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length 
    : 0;
  
  return {
    endpoint,
    totalRequests: requests,
    successful: successful.length,
    failed: failed.length,
    successRate: (successful.length / requests) * 100,
    avgResponseTime: Math.round(avgResponseTime),
    minResponseTime: successful.length > 0 ? Math.min(...successful.map(r => r.responseTime)) : 0,
    maxResponseTime: successful.length > 0 ? Math.max(...successful.map(r => r.responseTime)) : 0
  };
}

async function monitorServices() {
  console.log('🔍 Monitoramento de Serviços');
  console.log('============================\n');
  
  // Health checks
  const healthChecks = await Promise.all([
    checkHealth(BACKEND_URL, 'Backend'),
    checkHealth(FRONTEND_URL, 'Frontend')
  ]);
  
  healthChecks.forEach(check => {
    const status = check.healthy ? '✅' : '❌';
    console.log(`${status} ${check.service}: ${check.status} (${check.responseTime}ms)`);
  });
  
  console.log('\n📊 Load Tests');
  console.log('=============\n');
  
  // Load tests
  const endpoints = [
    '/api/health',
    '/api/products',
    '/api/users'
  ];
  
  for (const endpoint of endpoints) {
    const result = await loadTest(endpoint, 5);
    console.log(`📈 ${endpoint}:`);
    console.log(`   Requests: ${result.totalRequests}`);
    console.log(`   Success: ${result.successful}/${result.totalRequests} (${result.successRate.toFixed(1)}%)`);
    console.log(`   Avg Response Time: ${result.avgResponseTime}ms`);
    console.log(`   Min/Max: ${result.minResponseTime}ms / ${result.maxResponseTime}ms\n`);
  }
}

async function main() {
  await monitorServices();
}

main().catch(console.error);
