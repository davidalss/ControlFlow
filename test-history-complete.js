// TESTE COMPLETO DO SISTEMA DE HISTÓRICO
// Execute este script no console do navegador após ir para a página de produtos

console.log('🧪 TESTE COMPLETO DO SISTEMA DE HISTÓRICO');

// ========================================
// 1. VERIFICAR SERVIÇO DE HISTÓRICO
// ========================================

// Verificar se o serviço está disponível
if (typeof window.productHistoryService !== 'undefined') {
  console.log('✅ Serviço de histórico disponível');
  
  // Testar criação de histórico
  const testProduct = {
    id: 'test-' + Date.now(),
    code: 'TEST' + Date.now(),
    description: 'Produto de teste',
    category: 'Teste',
    created_at: new Date().toISOString()
  };
  
  try {
    const entry = window.productHistoryService.recordProductCreated(
      testProduct,
      'test-user',
      'Usuário Teste'
    );
    console.log('✅ Histórico criado:', entry);
  } catch (error) {
    console.log('❌ Erro ao criar histórico:', error);
  }
} else {
  console.log('❌ Serviço de histórico não encontrado');
}

// ========================================
// 2. VERIFICAR LOCALSTORAGE
// ========================================

const historyData = localStorage.getItem('product_history');
if (historyData) {
  const history = JSON.parse(historyData);
  console.log('📊 Histórico no localStorage:', {
    total: history.length,
    actions: history.map(h => h.action),
    products: [...new Set(history.map(h => h.productCode))]
  });
} else {
  console.log('📭 Nenhum histórico no localStorage');
}

// ========================================
// 3. VERIFICAR BOTÕES DE HISTÓRICO
// ========================================

const historyButtons = document.querySelectorAll('button[title*="histórico"], button[title*="history"]');
console.log('🔘 Botões de histórico encontrados:', historyButtons.length);

if (historyButtons.length > 0) {
  console.log('✅ Botões de histórico estão presentes');
  
  // Simular clique no primeiro botão
  console.log('🖱️ Simulando clique no primeiro botão de histórico...');
  historyButtons[0].click();
  
  // Aguardar modal abrir
  setTimeout(() => {
    const modal = document.querySelector('[class*="modal"], [class*="dialog"]');
    if (modal) {
      console.log('✅ Modal de histórico aberto');
    } else {
      console.log('❌ Modal não encontrado após clique');
    }
  }, 1000);
} else {
  console.log('❌ Nenhum botão de histórico encontrado');
}

// ========================================
// 4. VERIFICAR COMPONENTES REACT
// ========================================

// Verificar se há componentes de produto
const productRows = document.querySelectorAll('tr, [class*="product"], [data-testid*="product"]');
console.log('📦 Linhas/componentes de produto encontrados:', productRows.length);

// ========================================
// 5. TESTAR CRIAÇÃO DE PRODUTO
// ========================================

console.log('📝 Para testar criação de produto:');
console.log('1. Clique no botão "Novo Produto"');
console.log('2. Preencha os campos');
console.log('3. Salve o produto');
console.log('4. Verifique se o histórico foi registrado');

// ========================================
// 6. FUNÇÕES DE DEBUG
// ========================================

// Função para mostrar histórico detalhado
window.showDetailedHistory = function() {
  const history = localStorage.getItem('product_history');
  if (history) {
    const data = JSON.parse(history);
    console.table(data.map(h => ({
      produto: h.productCode,
      acao: h.action,
      usuario: h.userName,
      data: new Date(h.timestamp).toLocaleString(),
      descricao: h.description
    })));
  } else {
    console.log('📭 Nenhum histórico encontrado');
  }
};

// Função para testar modal
window.testHistoryModal = function() {
  const buttons = document.querySelectorAll('button[title*="histórico"], button[title*="history"]');
  if (buttons.length > 0) {
    buttons[0].click();
    console.log('🖱️ Clique simulado no botão de histórico');
  } else {
    console.log('❌ Nenhum botão de histórico encontrado');
  }
};

// Função para limpar histórico
window.clearHistory = function() {
  localStorage.removeItem('product_history');
  console.log('🗑️ Histórico limpo');
};

// ========================================
// 7. INSTRUÇÕES FINAIS
// ========================================

console.log('\n📋 INSTRUÇÕES PARA TESTE MANUAL:');
console.log('1. Vá para a página de produtos');
console.log('2. Clique no ícone de histórico (📜) em qualquer produto');
console.log('3. Verifique se o modal abre com dados');
console.log('4. Teste os filtros e busca no modal');
console.log('5. Crie, edite ou exclua um produto');
console.log('6. Verifique se o histórico é registrado');

console.log('\n🛠️ FUNÇÕES DE DEBUG:');
console.log('- showDetailedHistory(): Mostrar histórico detalhado');
console.log('- testHistoryModal(): Testar modal de histórico');
console.log('- clearHistory(): Limpar histórico');

console.log('\n✅ TESTE INICIADO!');
