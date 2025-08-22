import puppeteer from 'puppeteer';

// Script de teste automatizado para os 3 problemas identificados
// 1. 401 Unauthorized em /api/notifications
// 2. Label is not defined (imports não resolvidos)
// 3. CSS não aplicado

const FRONTEND_URL = 'https://enso-frontend-pp6s.onrender.com';
const LOGIN_EMAIL = 'david.pedro@wap.ind.br';
const LOGIN_PASSWORD = 'david.pedro@wap.ind.br';

async function testFrontendIssues() {
  console.log('🚀 INICIANDO TESTES AUTOMATIZADOS DO FRONTEND');
  console.log('📍 URL:', FRONTEND_URL);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('');

  let browser;
  let page;

  try {
    // Iniciar browser
    browser = await puppeteer.launch({
      headless: false, // false para ver o que está acontecendo
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();
    
    // Interceptar requisições para capturar erros 401
    const networkErrors = [];
    page.on('response', response => {
      if (response.status() === 401) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    // Capturar erros de console
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          text: msg.text(),
          type: msg.type(),
          url: msg.location()?.url || 'unknown'
        });
      }
    });

    // Capturar erros de página
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push({
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    });

    console.log('1️⃣ Testando carregamento da página...');
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    
    // Verificar se a página carregou
    const title = await page.title();
    console.log('✅ Página carregada:', title);

    // 2. Teste de CSS
    console.log('\n2️⃣ Testando CSS...');
    const cssTest = await page.evaluate(() => {
      // Criar elemento de teste
      const testDiv = document.createElement('div');
      testDiv.className = 'bg-red-500 p-4 m-2';
      testDiv.style.position = 'absolute';
      testDiv.style.top = '-9999px';
      testDiv.style.left = '-9999px';
      testDiv.textContent = 'CSS Test';
      
      document.body.appendChild(testDiv);
      
      const computedStyle = window.getComputedStyle(testDiv);
      const backgroundColor = computedStyle.backgroundColor;
      const padding = computedStyle.padding;
      const margin = computedStyle.margin;
      
      document.body.removeChild(testDiv);
      
      return {
        backgroundColor,
        padding,
        margin,
        isTailwindWorking: backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                           backgroundColor !== 'transparent' &&
                           (padding !== '0px' || margin !== '0px')
      };
    });

    console.log('📊 Resultado do teste CSS:', cssTest);

    // 3. Teste de login
    console.log('\n3️⃣ Testando login...');
    
    // Aguardar pelo formulário de login
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Preencher formulário
    await page.type('input[type="email"]', LOGIN_EMAIL);
    await page.type('input[type="password"]', LOGIN_PASSWORD);
    
    // Clicar no botão de login
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    console.log('✅ Login realizado');

    // 4. Teste de navegação para produtos
    console.log('\n4️⃣ Testando navegação para produtos...');
    
    // Aguardar carregamento da página após login
    await page.waitForTimeout(3000);
    
    // Tentar navegar para produtos
    try {
      await page.goto(`${FRONTEND_URL}/products`, { waitUntil: 'networkidle2' });
      console.log('✅ Página de produtos carregada');
    } catch (error) {
      console.log('⚠️ Erro ao carregar página de produtos:', error.message);
    }

    // 5. Teste de navegação para planos de inspeção (onde ocorre o erro Label)
    console.log('\n5️⃣ Testando navegação para planos de inspeção...');
    
    try {
      await page.goto(`${FRONTEND_URL}/inspection-plans`, { waitUntil: 'networkidle2' });
      console.log('✅ Página de planos de inspeção carregada');
    } catch (error) {
      console.log('⚠️ Erro ao carregar página de planos de inspeção:', error.message);
    }

    // Aguardar um pouco para capturar erros
    await page.waitForTimeout(5000);

    // 6. Análise dos resultados
    console.log('\n📊 ANÁLISE DOS RESULTADOS');
    console.log('========================');

    // Erros de rede (401)
    if (networkErrors.length > 0) {
      console.log('\n🚨 ERROS DE REDE (401):');
      networkErrors.forEach(error => {
        console.log(`  ❌ ${error.url} - ${error.status} ${error.statusText}`);
      });
    } else {
      console.log('\n✅ Nenhum erro 401 detectado');
    }

    // Erros de console
    if (consoleErrors.length > 0) {
      console.log('\n🚨 ERROS DE CONSOLE:');
      consoleErrors.forEach(error => {
        console.log(`  ❌ ${error.text}`);
        if (error.text.includes('is not defined')) {
          console.log('    🎯 ERRO DE IMPORT NÃO RESOLVIDO DETECTADO!');
        }
      });
    } else {
      console.log('\n✅ Nenhum erro de console detectado');
    }

    // Erros de página
    if (pageErrors.length > 0) {
      console.log('\n🚨 ERROS DE PÁGINA:');
      pageErrors.forEach(error => {
        console.log(`  ❌ ${error.name}: ${error.message}`);
      });
    } else {
      console.log('\n✅ Nenhum erro de página detectado');
    }

    // CSS
    if (cssTest.isTailwindWorking) {
      console.log('\n✅ CSS funcionando corretamente');
    } else {
      console.log('\n❌ CSS não está sendo aplicado');
      console.log('   Detalhes:', cssTest);
    }

    // 7. Resumo final
    console.log('\n📋 RESUMO FINAL');
    console.log('===============');
    
    const totalErrors = networkErrors.length + consoleErrors.length + pageErrors.length;
    const cssWorking = cssTest.isTailwindWorking;
    
    console.log(`Total de erros: ${totalErrors}`);
    console.log(`CSS funcionando: ${cssWorking ? '✅' : '❌'}`);
    
    if (totalErrors === 0 && cssWorking) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    } else {
      console.log('\n🔧 PROBLEMAS DETECTADOS - CORREÇÕES NECESSÁRIAS');
      
      if (networkErrors.length > 0) {
        console.log('1. Corrigir erros 401 - verificar autenticação');
      }
      
      if (consoleErrors.some(e => e.text.includes('is not defined'))) {
        console.log('2. Corrigir imports não resolvidos - verificar componentes');
      }
      
      if (!cssWorking) {
        console.log('3. Corrigir CSS - verificar Tailwind e imports');
      }
    }

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Executar testes
testFrontendIssues().then(() => {
  console.log('\n=== TESTES CONCLUÍDOS ===');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal nos testes:', error);
  process.exit(1);
});
