# Módulo de Inspeções - ControlFlow

## Visão Geral

O módulo de inspeções do ControlFlow é um sistema completo de controle de qualidade que implementa as normas NBR 5426 para inspeção por amostragem. O sistema oferece um fluxo completo desde a identificação do produto até a aprovação final, com controle AQL em tempo real.

## Funcionalidades Principais

### 1. Identificação Inicial do Produto e Lote

- **Leitura de Código EAN**: Sistema de busca automática por código EAN
- **Dados Fixos**: Exibição automática de nome, código, EAN, família e BU
- **Data/Hora Automática**: Timestamp automático não editável
- **Seleção de Tipo**: Bonificação, container, rotina, especial, reclamação
- **Inspetor Automático**: Nome puxado do usuário logado
- **Captura de Fotos**: Documentação do produto/embalagem

### 2. Configuração da Amostragem (NBR 5426)

- **Cálculo Automático**: Tamanho da amostra baseado na quantidade da NF
- **Níveis de Inspeção**: I (menos rigoroso), II (padrão), III (mais rigoroso)
- **Tabela AQL Dinâmica**: 
  - Defeitos Críticos (não permitidos)
  - Defeitos Maiores (AQL 2,5%)
  - Defeitos Menores (AQL 4,0%)
- **Pontos de Aceitação/Rejeição**: Atualização automática conforme NBR 5426
- **Amostragem Diferenciada**: 30% para não funcionais, 100% para funcionais

### 3. Execução da Inspeção

- **Etapas Sequenciais**: Execução conforme plano vinculado
- **Controle AQL em Tempo Real**: Monitoramento automático de limites
- **Registro de Defeitos**: Sistema de classificação (crítico, maior, menor)
- **Captura de Evidências**: Fotos e comentários por etapa
- **Visualização do Plano**: Tela dividida ou nova aba
- **Links para Documentos**: Integração com SharePoint

### 4. Revisão Hierárquica e Aprovação

- **Bloqueio Automático**: Quando limites AQL são ultrapassados
- **Revisão Superior**: Envio automático para aprovação condicional
- **Registro de Decisões**: Histórico completo de responsáveis e motivos
- **Múltiplas Decisões**: Aprovado, Aprovação Condicional, Reprovado

## Componentes Desenvolvidos

### 1. InspectionWizard
**Arquivo**: `client/src/components/inspection/InspectionWizard.tsx`

Componente principal que gerencia o fluxo completo da inspeção em 4 etapas:
- Identificação do Produto
- Configuração da Amostragem
- Execução da Inspeção
- Revisão e Aprovação

### 2. ProductIdentification
**Arquivo**: `client/src/components/inspection/steps/ProductIdentification.tsx`

Primeira etapa do wizard:
- Interface para leitura de código EAN
- Exibição dos dados do produto
- Configuração inicial da inspeção
- Captura de foto do produto

### 3. SamplingSetup
**Arquivo**: `client/src/components/inspection/steps/SamplingSetup.tsx`

Segunda etapa com configuração AQL:
- Cálculo automático do tamanho da amostra
- Seleção do nível de inspeção
- Tabela AQL dinâmica com pontos de aceitação/rejeição
- Configuração de amostragem diferenciada

### 4. InspectionExecution
**Arquivo**: `client/src/components/inspection/steps/InspectionExecution.tsx`

Terceira etapa com execução da inspeção:
- Interface por etapas sequenciais
- Controle AQL em tempo real
- Registro de defeitos
- Captura de fotos
- Visualização do plano de inspeção

### 5. ReviewApproval
**Arquivo**: `client/src/components/inspection/steps/ReviewApproval.tsx`

Quarta etapa com revisão final:
- Status da inspeção baseado em AQL
- Resumo de defeitos
- Decisão final
- Histórico de decisões

### 6. InspectionPlanManager
**Arquivo**: `client/src/components/inspection/InspectionPlanManager.tsx`

Gerenciador de planos de inspeção:
- Criação de planos personalizados
- Configuração de etapas e itens
- Definição de etiquetas obrigatórias
- Links para documentos SharePoint
- Reordenação de etapas

### 7. TechnicalRecipeManager
**Arquivo**: `client/src/components/inspection/TechnicalRecipeManager.tsx`

Gerenciador de receitas técnicas:
- Configuração de parâmetros técnicos
- Definição de faixas aceitáveis
- Condições de teste
- Classificação de defeitos
- Validação automática de parâmetros

## Estrutura de Dados

### Inspeção
```typescript
interface Inspection {
  // Identificação
  product: Product;
  lotNumber: string;
  inspectionType: string;
  inspector: User;
  productPhoto: string;
  
  // Amostragem
  lotSize: number;
  inspectionLevel: 'I' | 'II' | 'III';
  sampleSize: number;
  aqlTable: {
    critical: { aql: number, acceptance: number, rejection: number };
    major: { aql: number, acceptance: number, rejection: number };
    minor: { aql: number, acceptance: number, rejection: number };
  };
  
  // Execução
  inspectionPlan: InspectionPlan;
  results: Record<string, any>;
  defects: Defect[];
  photos: Photo[];
  
  // Revisão
  status: 'draft' | 'pending' | 'approved' | 'conditionally_approved' | 'rejected';
  observations: string;
  finalDecision: string;
}
```

### Plano de Inspeção
```typescript
interface InspectionPlan {
  id: string;
  version: string;
  productId: string;
  steps: InspectionStep[];
  labels: Label[];
  documents: Document[];
}

interface InspectionStep {
  id: string;
  name: string;
  type: 'functional' | 'non-functional';
  description: string;
  order: number;
  samplePercentage: number;
  items: InspectionItem[];
}
```

### Receita Técnica
```typescript
interface TechnicalRecipe {
  id: string;
  version: string;
  productId: string;
  name: string;
  description: string;
  parameters: TechnicalParameter[];
  testConditions: TestConditions;
  defectClassification: DefectClassification;
}

interface TechnicalParameter {
  id: string;
  name: string;
  unit: string;
  min: number;
  max: number;
  target: number;
  tolerance: number;
  critical: boolean;
  description: string;
}
```

## Fluxo de Trabalho

### 1. Preparação
1. **Criar Plano de Inspeção**: Definir etapas, itens e documentos
2. **Configurar Receita Técnica**: Definir parâmetros e faixas aceitáveis
3. **Vincular ao Produto**: Associar plano e receita ao produto

### 2. Execução da Inspeção
1. **Identificar Produto**: Escanear código EAN
2. **Configurar Amostragem**: Definir lote e nível de inspeção
3. **Executar Etapas**: Seguir plano sequencialmente
4. **Registrar Defeitos**: Classificar conforme AQL
5. **Capturar Evidências**: Fotos e comentários

### 3. Revisão e Aprovação
1. **Análise AQL**: Verificar limites automaticamente
2. **Decisão Final**: Aprovar, aprovação condicional ou reprovar
3. **Revisão Hierárquica**: Se necessário
4. **Gerar Relatório**: Documentação completa

## Integração com NBR 5426

O sistema implementa completamente a norma NBR 5426:

### Tabelas de Amostragem
- **Códigos de Tamanho**: A, B, C, D, E, F, G, H, J, K, L, M, N, P, Q, R, S
- **Tamanhos de Amostra**: 2, 3, 5, 8, 13, 20, 32, 50, 80, 125, 200, 315, 500, 800, 1250, 2000, 3150
- **Níveis de Inspeção**: I, II, III com rigor crescente

### AQL (Acceptable Quality Level)
- **Defeitos Críticos**: 0% (não permitidos)
- **Defeitos Maiores**: 2,5% (padrão)
- **Defeitos Menores**: 4,0% (padrão)

### Amostragem Diferenciada
- **Etapas Não Funcionais**: 30% da amostra (materiais gráficos, medições, revisões, etiquetas, integridade, acessórios)
- **Etapas Funcionais**: 100% da amostra (parâmetros elétricos)

## Recursos Técnicos

### Responsividade
- Interface adaptável para desktop, tablet e mobile
- Componentes otimizados para diferentes tamanhos de tela

### Performance
- Cálculos AQL em tempo real
- Validação automática de parâmetros
- Carregamento otimizado de imagens

### Segurança
- Controle de usuários e permissões
- Validação de dados em todas as etapas
- Auditoria completa de ações

### Integração
- API REST para comunicação com backend
- Integração com SharePoint para documentos
- Sistema de notificações em tempo real

## Como Usar

### 1. Iniciar Nova Inspeção
1. Acesse a página de Inspeções
2. Clique em "Nova Inspeção"
3. Siga o wizard de 4 etapas

### 2. Criar Plano de Inspeção
1. Acesse o gerenciador de planos
2. Configure etapas e itens
3. Defina etiquetas e documentos
4. Salve e vincule ao produto

### 3. Configurar Receita Técnica
1. Acesse o gerenciador de receitas
2. Defina parâmetros técnicos
3. Configure faixas aceitáveis
4. Salve e vincule ao produto

## Próximos Passos

### Funcionalidades Planejadas
- [ ] Integração com câmera para captura de fotos
- [ ] Scanner de código de barras/QR Code
- [ ] Relatórios em PDF
- [ ] Dashboard de indicadores
- [ ] Integração com SAP
- [ ] Sistema de notificações push
- [ ] Modo offline para inspeções

### Melhorias Técnicas
- [ ] Otimização de performance
- [ ] Cache de dados
- [ ] Sincronização offline
- [ ] Backup automático
- [ ] Logs detalhados

## Suporte

Para dúvidas ou problemas com o módulo de inspeções:

1. **Documentação**: Consulte este arquivo
2. **Código**: Analise os componentes desenvolvidos
3. **Issues**: Abra uma issue no repositório
4. **Contato**: Entre em contato com a equipe de desenvolvimento

---

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Desenvolvido por**: Equipe ControlFlow
