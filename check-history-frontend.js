// VERIFICAR SISTEMA DE HISTÓRICO NO FRONTEND
// Execute este script no console do navegador

console.log('🔍 VERIFICANDO SISTEMA DE HISTÓRICO DE PRODUTOS');

// ========================================
// 1. VERIFICAR SE O SERVIÇO ESTÁ CARREGADO
// ========================================

try {
  // Verificar se o serviço está disponível
  if (typeof window.productHistoryService !== 'undefined') {
    console.log('✅ Serviço de histórico carregado:', window.productHistoryService);
  } else {
    console.log('❌ Serviço de histórico não encontrado no window');
  }
} catch (error) {
  console.log('❌ Erro ao verificar serviço:', error);
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
// 3. VERIFICAR COMPONENTES REACT
// ========================================

// Função para verificar se o modal está montado
function checkHistoryModal() {
  const modal = document.querySelector('[data-testid="product-history-modal"]') || 
                document.querySelector('.product-history-modal') ||
                document.querySelector('[class*="history"]');
  
  if (modal) {
    console.log('✅ Modal de histórico encontrado:', modal);
    return true;
  } else {
    console.log('❌ Modal de histórico não encontrado');
    return false;
  }
}

// Função para verificar botões de histórico
function checkHistoryButtons() {
  const buttons = document.querySelectorAll('button[title*="histórico"], button[title*="history"]');
  console.log('🔘 Botões de histórico encontrados:', buttons.length);
  
  buttons.forEach((btn, index) => {
    console.log(`  ${index + 1}. ${btn.title || btn.textContent}`);
  });
  
  return buttons.length > 0;
}

// ========================================
// 4. VERIFICAR HOOKS DO REACT
// ========================================

// Função para verificar se os hooks estão funcionando
function checkReactHooks() {
  // Verificar se o React DevTools está disponível
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools disponível');
  } else {
    console.log('⚠️ React DevTools não disponível');
  }
  
  // Verificar se há componentes de produtos montados
  const productComponents = document.querySelectorAll('[class*="product"], [data-testid*="product"]');
  console.log('📦 Componentes de produto encontrados:', productComponents.length);
}

// ========================================
// 5. TESTAR FUNCIONALIDADE
// ========================================

// Função para simular criação de histórico
function testHistoryCreation() {
  console.log('🧪 Testando criação de histórico...');
  
  try {
    // Simular dados de produto
    const testProduct = {
      id: 'test-id-' + Date.now(),
      code: 'TEST' + Date.now(),
      description: 'Produto de teste',
      category: 'Teste',
      created_at: new Date().toISOString()
    };
    
    // Tentar acessar o serviço via window
    if (window.productHistoryService) {
      const entry = window.productHistoryService.recordProductCreated(
        testProduct,
        'test-user-id',
        'Usuário Teste'
      );
      console.log('✅ Histórico criado:', entry);
    } else {
      console.log('❌ Serviço não disponível para teste');
    }
  } catch (error) {
    console.log('❌ Erro ao testar criação:', error);
  }
}

// ========================================
// 6. VERIFICAR INTEGRAÇÃO COM SUPABASE
// ========================================

// Função para verificar se há erros de API
function checkAPIErrors() {
  const errors = [];
  
  // Verificar console por erros relacionados a histórico
  const originalError = console.error;
  console.error = function(...args) {
    if (args.some(arg => String(arg).includes('history') || String(arg).includes('histórico'))) {
      errors.push(args);
    }
    originalError.apply(console, args);
  };
  
  console.log('🔍 Monitorando erros de API...');
  
  // Restaurar console.error após 5 segundos
  setTimeout(() => {
    console.error = originalError;
    if (errors.length > 0) {
      console.log('❌ Erros encontrados:', errors);
    } else {
      console.log('✅ Nenhum erro de API detectado');
    }
  }, 5000);
}

// ========================================
// 7. EXECUTAR VERIFICAÇÕES
// ========================================

console.log('\n🚀 INICIANDO VERIFICAÇÕES...\n');

// Verificar componentes
checkHistoryModal();
checkHistoryButtons();
checkReactHooks();

// Verificar API
checkAPIErrors();

// Testar funcionalidade
setTimeout(() => {
  testHistoryCreation();
}, 1000);

// ========================================
// 8. INSTRUÇÕES PARA TESTE MANUAL
// ========================================

console.log('\n📋 INSTRUÇÕES PARA TESTE MANUAL:');
console.log('1. Vá para a página de produtos');
console.log('2. Clique no ícone de histórico (📜) em qualquer produto');
console.log('3. Verifique se o modal abre com dados');
console.log('4. Teste os filtros e busca no modal');
console.log('5. Crie, edite ou exclua um produto');
console.log('6. Verifique se o histórico é registrado');

// ========================================
// 9. FUNÇÕES ÚTEIS PARA DEBUG
// ========================================

// Função para limpar histórico local
window.clearProductHistory = function() {
  localStorage.removeItem('product_history');
  console.log('🗑️ Histórico local limpo');
};

// Função para mostrar histórico local
window.showProductHistory = function() {
  const history = localStorage.getItem('product_history');
  if (history) {
    console.log('📊 Histórico local:', JSON.parse(history));
  } else {
    console.log('📭 Nenhum histórico local');
  }
};

// Função para forçar atualização
window.refreshProductHistory = function() {
  if (window.productHistoryService) {
    window.productHistoryService.loadFromLocalStorage();
    console.log('🔄 Histórico recarregado');
  }
};

console.log('\n🛠️ FUNÇÕES DE DEBUG DISPONÍVEIS:');
console.log('- clearProductHistory(): Limpar histórico local');
console.log('- showProductHistory(): Mostrar histórico local');
console.log('- refreshProductHistory(): Recarregar histórico');

console.log('\n✅ VERIFICAÇÃO CONCLUÍDA!');
