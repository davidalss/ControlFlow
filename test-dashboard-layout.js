// Script de teste para verificar se header e sidebar aparecem no dashboard
console.log('🧪 Testando layout do dashboard...');

// Verificar se o CSS está sendo aplicado
const checkCSS = () => {
  const dashboardLayout = document.querySelector('.dashboard-layout');
  const sidebar = document.querySelector('.sidebar-responsive');
  const header = document.querySelector('.header-responsive');
  
  console.log('📋 Elementos encontrados:', {
    dashboardLayout: !!dashboardLayout,
    sidebar: !!sidebar,
    header: !!header
  });
  
  if (dashboardLayout) {
    const styles = window.getComputedStyle(dashboardLayout);
    console.log('🎨 CSS do dashboard-layout:', {
      display: styles.display,
      visibility: styles.visibility,
      opacity: styles.opacity
    });
  }
  
  if (sidebar) {
    const styles = window.getComputedStyle(sidebar);
    console.log('🎨 CSS da sidebar:', {
      display: styles.display,
      visibility: styles.visibility,
      opacity: styles.opacity,
      width: styles.width
    });
  }
  
  if (header) {
    const styles = window.getComputedStyle(header);
    console.log('🎨 CSS do header:', {
      display: styles.display,
      visibility: styles.visibility,
      opacity: styles.opacity
    });
  }
};

// Verificar se há elementos escondidos por CSS
const checkHiddenElements = () => {
  const hiddenElements = document.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"], [style*="opacity: 0"]');
  console.log('🚫 Elementos escondidos encontrados:', hiddenElements.length);
  
  hiddenElements.forEach((el, index) => {
    console.log(`  ${index + 1}. ${el.tagName} - ${el.className}`);
  });
};

// Verificar estrutura do DOM
const checkDOMStructure = () => {
  const layout = document.querySelector('.dashboard-layout');
  if (layout) {
    console.log('🏗️ Estrutura do DOM:');
    console.log('  - Container principal:', layout.tagName);
    console.log('  - Filhos diretos:', layout.children.length);
    
    Array.from(layout.children).forEach((child, index) => {
      console.log(`    ${index + 1}. ${child.tagName} - ${child.className}`);
    });
  }
};

// Executar verificações
setTimeout(() => {
  console.log('🔍 Iniciando verificações...');
  checkCSS();
  checkHiddenElements();
  checkDOMStructure();
  console.log('✅ Verificações concluídas');
}, 1000);
