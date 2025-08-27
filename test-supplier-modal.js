// TESTE DO MODAL DE FORNECEDORES
// Execute este script no console do navegador

console.log('🧪 TESTE DO MODAL DE FORNECEDORES');

// ========================================
// 1. VERIFICAR SE ESTAMOS NA PÁGINA CORRETA
// ========================================

console.log('📍 Página atual:', window.location.pathname);

if (!window.location.pathname.includes('supplier')) {
  console.log('❌ Não estamos na página de fornecedores');
  console.log('💡 Navegue para /supplier-management primeiro');
  return;
}

// ========================================
// 2. VERIFICAR COMPONENTES DO DIALOG
// ========================================

// Verificar se o Dialog está disponível
if (typeof window !== 'undefined') {
  console.log('✅ Window disponível');
  
  // Verificar se há elementos de dialog na página
  const dialogElements = document.querySelectorAll('[role="dialog"], [class*="dialog"], [class*="modal"]');
  console.log('🔍 Elementos de dialog encontrados:', dialogElements.length);
  
  dialogElements.forEach((el, index) => {
    console.log(`  ${index + 1}. ${el.tagName} - ${el.className}`);
  });
}

// ========================================
// 3. VERIFICAR BOTÃO "NOVO FORNECEDOR"
// ========================================

const newSupplierButton = document.querySelector('button:contains("Novo Fornecedor"), button[title*="Novo"], button[title*="Criar"]');
console.log('🔘 Botão "Novo Fornecedor" encontrado:', !!newSupplierButton);

if (newSupplierButton) {
  console.log('✅ Botão encontrado:', newSupplierButton.textContent);
  console.log('📍 Posição do botão:', newSupplierButton.getBoundingClientRect());
} else {
  console.log('❌ Botão "Novo Fornecedor" não encontrado');
  
  // Listar todos os botões
  const allButtons = document.querySelectorAll('button');
  console.log('🔍 Todos os botões na página:', allButtons.length);
  allButtons.forEach((btn, index) => {
    if (btn.textContent.includes('Fornecedor') || btn.textContent.includes('Novo') || btn.textContent.includes('Criar')) {
      console.log(`  ${index + 1}. "${btn.textContent}" - ${btn.className}`);
    }
  });
}

// ========================================
// 4. VERIFICAR ESTADO DOS MODAIS
// ========================================

// Verificar se há modais abertos
const openModals = document.querySelectorAll('[role="dialog"][aria-hidden="false"], [class*="dialog"][style*="display: block"], [class*="modal"][style*="display: block"]');
console.log('🖼️ Modais abertos:', openModals.length);

// Verificar overlays
const overlays = document.querySelectorAll('[class*="overlay"], [class*="backdrop"], [class*="modal-backdrop"]');
console.log('🎭 Overlays encontrados:', overlays.length);

// ========================================
// 5. VERIFICAR CSS E ESTILOS
// ========================================

// Verificar se há estilos que podem estar causando tela branca
const body = document.body;
console.log('🎨 Estilos do body:');
console.log('  - Background:', getComputedStyle(body).backgroundColor);
console.log('  - Color:', getComputedStyle(body).color);
console.log('  - Position:', getComputedStyle(body).position);
console.log('  - Z-index:', getComputedStyle(body).zIndex);

// Verificar se há elementos com position: fixed que podem estar cobrindo tudo
const fixedElements = document.querySelectorAll('[style*="position: fixed"], [class*="fixed"]');
console.log('📌 Elementos com position fixed:', fixedElements.length);

fixedElements.forEach((el, index) => {
  const style = getComputedStyle(el);
  console.log(`  ${index + 1}. ${el.tagName} - top: ${style.top}, left: ${style.left}, z-index: ${style.zIndex}`);
});

// ========================================
// 6. FUNÇÕES DE DEBUG
// ========================================

// Função para simular clique no botão
window.testSupplierModal = function() {
  const button = document.querySelector('button:contains("Novo Fornecedor"), button[title*="Novo"], button[title*="Criar"]');
  if (button) {
    console.log('🖱️ Simulando clique no botão...');
    button.click();
    
    // Aguardar um pouco e verificar se o modal abriu
    setTimeout(() => {
      const openModals = document.querySelectorAll('[role="dialog"][aria-hidden="false"]');
      console.log('📊 Modal aberto após clique:', openModals.length);
      
      if (openModals.length > 0) {
        console.log('✅ Modal aberto com sucesso!');
      } else {
        console.log('❌ Modal não abriu');
      }
    }, 500);
  } else {
    console.log('❌ Botão não encontrado');
  }
};

// Função para verificar erros no console
window.checkConsoleErrors = function() {
  console.log('🔍 Verificando erros no console...');
  
  // Verificar se há elementos com erro
  const errorElements = document.querySelectorAll('[class*="error"], [style*="error"]');
  console.log('❌ Elementos com erro:', errorElements.length);
  
  // Verificar se há elementos invisíveis
  const invisibleElements = document.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"]');
  console.log('👻 Elementos invisíveis:', invisibleElements.length);
};

// Função para limpar possíveis overlays
window.clearOverlays = function() {
  console.log('🧹 Tentando limpar overlays...');
  
  const overlays = document.querySelectorAll('[class*="overlay"], [class*="backdrop"]');
  overlays.forEach(overlay => {
    overlay.style.display = 'none';
    console.log('🗑️ Overlay removido:', overlay.className);
  });
  
  // Forçar re-render
  document.body.style.display = 'none';
  document.body.offsetHeight; // Trigger reflow
  document.body.style.display = '';
};

console.log('\n🛠️ FUNÇÕES DE DEBUG DISPONÍVEIS:');
console.log('- testSupplierModal(): Testar abertura do modal');
console.log('- checkConsoleErrors(): Verificar erros');
console.log('- clearOverlays(): Limpar overlays');

console.log('\n✅ TESTE CONCLUÍDO!');
