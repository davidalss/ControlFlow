// TESTE SIMPLES DO SISTEMA DE HISTÓRICO
// Execute este script no console do navegador

console.log('🧪 TESTE SIMPLES DO SISTEMA DE HISTÓRICO');

// ========================================
// 1. VERIFICAR SE O SERVIÇO ESTÁ DISPONÍVEL
// ========================================

// Verificar se o serviço está no window
if (typeof window.productHistoryService !== 'undefined') {
  console.log('✅ Serviço de histórico encontrado no window');
} else {
  console.log('❌ Serviço de histórico não encontrado no window');
}

// Verificar se o serviço está disponível via import
try {
  // Tentar acessar o serviço
  if (window.productHistoryService) {
    console.log('✅ Serviço acessível:', window.productHistoryService);
    
    // Testar método getProductHistory
    const testHistory = window.productHistoryService.getProductHistory('test-id');
    console.log('✅ Método getProductHistory funcionando:', testHistory);
    
    // Testar método getAllHistory
    const allHistory = window.productHistoryService.getAllHistory();
    console.log('✅ Método getAllHistory funcionando:', allHistory);
    
  } else {
    console.log('❌ Serviço não está disponível');
  }
} catch (error) {
  console.log('❌ Erro ao acessar serviço:', error);
}

// ========================================
// 2. VERIFICAR LOCALSTORAGE
// ========================================

try {
  const historyData = localStorage.getItem('product_history');
  if (historyData) {
    const history = JSON.parse(historyData);
    console.log('📊 Dados no localStorage:', {
      total: history.length,
      actions: history.map(h => h.action),
      products: [...new Set(history.map(h => h.productCode))]
    });
  } else {
    console.log('📭 Nenhum dado de histórico no localStorage');
  }
} catch (error) {
  console.log('❌ Erro ao verificar localStorage:', error);
}

// ========================================
// 3. VERIFICAR BOTÕES DE HISTÓRICO
// ========================================

const historyButtons = document.querySelectorAll('button[title*="histórico"], button[title*="history"]');
console.log('🔘 Botões de histórico encontrados:', historyButtons.length);

if (historyButtons.length > 0) {
  console.log('✅ Botões de histórico estão presentes');
  historyButtons.forEach((btn, index) => {
    console.log(`  ${index + 1}. ${btn.title || btn.textContent}`);
  });
} else {
  console.log('❌ Nenhum botão de histórico encontrado');
}

// ========================================
// 4. VERIFICAR MODAL
// ========================================

const modal = document.querySelector('[class*="modal"], [class*="dialog"]');
if (modal) {
  console.log('✅ Modal encontrado:', modal);
} else {
  console.log('📭 Nenhum modal encontrado (normal se não estiver aberto)');
}

// ========================================
// 5. TESTAR CRIAÇÃO DE HISTÓRICO
// ========================================

if (window.productHistoryService) {
  try {
    const testProduct = {
      id: 'test-' + Date.now(),
      code: 'TEST' + Date.now(),
      description: 'Produto de teste',
      category: 'Teste',
      created_at: new Date().toISOString()
    };
    
    const entry = window.productHistoryService.recordProductCreated(
      testProduct,
      'test-user',
      'Usuário Teste'
    );
    
    console.log('✅ Histórico criado com sucesso:', entry);
    
    // Verificar se foi salvo no localStorage
    const updatedHistory = localStorage.getItem('product_history');
    if (updatedHistory) {
      const parsed = JSON.parse(updatedHistory);
      console.log('✅ Histórico salvo no localStorage:', parsed.length, 'registros');
    }
    
  } catch (error) {
    console.log('❌ Erro ao criar histórico:', error);
  }
}

// ========================================
// 6. FUNÇÕES DE DEBUG
// ========================================

// Função para mostrar histórico
window.showHistory = function() {
  if (window.productHistoryService) {
    const history = window.productHistoryService.getAllHistory();
    console.table(history.map(h => ({
      produto: h.productCode,
      acao: h.action,
      usuario: h.userName,
      data: new Date(h.timestamp).toLocaleString(),
      descricao: h.description
    })));
  } else {
    console.log('❌ Serviço não disponível');
  }
};

// Função para limpar histórico
window.clearHistory = function() {
  if (window.productHistoryService) {
    window.productHistoryService.clearAllHistory();
    console.log('🗑️ Histórico limpo');
  } else {
    localStorage.removeItem('product_history');
    console.log('🗑️ Histórico limpo do localStorage');
  }
};

// Função para testar modal
window.testModal = function() {
  const buttons = document.querySelectorAll('button[title*="histórico"], button[title*="history"]');
  if (buttons.length > 0) {
    buttons[0].click();
    console.log('🖱️ Clique simulado no botão de histórico');
  } else {
    console.log('❌ Nenhum botão de histórico encontrado');
  }
};

console.log('\n🛠️ FUNÇÕES DE DEBUG DISPONÍVEIS:');
console.log('- showHistory(): Mostrar histórico');
console.log('- clearHistory(): Limpar histórico');
console.log('- testModal(): Testar modal');

console.log('\n✅ TESTE CONCLUÍDO!');
