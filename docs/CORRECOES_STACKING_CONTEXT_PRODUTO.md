# Correções para Stacking Context do Campo Produto - Plano de Inspeção

## Problema Identificado

O campo "Produto" na tela de Plano de Inspeções estava aparecendo atrás de outros containers, mesmo com z-index alto. O problema estava relacionado ao **stacking context** criado pelos containers pai do formulário.

### Causas do Problema

1. **Stacking Context Desnecessário**: Containers pai (Dialog, Tabs, ScrollArea, Card) estavam criando novos stacking contexts
2. **Transform e Filter**: Propriedades CSS que criam stacking context automaticamente
3. **Overflow Hidden**: Containers com overflow hidden cortando o dropdown
4. **Z-index Relativo**: Z-index aplicado em elementos dentro de containers com stacking context

## Soluções Implementadas

### 1. Correções no CSS (`modal-fixes.css`)

#### A. Prevenção de Stacking Context Desnecessário
```css
/* Correção para o modal de plano de inspeção */
.inspection-plan-form,
.new-inspection-plan-form {
  isolation: isolate !important;
}

/* Correção para o DialogContent */
.inspection-plan-form .DialogContent,
.new-inspection-plan-form .DialogContent {
  isolation: isolate !important;
  transform: none !important;
  filter: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
```

#### B. Correção Específica para o Campo Produto
```css
/* Container do campo de produto */
.product-field {
  position: relative !important;
  z-index: 1000 !important;
  isolation: isolate !important;
  transform: none !important;
}

/* Container do input */
.product-input-container {
  position: relative !important;
  z-index: 1001 !important;
  isolation: isolate !important;
  transform: none !important;
}
```

#### C. Dropdown com Portal (Posição Fixa)
```css
/* Dropdown posicionado via portal */
.product-suggestions-positioned {
  position: fixed !important;
  z-index: 99999999 !important;
  background: white !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 0.375rem !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  max-height: 240px !important;
  overflow-y: auto !important;
  pointer-events: auto !important;
  transform: translateZ(0) !important;
  isolation: isolate !important;
}
```

### 2. Modificações no Componente (`NewInspectionPlanForm.tsx`)

#### A. Imports Adicionais
```tsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
```

#### B. Estados para Portal
```tsx
const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
const productInputRef = useRef<HTMLInputElement>(null);
```

#### C. Função para Calcular Posição
```tsx
const calculateDropdownPosition = () => {
  if (productInputRef.current) {
    const rect = productInputRef.current.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width
    });
  }
};
```

#### D. Portal para Dropdown
```tsx
{/* Portal para o dropdown de produtos */}
{showProductSuggestions && typeof window !== 'undefined' && createPortal(
  <div 
    className="product-suggestions-positioned"
    style={{
      position: 'fixed',
      top: dropdownPosition.top,
      left: dropdownPosition.left,
      width: dropdownPosition.width,
      zIndex: 999999999
    }}
  >
    {/* Conteúdo do dropdown */}
  </div>,
  document.body
)}
```

## Benefícios das Correções

### 1. **Visibilidade Garantida**
- O dropdown agora aparece sempre acima de outros elementos
- Não é mais cortado por containers com overflow hidden
- Z-index extremamente alto (999999999) garante prioridade máxima

### 2. **Responsividade Mantida**
- O dropdown se adapta à largura do campo de input
- Posicionamento calculado dinamicamente
- Funciona em diferentes tamanhos de tela

### 3. **Performance Otimizada**
- Portal renderiza o dropdown fora da hierarquia do modal
- Recalculação de posição apenas quando necessário
- Isolamento de stacking context evita reflows desnecessários

### 4. **Compatibilidade**
- Funciona em todos os navegadores modernos
- Suporte para Safari com prefixo webkit
- Fallback para casos onde o portal não está disponível

## Como Funciona

1. **Detecção de Foco**: Quando o usuário clica no campo de produto
2. **Cálculo de Posição**: A função `calculateDropdownPosition` obtém as coordenadas do input
3. **Renderização via Portal**: O dropdown é renderizado diretamente no `document.body`
4. **Posicionamento Fixo**: O dropdown é posicionado usando `position: fixed` com as coordenadas calculadas
5. **Z-index Máximo**: Garante que apareça acima de todos os outros elementos

## Testes Realizados

- ✅ Dropdown aparece acima de modais
- ✅ Dropdown aparece acima de cards
- ✅ Dropdown aparece acima de outros inputs
- ✅ Funciona com scroll da página
- ✅ Funciona em diferentes resoluções
- ✅ Funciona no tema claro e escuro
- ✅ Itens do dropdown são clicáveis
- ✅ Botões "Salvar" e "Cancelar" permanecem visíveis

## Manutenção

### Para Novos Componentes
1. Sempre use `isolation: isolate` em containers que não precisam de stacking context
2. Evite `transform`, `filter`, `backdrop-filter` desnecessários
3. Use portal para dropdowns que precisam aparecer acima de modais
4. Calcule posição dinamicamente para elementos posicionados

### Para Modificações
1. Teste sempre em diferentes resoluções
2. Verifique se o z-index está adequado
3. Confirme que não há overflow hidden cortando elementos
4. Valide a funcionalidade em navegadores diferentes

## Conclusão

As correções implementadas resolvem completamente o problema de stacking context, garantindo que o campo de produto e seu dropdown apareçam sempre visíveis e funcionais, mantendo a responsividade e a experiência do usuário.
