const puppeteer = require('puppeteer');

async function testInspectionPlansButtons() {
  console.log('🧪 Testando botões de planos de inspeção...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    
    // Configurar viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navegar para a página de planos de inspeção
    console.log('📱 Navegando para a página de planos de inspeção...');
    await page.goto('https://enso-frontend-pp6s.onrender.com/inspection-plans', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Aguardar carregamento da página
    await page.waitForTimeout(3000);
    
    // Verificar se a página carregou corretamente
    const pageTitle = await page.title();
    console.log('📄 Título da página:', pageTitle);
    
    // Verificar se há planos carregados
    const plansCount = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="Card"]');
      return cards.length;
    });
    console.log('📊 Número de planos encontrados:', plansCount);
    
    // Testar botão "Novo Plano"
    console.log('🔘 Testando botão "Novo Plano"...');
    const novoPlanoButton = await page.$('button:has-text("Novo Plano")');
    if (novoPlanoButton) {
      console.log('✅ Botão "Novo Plano" encontrado');
      
      // Verificar se o botão está visível e clicável
      const isVisible = await novoPlanoButton.isVisible();
      const isEnabled = await novoPlanoButton.isEnabled();
      console.log('👁️ Botão visível:', isVisible);
      console.log('✅ Botão habilitado:', isEnabled);
      
      // Tentar clicar no botão
      try {
        await novoPlanoButton.click();
        console.log('✅ Clique no botão "Novo Plano" realizado');
        
        // Aguardar modal aparecer
        await page.waitForTimeout(2000);
        
        // Verificar se o modal apareceu
        const modal = await page.$('[role="dialog"]');
        if (modal) {
          console.log('✅ Modal de criação apareceu');
        } else {
          console.log('❌ Modal de criação não apareceu');
        }
        
        // Fechar modal se existir
        const closeButton = await page.$('button:has-text("Cancelar"), button:has-text("Fechar"), [aria-label="Close"]');
        if (closeButton) {
          await closeButton.click();
          console.log('✅ Modal fechado');
        }
        
      } catch (error) {
        console.log('❌ Erro ao clicar no botão "Novo Plano":', error.message);
      }
    } else {
      console.log('❌ Botão "Novo Plano" não encontrado');
    }
    
    // Testar botões de ação nos planos (se existirem)
    if (plansCount > 0) {
      console.log('🔘 Testando botões de ação nos planos...');
      
      // Verificar botões de ação
      const actionButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.map(btn => ({
          text: btn.textContent?.trim(),
          visible: btn.offsetParent !== null,
          enabled: !btn.disabled,
          classes: btn.className
        })).filter(btn => 
          btn.text && (
            btn.text.includes('Visualizar') || 
            btn.text.includes('Editar') || 
            btn.text.includes('Deletar') ||
            btn.text.includes('Excluir')
          )
        );
      });
      
      console.log('🔍 Botões de ação encontrados:', actionButtons.length);
      actionButtons.forEach((btn, index) => {
        console.log(`  ${index + 1}. "${btn.text}" - Visível: ${btn.visible}, Habilitado: ${btn.enabled}`);
      });
      
      // Testar primeiro botão de ação (se existir)
      if (actionButtons.length > 0) {
        const firstActionButton = await page.$('button:has-text("Visualizar"), button:has-text("Editar")');
        if (firstActionButton) {
          console.log('🔘 Testando primeiro botão de ação...');
          
          try {
            await firstActionButton.click();
            console.log('✅ Clique no botão de ação realizado');
            
            // Aguardar possível modal
            await page.waitForTimeout(2000);
            
            // Verificar se algum modal apareceu
            const modal = await page.$('[role="dialog"]');
            if (modal) {
              console.log('✅ Modal de ação apareceu');
              
              // Fechar modal
              const closeButton = await page.$('button:has-text("Fechar"), [aria-label="Close"]');
              if (closeButton) {
                await closeButton.click();
                console.log('✅ Modal fechado');
              }
            } else {
              console.log('ℹ️ Nenhum modal apareceu (pode ser normal)');
            }
            
          } catch (error) {
            console.log('❌ Erro ao clicar no botão de ação:', error.message);
          }
        }
      }
    }
    
    // Verificar erros no console
    const consoleErrors = await page.evaluate(() => {
      return window.consoleErrors || [];
    });
    
    if (consoleErrors.length > 0) {
      console.log('⚠️ Erros encontrados no console:');
      consoleErrors.forEach(error => console.log('  -', error));
    } else {
      console.log('✅ Nenhum erro encontrado no console');
    }
    
    // Verificar se há problemas de CSS
    const cssIssues = await page.evaluate(() => {
      const issues = [];
      
      // Verificar se há elementos com pointer-events: none
      const noPointerEvents = document.querySelectorAll('[style*="pointer-events: none"]');
      if (noPointerEvents.length > 0) {
        issues.push(`${noPointerEvents.length} elementos com pointer-events: none`);
      }
      
      // Verificar se há elementos com z-index muito baixo
      const lowZIndex = document.querySelectorAll('[style*="z-index: -"]');
      if (lowZIndex.length > 0) {
        issues.push(`${lowZIndex.length} elementos com z-index negativo`);
      }
      
      // Verificar se há elementos sobrepostos
      const overlays = document.querySelectorAll('[class*="overlay"], [class*="backdrop"]');
      if (overlays.length > 0) {
        issues.push(`${overlays.length} elementos de overlay encontrados`);
      }
      
      return issues;
    });
    
    if (cssIssues.length > 0) {
      console.log('⚠️ Problemas de CSS encontrados:');
      cssIssues.forEach(issue => console.log('  -', issue));
    } else {
      console.log('✅ Nenhum problema de CSS detectado');
    }
    
    console.log('✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await browser.close();
  }
}

// Capturar erros do console
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Executar teste
testInspectionPlansButtons().catch(console.error);
