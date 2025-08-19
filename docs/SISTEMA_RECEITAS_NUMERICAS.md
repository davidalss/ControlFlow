# Sistema de Receitas Numéricas - Planos de Inspeção

## ✅ **Sistema Implementado**

### 🎯 **Como Funciona**

O sistema de receitas numéricas permite definir parâmetros de validação para perguntas do tipo **"Número"** durante a criação de planos de inspeção.

### 📋 **Características Principais**

#### **1. Aplicação Restrita**
- ✅ **Apenas para perguntas numéricas**: Funciona exclusivamente com tipo "Número"
- ✅ **Validação automática**: Durante a inspeção, valores fora do intervalo são automaticamente considerados defeitos
- ✅ **Classificação de defeitos**: Integrado com o sistema de classificação (MENOR/MAIOR/CRÍTICO)

#### **2. Parâmetros Configuráveis**
- ✅ **Valor Mínimo**: Limite inferior aceitável
- ✅ **Valor Máximo**: Limite superior aceitável
- ✅ **Valor Esperado**: Valor ideal (opcional)
- ✅ **Unidade**: Unidade de medida (V, A, mm, etc.)

### 🔧 **Exemplo Prático: Voltagem 127V**

#### **Configuração da Receita:**
```
Pergunta: "Voltagem (V)"
Tipo: Número
Classificação de Defeito: MAIOR

Receita Numérica:
- Valor Mínimo: 114 (10% abaixo de 127)
- Valor Máximo: 140 (10% acima de 127)
- Valor Esperado: 127
- Unidade: V
```

#### **Comportamento na Inspeção:**
1. **Inspetor mede**: 125V
   - ✅ **Resultado**: Dentro do intervalo (114-140V)
   - ✅ **Status**: APROVADO

2. **Inspetor mede**: 110V
   - ❌ **Resultado**: Abaixo do mínimo (114V)
   - ❌ **Status**: DEFEITO MAIOR
   - 📋 **Mensagem**: "Valor 110V está abaixo do mínimo permitido (114V)"

3. **Inspetor mede**: 145V
   - ❌ **Resultado**: Acima do máximo (140V)
   - ❌ **Status**: DEFEITO MAIOR
   - 📋 **Mensagem**: "Valor 145V está acima do máximo permitido (140V)"

### 🎨 **Interface do Usuário**

#### **Durante a Criação do Plano:**
1. **Selecionar tipo**: "Número"
2. **Configurar pergunta**: "Voltagem (V)"
3. **Definir classificação**: MAIOR/MENOR/CRÍTICO
4. **Ativar receita**: Checkbox "Adicionar Receita"
5. **Configurar parâmetros**:
   - Valor Mínimo: 114
   - Valor Máximo: 140
   - Valor Esperado: 127 (opcional)
   - Unidade: V

#### **Visualização na Lista:**
```
✅ Voltagem (V) [Número] [MAIOR] [📋 Receita]
   Intervalo: 114V - 140V (Esperado: 127V)
```

### 🔄 **Fluxo de Validação**

#### **Durante a Inspeção:**
1. **Sistema identifica**: Pergunta com receita numérica
2. **Inspetor insere**: Valor medido
3. **Sistema valida**: Valor contra min/max
4. **Resultado automático**:
   - ✅ **Dentro do intervalo**: Continua inspeção
   - ❌ **Fora do intervalo**: Marca como defeito do tipo configurado

### 📊 **Benefícios**

#### **Para o Inspetor:**
- ✅ **Validação automática**: Não precisa lembrar valores
- ✅ **Feedback imediato**: Mensagens claras sobre o problema
- ✅ **Consistência**: Mesmos critérios sempre

#### **Para a Qualidade:**
- ✅ **Padronização**: Critérios uniformes
- ✅ **Rastreabilidade**: Histórico de validações
- ✅ **Precisão**: Redução de erros humanos

### 🛠️ **Implementação Técnica**

#### **Estrutura de Dados:**
```typescript
interface InspectionField {
  questionConfig: {
    questionType: 'number';
    defectType: 'MAIOR' | 'MENOR' | 'CRÍTICO';
    numericConfig?: {
      minValue: number;
      maxValue: number;
      expectedValue?: number;
      unit?: string;
    };
  };
  recipe?: {
    numericRecipe: {
      minValue: number;
      maxValue: number;
      expectedValue?: number;
      unit?: string;
    };
  };
}
```

#### **Validação:**
```typescript
const validateNumericValue = (value: number, recipe: NumericRecipe) => {
  if (value < recipe.minValue) {
    return {
      isValid: false,
      defectType: recipe.defectType,
      message: `Valor ${value}${recipe.unit ? ` ${recipe.unit}` : ''} está abaixo do mínimo permitido (${recipe.minValue}${recipe.unit ? ` ${recipe.unit}` : ''})`
    };
  }
  
  if (value > recipe.maxValue) {
    return {
      isValid: false,
      defectType: recipe.defectType,
      message: `Valor ${value}${recipe.unit ? ` ${recipe.unit}` : ''} está acima do máximo permitido (${recipe.maxValue}${recipe.unit ? ` ${recipe.unit}` : ''})`
    };
  }
  
  return { isValid: true };
};
```

### 🎯 **Casos de Uso Comuns**

#### **1. Tensão Elétrica**
- **Pergunta**: "Tensão de Operação (V)"
- **Intervalo**: 110V - 127V
- **Classificação**: CRÍTICO

#### **2. Corrente Elétrica**
- **Pergunta**: "Corrente de Consumo (A)"
- **Intervalo**: 0.5A - 2.0A
- **Classificação**: MAIOR

#### **3. Dimensões**
- **Pergunta**: "Largura (mm)"
- **Intervalo**: 95mm - 105mm
- **Classificação**: MENOR

#### **4. Temperatura**
- **Pergunta**: "Temperatura de Operação (°C)"
- **Intervalo**: 20°C - 30°C
- **Classificação**: MAIOR

### 🔧 **Próximos Passos**

#### **Melhorias Planejadas:**
- ✅ **Tolerância percentual**: Calcular automaticamente min/max baseado no valor esperado
- ✅ **Histórico de medições**: Gráficos de tendência
- ✅ **Alertas preventivos**: Notificações quando valores se aproximam dos limites
- ✅ **Calibração de instrumentos**: Integração com certificados de calibração

---

## 📋 **Resumo**

O sistema de receitas numéricas é uma ferramenta poderosa que:
- ✅ **Automatiza validações** para perguntas numéricas
- ✅ **Reduz erros humanos** durante inspeções
- ✅ **Padroniza critérios** de qualidade
- ✅ **Melhora a rastreabilidade** dos resultados
- ✅ **Integra-se perfeitamente** com o sistema de classificação de defeitos

**Resultado**: Inspeções mais precisas, consistentes e eficientes! 🎯
