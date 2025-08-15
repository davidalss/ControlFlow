// Base de Conhecimento do Guru Severino
// Gestão da Qualidade, Lean, Six Sigma, ISO 9001 e Dados do App

export interface KnowledgeItem {
  category: string;
  topic: string;
  content: string;
  keywords: string[];
  examples?: string[];
  formulas?: string[];
  standards?: string[];
}

export const SEVERINO_KNOWLEDGE: KnowledgeItem[] = [
  // ===== GESTÃO DA QUALIDADE =====
  {
    category: "Gestão da Qualidade",
    topic: "Conceitos Fundamentais",
    content: `A gestão da qualidade é um sistema abrangente que visa garantir que produtos e serviços atendam ou superem as expectativas dos clientes.

**Princípios Fundamentais:**
• Foco no Cliente
• Liderança
• Envolvimento das Pessoas
• Abordagem por Processos
• Melhoria Contínua
• Tomada de Decisão Baseada em Evidências
• Gestão de Relacionamentos

**Ciclo PDCA (Plan-Do-Check-Act):**
1. **Plan (Planejar)**: Estabelecer objetivos e processos
2. **Do (Fazer)**: Implementar os processos
3. **Check (Verificar)**: Monitorar e medir resultados
4. **Act (Agir)**: Tomar ações para melhorias`,
    keywords: ["qualidade", "gestão", "pdca", "princípios", "cliente", "processos", "melhoria"],
    examples: [
      "Implementação de controle de qualidade em linha de produção",
      "Desenvolvimento de procedimentos operacionais padrão",
      "Análise de dados de inspeção para identificar tendências"
    ]
  },

  {
    category: "Gestão da Qualidade",
    topic: "Controle Estatístico de Processo (CEP)",
    content: `O CEP é uma metodologia para monitorar e controlar processos através de técnicas estatísticas.

**Ferramentas Principais:**
• **Gráficos de Controle**: Monitoram variações do processo
• **Capabilidade do Processo**: Cp, Cpk, Pp, Ppk
• **Análise de Tendências**: Identificação de padrões
• **Cartas de Controle**: X-R, X-S, p, np, c, u

**Limites de Controle:**
• LSC (Limite Superior de Controle) = Média + 3σ
• LM (Linha Média) = Média do processo
• LIC (Limite Inferior de Controle) = Média - 3σ

**Regras de Interpretação:**
1. Ponto fora dos limites
2. 7 pontos consecutivos acima ou abaixo da média
3. 7 pontos consecutivos em tendência crescente ou decrescente
4. Padrões cíclicos ou sistemáticos`,
    keywords: ["cep", "controle estatístico", "gráficos", "limites", "capabilidade", "tendências"],
    formulas: [
      "Cp = (LSE - LIE) / 6σ",
      "Cpk = min[(LSE - μ) / 3σ, (μ - LIE) / 3σ]",
      "LSC = μ + 3σ",
      "LIC = μ - 3σ"
    ]
  },

  // ===== LEAN MANUFACTURING =====
  {
    category: "Lean Manufacturing",
    topic: "Princípios do Lean",
    content: `O Lean Manufacturing é uma filosofia que visa eliminar desperdícios e maximizar valor para o cliente.

**Os 7 Desperdícios (Muda):**
1. **Sobreprodução**: Produzir mais que o necessário
2. **Inventário**: Estoque excessivo
3. **Transporte**: Movimentação desnecessária
4. **Movimento**: Movimentos desnecessários do operador
5. **Espera**: Tempo ocioso
6. **Processamento**: Processos desnecessários
7. **Defeitos**: Produtos com não-conformidades

**Ferramentas Lean:**
• **5S**: Seiri, Seiton, Seiso, Seiketsu, Shitsuke
• **Kaizen**: Melhoria contínua
• **Kanban**: Sistema de puxar produção
• **VSM (Value Stream Mapping)**: Mapeamento do fluxo de valor
• **JIT (Just in Time)**: Produção no momento certo`,
    keywords: ["lean", "desperdícios", "muda", "5s", "kaizen", "kanban", "vsm", "jit"],
    examples: [
      "Implementação de 5S em área de produção",
      "Mapeamento de fluxo de valor para redução de lead time",
      "Sistema Kanban para controle de estoque"
    ]
  },

  {
    category: "Lean Manufacturing",
    topic: "5S - Organização e Padronização",
    content: `O 5S é uma metodologia japonesa para organização e limpeza do ambiente de trabalho.

**Os 5S:**
1. **Seiri (Senso de Utilização)**: Separar o necessário do desnecessário
2. **Seiton (Senso de Organização)**: Organizar o que é necessário
3. **Seiso (Senso de Limpeza)**: Manter limpo o ambiente
4. **Seiketsu (Senso de Padronização)**: Padronizar as práticas
5. **Shitsuke (Senso de Disciplina)**: Manter a disciplina

**Benefícios:**
• Melhoria da produtividade
• Redução de acidentes
• Melhoria da qualidade
• Aumento da moral da equipe
• Redução de custos

**Implementação:**
• Formação de equipes multidisciplinares
• Treinamento da equipe
• Auditorias regulares
• Reconhecimento e premiação`,
    keywords: ["5s", "organização", "limpeza", "padronização", "disciplina", "produtividade"],
    examples: [
      "Implementação de 5S em almoxarifado",
      "Padronização de ferramentas em linha de produção",
      "Sistema de cores para identificação de áreas"
    ]
  },

  // ===== SIX SIGMA =====
  {
    category: "Six Sigma",
    topic: "Metodologia DMAIC",
    content: `O DMAIC é a metodologia principal do Six Sigma para melhoria de processos existentes.

**DMAIC:**
1. **Define (Definir)**: Definir o problema e objetivos
2. **Measure (Medir)**: Coletar dados e medir o processo atual
3. **Analyze (Analisar)**: Identificar causas raiz
4. **Improve (Melhorar)**: Implementar soluções
5. **Control (Controlar)**: Manter as melhorias

**Ferramentas por Fase:**

**Define:**
• Project Charter
• SIPOC (Supplier, Input, Process, Output, Customer)
• Voice of Customer (VOC)

**Measure:**
• MSA (Measurement System Analysis)
• Capabilidade do processo
• Coleta de dados

**Analyze:**
• Análise de causa raiz
• Diagrama de Ishikawa
• Análise de regressão
• Testes de hipóteses

**Improve:**
• DOE (Design of Experiments)
• Análise de custo-benefício
• Implementação piloto

**Control:**
• Gráficos de controle
• Procedimentos padronizados
• Treinamento da equipe`,
    keywords: ["six sigma", "dmaic", "definir", "medir", "analisar", "melhorar", "controlar"],
    examples: [
      "Projeto DMAIC para redução de defeitos em solda",
      "Análise de causa raiz para variação dimensional",
      "Implementação de controle estatístico em processo crítico"
    ]
  },

  {
    category: "Six Sigma",
    topic: "Níveis Sigma e Defeitos",
    content: `O nível Sigma indica a capacidade de um processo de produzir sem defeitos.

**Níveis Sigma e Defeitos por Milhão (DPMO):**
• 1 Sigma: 690.000 DPMO (69% de defeitos)
• 2 Sigma: 308.000 DPMO (30,8% de defeitos)
• 3 Sigma: 66.800 DPMO (6,68% de defeitos)
• 4 Sigma: 6.210 DPMO (0,621% de defeitos)
• 5 Sigma: 233 DPMO (0,0233% de defeitos)
• 6 Sigma: 3,4 DPMO (0,00034% de defeitos)

**Cálculo do Nível Sigma:**
1. Calcular DPMO = (Número de Defeitos × 1.000.000) / (Número de Oportunidades)
2. Converter DPMO para nível Sigma usando tabelas ou software

**Exemplo Prático:**
Se em 10.000 peças inspecionadas encontramos 50 defeitos:
DPMO = (50 × 1.000.000) / 10.000 = 5.000 DPMO
Nível Sigma ≈ 4,1 Sigma`,
    keywords: ["sigma", "dpmo", "defeitos", "capabilidade", "nível", "processo"],
    formulas: [
      "DPMO = (Número de Defeitos × 1.000.000) / (Número de Oportunidades)",
      "Yield = (1 - DPMO/1.000.000) × 100%"
    ]
  },

  // ===== ISO 9001 =====
  {
    category: "ISO 9001",
    topic: "Sistema de Gestão da Qualidade",
    content: `A ISO 9001 é a norma internacional para Sistemas de Gestão da Qualidade.

**Princípios da Qualidade (ISO 9000):**
1. Foco no Cliente
2. Liderança
3. Envolvimento das Pessoas
4. Abordagem por Processos
5. Melhoria
6. Tomada de Decisão Baseada em Evidências
7. Gestão de Relacionamentos

**Estrutura da ISO 9001:2015:**
• **Seção 4**: Contexto da Organização
• **Seção 5**: Liderança
• **Seção 6**: Planejamento
• **Seção 7**: Suporte
• **Seção 8**: Operação
• **Seção 9**: Avaliação de Performance
• **Seção 10**: Melhoria

**Documentação Obrigatória:**
• Política da Qualidade
• Objetivos da Qualidade
• Manual da Qualidade
• Procedimentos Documentados
• Registros da Qualidade`,
    keywords: ["iso 9001", "sistema", "gestão", "qualidade", "política", "objetivos", "procedimentos"],
    standards: ["ISO 9001:2015", "ISO 9000:2015", "ISO 9004:2018"]
  },

  {
    category: "ISO 9001",
    topic: "Controle de Documentos e Registros",
    content: `O controle de documentos e registros é fundamental para o SGQ.

**Controle de Documentos:**
• Identificação e descrição
• Formato e mídia
• Revisão e aprovação
• Distribuição e acesso
• Controle de versões
• Obsoletos e retenção

**Controle de Registros:**
• Identificação
• Armazenamento
• Proteção
• Recuperação
• Retenção
• Descarte

**Exemplos de Documentos:**
• Procedimentos Operacionais Padrão (POP)
• Instruções de Trabalho
• Formulários
• Planos de Qualidade
• Especificações

**Exemplos de Registros:**
• Relatórios de Inspeção
• Registros de Treinamento
• Registros de Calibração
• Registros de Auditoria
• Registros de Não-Conformidade`,
    keywords: ["documentos", "registros", "controle", "versão", "retenção", "descarte"],
    examples: [
      "Sistema de controle de versões para procedimentos",
      "Arquivo digital de registros de inspeção",
      "Procedimento para descarte de documentos obsoletos"
    ]
  },

  // ===== CONTROLE DE INSPEÇÕES =====
  {
    category: "Controle de Inspeções",
    topic: "AQL - Acceptable Quality Level",
    content: `AQL é o nível de qualidade aceitável para lotes de produtos.

**Conceitos Fundamentais:**
• **AQL**: Percentual máximo de defeitos aceitável
• **LQ (Limiting Quality)**: Percentual de defeitos rejeitável
• **NCA (Número de Conformidade de Aceitação)**: Máximo de defeitos para aceitar
• **NCR (Número de Conformidade de Rejeição)**: Mínimo de defeitos para rejeitar

**Tipos de Inspeção:**
• **Inspeção por Atributos**: Defeito presente/ausente
• **Inspeção por Variáveis**: Medição de características
• **Inspeção 100%**: Verificação de todas as peças
• **Inspeção por Amostragem**: Verificação de amostra

**Planos de Amostragem:**
• **Simples**: Uma amostra
• **Duplo**: Duas amostras
• **Múltiplo**: Múltiplas amostras
• **Sequencial**: Amostras sucessivas

**Tabelas AQL (ISO 2859-1):**
• Tamanhos de lote
• Níveis de inspeção (I, II, III)
• Códigos de tamanho de amostra
• Números de aceitação/rejeição`,
    keywords: ["aql", "amostragem", "aceitação", "rejeição", "defeitos", "lote", "inspeção"],
    formulas: [
      "AQL = (Número de Defeitos Aceitáveis / Tamanho da Amostra) × 100",
      "Risco do Produtor = Probabilidade de rejeitar lote bom",
      "Risco do Consumidor = Probabilidade de aceitar lote ruim"
    ]
  },

  {
    category: "Controle de Inspeções",
    topic: "Tipos de Defeitos e Classificação",
    content: `A classificação de defeitos é essencial para controle de qualidade.

**Classificação por Gravidade:**
• **Crítico (C)**: Defeito que pode causar falha total ou risco à segurança
• **Maior (M)**: Defeito que afeta significativamente a funcionalidade
• **Menor (m)**: Defeito que afeta a aparência ou funcionalidade menor

**Exemplos de Defeitos Críticos:**
• Falta de solda em componente estrutural
• Vazamento em sistema pressurizado
• Falta de isolamento elétrico

**Exemplos de Defeitos Maiores:**
• Dimensão fora de especificação
• Falta de acabamento superficial
• Montagem incorreta

**Exemplos de Defeitos Menores:**
• Arranhão superficial
• Mancha de óleo
• Etiqueta desalinhada

**Sistema de Pontuação:**
• Defeito Crítico = 100 pontos
• Defeito Maior = 10 pontos
• Defeito Menor = 1 ponto`,
    keywords: ["defeitos", "crítico", "maior", "menor", "classificação", "gravidade", "pontuação"],
    examples: [
      "Classificação de defeitos em peças automotivas",
      "Sistema de pontuação para avaliação de qualidade",
      "Critérios de aceitação por tipo de defeito"
    ]
  },

  // ===== DADOS DO APP =====
  {
    category: "Dados do App",
    topic: "Estrutura de Inspeções",
    content: `O sistema de inspeções do ControlFlow permite gerenciar todo o processo de controle de qualidade.

**Módulos Principais:**
• **Inspeções**: Criação e gestão de inspeções
• **Treinamentos**: Gestão de capacitação da equipe
• **Produtos**: Catálogo de produtos e especificações
• **Relatórios**: Análises e dashboards
• **Configurações**: Parâmetros do sistema

**Fluxo de Inspeção:**
1. **Criação**: Definir plano de inspeção
2. **Execução**: Realizar inspeção
3. **Registro**: Documentar resultados
4. **Análise**: Avaliar dados coletados
5. **Ação**: Implementar melhorias

**Tipos de Inspeção:**
• **Recebimento**: Materiais recebidos
• **Processo**: Durante a produção
• **Final**: Produto acabado
• **Especial**: Inspeções específicas

**Parâmetros Configuráveis:**
• AQL por tipo de produto
• Tamanhos de amostra
• Critérios de aceitação
• Fluxos de aprovação`,
    keywords: ["inspeções", "treinamentos", "produtos", "relatórios", "configurações", "fluxo"],
    examples: [
      "Criação de plano de inspeção AQL",
      "Execução de inspeção de recebimento",
      "Geração de relatório de qualidade"
    ]
  },

  {
    category: "Dados do App",
    topic: "Gestão de Treinamentos",
    content: `O módulo de treinamentos gerencia a capacitação da equipe de qualidade.

**Funcionalidades:**
• **Cadastro de Treinamentos**: Cursos e capacitações
• **Gestão de Participantes**: Equipe treinada
• **Certificações**: Validação de competências
• **Avaliações**: Testes e provas
• **Histórico**: Registro de participação

**Tipos de Treinamento:**
• **Obrigatório**: Normas e procedimentos
• **Técnico**: Específico da função
• **Comportamental**: Soft skills
• **Reciclagem**: Atualizações

**Sistema de Certificação:**
• Validade da certificação
• Renovação automática
• Alertas de vencimento
• Histórico de certificações

**Indicadores:**
• % de equipe treinada
• Tempo médio de treinamento
• Taxa de aprovação
• Custo por treinamento`,
    keywords: ["treinamentos", "certificações", "avaliações", "participantes", "histórico", "indicadores"],
    examples: [
      "Cadastro de treinamento em AQL",
      "Gestão de certificações da equipe",
      "Relatório de treinamentos realizados"
    ]
  }
];

// Função para buscar conhecimento por categoria
export const getKnowledgeByCategory = (category: string): KnowledgeItem[] => {
  return SEVERINO_KNOWLEDGE.filter(item => item.category === category);
};

// Função para buscar conhecimento por palavra-chave
export const searchKnowledge = (query: string): KnowledgeItem[] => {
  const lowerQuery = query.toLowerCase();
  return SEVERINO_KNOWLEDGE.filter(item => 
    item.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery)) ||
    item.topic.toLowerCase().includes(lowerQuery) ||
    item.content.toLowerCase().includes(lowerQuery)
  );
};

// Função para obter categorias disponíveis
export const getCategories = (): string[] => {
  return [...new Set(SEVERINO_KNOWLEDGE.map(item => item.category))];
};

// Função para obter tópicos por categoria
export const getTopicsByCategory = (category: string): string[] => {
  return SEVERINO_KNOWLEDGE
    .filter(item => item.category === category)
    .map(item => item.topic);
};
