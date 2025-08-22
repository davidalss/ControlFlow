// Testes E2E para cenários de erro específicos
// Playwright + Captura de screenshots + Logs detalhados

import { test, expect } from '@playwright/test';
import { logger } from '../../lib/logger';

const BASE_URL = process.env.VITE_APP_URL || 'https://enso-frontend-pp6s.onrender.com';
const LOGIN_EMAIL = 'david.pedro@wap.ind.br';
const LOGIN_PASSWORD = 'david.pedro@wap.ind.br';

test.describe('Cenários de Erro - Testes E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Interceptar requisições para capturar erros
    page.on('response', response => {
      if (response.status() >= 400) {
        logger.logApi({
          url: response.url(),
          method: response.request().method(),
          status: response.status(),
          statusText: response.statusText(),
          headers: response.headers(),
          error: `HTTP ${response.status()}: ${response.statusText()}`
        });
      }
    });

    // Interceptar erros de console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logger.logError('Console Error', {
          message: msg.text(),
          type: msg.type(),
          location: msg.location()
        });
      }
    });

    // Interceptar erros de página
    page.on('pageerror', error => {
      logger.logError('Page Error', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    });

    // Interceptar requisições falhadas
    page.on('requestfailed', request => {
      logger.logApi({
        url: request.url(),
        method: request.method(),
        error: `Request failed: ${request.failure()?.errorText || 'Unknown error'}`
      });
    });
  });

  test('1. 401 Unauthorized em /api/notifications', async ({ page }) => {
    await test.step('Navegar para a página inicial', async () => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
    });

    await test.step('Fazer login', async () => {
      await page.fill('input[type="email"]', LOGIN_EMAIL);
      await page.fill('input[type="password"]', LOGIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard**');
    });

    await test.step('Verificar se há erros 401', async () => {
      // Aguardar carregamento da página
      await page.waitForTimeout(3000);

      // Verificar se há requisições 401
      const apiLogs = logger.getLogsByCategory('api');
      const unauthorizedErrors = apiLogs.filter(log => 
        log.data?.status === 401 && log.data?.url?.includes('/api/notifications')
      );

      if (unauthorizedErrors.length > 0) {
        await page.screenshot({ path: 'screenshots/401-unauthorized.png' });
        throw new Error(`Encontrados ${unauthorizedErrors.length} erros 401 em /api/notifications`);
      }

      expect(unauthorizedErrors.length).toBe(0);
    });
  });

  test('2. Label is not defined (Imports não resolvidos)', async ({ page }) => {
    await test.step('Navegar para planos de inspeção', async () => {
      await page.goto(`${BASE_URL}/inspection-plans`);
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verificar se há erros de import', async () => {
      // Aguardar carregamento da página
      await page.waitForTimeout(3000);

      // Verificar se há erros de console relacionados a imports
      const importLogs = logger.getLogsByCategory('import');
      const labelErrors = importLogs.filter(log => 
        log.message.includes('Label is not defined') || 
        log.message.includes('is not defined')
      );

      if (labelErrors.length > 0) {
        await page.screenshot({ path: 'screenshots/label-not-defined.png' });
        throw new Error(`Encontrados ${labelErrors.length} erros de import não resolvido`);
      }

      expect(labelErrors.length).toBe(0);
    });

    await test.step('Verificar se a página carrega corretamente', async () => {
      // Verificar se elementos básicos estão presentes
      await expect(page.locator('h1, h2, h3')).toBeVisible();
      await expect(page.locator('button, a')).toHaveCount.greaterThan(0);
    });
  });

  test('3. Tela de produtos vazia (0 SKUs)', async ({ page }) => {
    await test.step('Fazer login', async () => {
      await page.goto(BASE_URL);
      await page.fill('input[type="email"]', LOGIN_EMAIL);
      await page.fill('input[type="password"]', LOGIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard**');
    });

    await test.step('Navegar para produtos', async () => {
      await page.goto(`${BASE_URL}/products`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
    });

    await test.step('Verificar se produtos são carregados', async () => {
      // Verificar se há texto indicando 0 produtos
      const zeroProductsText = await page.locator('text=/0 produtos?/i').count();
      
      if (zeroProductsText > 0) {
        await page.screenshot({ path: 'screenshots/zero-products.png' });
        
        // Verificar logs de API
        const apiLogs = logger.getLogsByCategory('api');
        const productErrors = apiLogs.filter(log => 
          log.data?.url?.includes('/api/products') && 
          (log.data?.status >= 400 || log.data?.error)
        );

        if (productErrors.length > 0) {
          throw new Error(`Erro ao carregar produtos: ${productErrors[0].data?.error || 'Unknown error'}`);
        }
      }

      // Verificar se há pelo menos alguns produtos
      const productElements = await page.locator('[data-testid="product-item"], .product-item, tr').count();
      expect(productElements).toBeGreaterThan(0);
    });
  });

  test('4. CSS / layout quebrado', async ({ page }) => {
    await test.step('Navegar para a página inicial', async () => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verificar se CSS está carregado', async () => {
      // Verificar se Tailwind está funcionando
      const testElement = await page.locator('body');
      const backgroundColor = await testElement.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );

      // Se o background for transparente ou branco puro, pode indicar problema
      if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'rgb(255, 255, 255)') {
        logger.logCSS('Background color suspeito', { backgroundColor });
      }

      // Verificar se há estilos aplicados
      const hasStyles = await page.evaluate(() => {
        const testDiv = document.createElement('div');
        testDiv.className = 'bg-red-500 p-4 m-2';
        document.body.appendChild(testDiv);
        
        const computedStyle = window.getComputedStyle(testDiv);
        const hasTailwind = computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                           computedStyle.padding !== '0px';
        
        document.body.removeChild(testDiv);
        return hasTailwind;
      });

      if (!hasStyles) {
        await page.screenshot({ path: 'screenshots/css-broken.png' });
        throw new Error('CSS/Tailwind não está sendo aplicado corretamente');
      }

      expect(hasStyles).toBe(true);
    });

    await test.step('Verificar layout responsivo', async () => {
      // Testar diferentes tamanhos de tela
      const viewports = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 768, height: 1024 },  // Tablet
        { width: 375, height: 667 }    // Mobile
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(1000);

        // Verificar se elementos principais estão visíveis
        const header = await page.locator('header, nav, .header').first();
        if (await header.count() > 0) {
          await expect(header).toBeVisible();
        }

        // Verificar se não há overflow horizontal
        const hasHorizontalScroll = await page.evaluate(() => 
          document.documentElement.scrollWidth > document.documentElement.clientWidth
        );

        if (hasHorizontalScroll) {
          await page.screenshot({ path: `screenshots/horizontal-scroll-${viewport.width}.png` });
          logger.logCSS('Overflow horizontal detectado', { viewport });
        }
      }
    });
  });

  test('5. WebSocket fechado ou heartbeat falhando', async ({ page }) => {
    await test.step('Fazer login e verificar WebSocket', async () => {
      await page.goto(BASE_URL);
      await page.fill('input[type="email"]', LOGIN_EMAIL);
      await page.fill('input[type="password"]', LOGIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard**');
    });

    await test.step('Verificar conexão WebSocket', async () => {
      // Aguardar carregamento da página
      await page.waitForTimeout(5000);

      // Verificar logs de WebSocket
      const wsLogs = logger.getLogsByCategory('websocket');
      const wsErrors = wsLogs.filter(log => 
        log.data?.error || log.data?.action === 'disconnect'
      );

      if (wsErrors.length > 0) {
        await page.screenshot({ path: 'screenshots/websocket-error.png' });
        throw new Error(`Erros de WebSocket detectados: ${wsErrors.length} erros`);
      }

      // Verificar se há pelo menos uma conexão bem-sucedida
      const successfulConnections = wsLogs.filter(log => 
        log.data?.action === 'connect' && !log.data?.error
      );

      expect(successfulConnections.length).toBeGreaterThan(0);
    });
  });

  test('6. Erro 404 Failed to load resource', async ({ page }) => {
    await test.step('Navegar e verificar recursos', async () => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verificar se há erros 404', async () => {
      // Aguardar carregamento completo
      await page.waitForTimeout(3000);

      // Verificar logs de API para erros 404
      const apiLogs = logger.getLogsByCategory('api');
      const notFoundErrors = apiLogs.filter(log => 
        log.data?.status === 404 || 
        log.data?.error?.includes('404') ||
        log.data?.error?.includes('Failed to load resource')
      );

      if (notFoundErrors.length > 0) {
        await page.screenshot({ path: 'screenshots/404-errors.png' });
        throw new Error(`Encontrados ${notFoundErrors.length} erros 404`);
      }

      expect(notFoundErrors.length).toBe(0);
    });
  });

  test('7. Sessão não persistida (User: null)', async ({ page }) => {
    await test.step('Fazer login e verificar sessão', async () => {
      await page.goto(BASE_URL);
      await page.fill('input[type="email"]', LOGIN_EMAIL);
      await page.fill('input[type="password"]', LOGIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard**');
    });

    await test.step('Verificar se sessão está ativa', async () => {
      // Verificar se há dados de usuário na página
      const userElements = await page.locator('[data-testid="user-info"], .user-info, .user-name').count();
      
      if (userElements === 0) {
        // Verificar se há elementos que indicam usuário logado
        const loggedInIndicators = await page.locator('text=/logout/i, text=/profile/i, text=/dashboard/i').count();
        
        if (loggedInIndicators === 0) {
          await page.screenshot({ path: 'screenshots/session-lost.png' });
          throw new Error('Sessão não está sendo mantida - usuário não encontrado');
        }
      }

      // Verificar logs de autenticação
      const authLogs = logger.getLogsByCategory('auth');
      const sessionErrors = authLogs.filter(log => 
        log.data?.action === 'session_check' && !log.data?.success
      );

      if (sessionErrors.length > 0) {
        await page.screenshot({ path: 'screenshots/auth-errors.png' });
        throw new Error(`Problemas de sessão detectados: ${sessionErrors.length} erros`);
      }
    });

    await test.step('Recarregar página e verificar persistência', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verificar se ainda está logado após reload
      const isStillLoggedIn = await page.locator('text=/logout/i, text=/dashboard/i').count() > 0;
      
      if (!isStillLoggedIn) {
        await page.screenshot({ path: 'screenshots/session-not-persisted.png' });
        throw new Error('Sessão não persistiu após reload da página');
      }

      expect(isStillLoggedIn).toBe(true);
    });
  });

  test('Teste de Integração Completo', async ({ page }) => {
    await test.step('Executar fluxo completo', async () => {
      // Login
      await page.goto(BASE_URL);
      await page.fill('input[type="email"]', LOGIN_EMAIL);
      await page.fill('input[type="password"]', LOGIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard**');

      // Navegar para diferentes páginas
      const pages = ['/products', '/inspection-plans', '/dashboard'];
      
      for (const pagePath of pages) {
        await page.goto(`${BASE_URL}${pagePath}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Verificar se página carrega sem erros críticos
        const errorLogs = logger.getLogsByLevel('error');
        const pageErrors = errorLogs.filter(log => 
          log.timestamp > new Date(Date.now() - 10000).toISOString() // Últimos 10 segundos
        );

        if (pageErrors.length > 0) {
          await page.screenshot({ path: `screenshots/errors-${pagePath.replace('/', '')}.png` });
          console.warn(`Erros detectados em ${pagePath}:`, pageErrors);
        }
      }
    });

    await test.step('Gerar relatório final', async () => {
      const errorReport = logger.getErrorReport();
      
      console.log('=== RELATÓRIO DE ERROS E2E ===');
      console.log(`Total de erros: ${errorReport.totalErrors}`);
      console.log('Erros por categoria:', errorReport.errorsByCategory);
      
      if (errorReport.recentErrors.length > 0) {
        console.log('Erros recentes:', errorReport.recentErrors);
      }

      // Se houver muitos erros, falhar o teste
      if (errorReport.totalErrors > 10) {
        throw new Error(`Muitos erros detectados: ${errorReport.totalErrors}`);
      }

      expect(errorReport.totalErrors).toBeLessThanOrEqual(10);
    });
  });
});
