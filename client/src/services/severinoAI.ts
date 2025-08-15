import { SEVERINO_KNOWLEDGE, searchKnowledge, getKnowledgeByCategory } from '@/data/severinoKnowledge';

export interface AIResponse {
  content: string;
  confidence: number;
  category: string;
  suggestions: string[];
  metadata?: {
    formulas?: string[];
    examples?: string[];
    standards?: string[];
    relatedTopics?: string[];
  };
}

export interface AnalysisResult {
  type: 'quality' | 'process' | 'statistical' | 'recommendation';
  title: string;
  content: string;
  data?: any;
  recommendations: string[];
}

class SeverinoAI {
  private context: string = '';
  private userPreferences: string[] = [];
  private conversationHistory: string[] = [];

  // Definir contexto atual
  setContext(context: string) {
    this.context = context;
  }

  // Adicionar preferências do usuário
  addUserPreference(preference: string) {
    if (!this.userPreferences.includes(preference)) {
      this.userPreferences.push(preference);
    }
  }

  // Adicionar ao histórico
  addToHistory(message: string) {
    this.conversationHistory.push(message);
    if (this.conversationHistory.length > 10) {
      this.conversationHistory.shift();
    }
  }

  // Processar pergunta e gerar resposta
  async processQuestion(question: string): Promise<AIResponse> {
    this.addToHistory(question);
    
    const lowerQuestion = question.toLowerCase();
    
    // Buscar conhecimento relevante
    const knowledgeResults = searchKnowledge(question);
    
    // Analisar contexto da pergunta
    const context = this.analyzeContext(question);
    
    // Gerar resposta baseada no tipo de pergunta
    let response: AIResponse;
    
    if (this.isQualityQuestion(lowerQuestion)) {
      response = this.generateQualityResponse(question, knowledgeResults);
    } else if (this.isProcessQuestion(lowerQuestion)) {
      response = this.generateProcessResponse(question, knowledgeResults);
    } else if (this.isStatisticalQuestion(lowerQuestion)) {
      response = this.generateStatisticalResponse(question, knowledgeResults);
    } else if (this.isImplementationQuestion(lowerQuestion)) {
      response = this.generateImplementationResponse(question, knowledgeResults);
    } else {
      response = this.generateGeneralResponse(question, knowledgeResults);
    }

    // Personalizar resposta baseada no contexto e preferências
    response = this.personalizeResponse(response);
    
    return response;
  }

  // Analisar contexto da pergunta
  private analyzeContext(question: string): string {
    const contextKeywords = {
      'inspeção': 'inspection',
      'treinamento': 'training',
      'produto': 'product',
      'relatório': 'report',
      'configuração': 'configuration'
    };

    for (const [pt, en] of Object.entries(contextKeywords)) {
      if (question.toLowerCase().includes(pt)) {
        return en;
      }
    }

    return 'general';
  }

  // Verificar se é pergunta sobre qualidade
  private isQualityQuestion(question: string): boolean {
    const qualityKeywords = [
      'qualidade', 'defeito', 'aql', 'inspeção', 'conformidade',
      'iso', 'padrão', 'especificação', 'tolerância', 'aceitação'
    ];
    
    return qualityKeywords.some(keyword => question.includes(keyword));
  }

  // Verificar se é pergunta sobre processos
  private isProcessQuestion(question: string): boolean {
    const processKeywords = [
      'processo', 'fluxo', 'procedimento', 'dmaic', 'pdca',
      'lean', '5s', 'kaizen', 'melhoria', 'otimização'
    ];
    
    return processKeywords.some(keyword => question.includes(keyword));
  }

  // Verificar se é pergunta estatística
  private isStatisticalQuestion(question: string): boolean {
    const statisticalKeywords = [
      'estatística', 'gráfico', 'tendência', 'média', 'desvio',
      'sigma', 'dpmo', 'capabilidade', 'controle', 'análise'
    ];
    
    return statisticalKeywords.some(keyword => question.includes(keyword));
  }

  // Verificar se é pergunta sobre implementação
  private isImplementationQuestion(question: string): boolean {
    const implementationKeywords = [
      'como', 'implementar', 'aplicar', 'executar', 'fazer',
      'criar', 'desenvolver', 'estabelecer', 'configurar'
    ];
    
    return implementationKeywords.some(keyword => question.includes(keyword));
  }

  // Gerar resposta sobre qualidade
  private generateQualityResponse(question: string, knowledge: any[]): AIResponse {
    const qualityKnowledge = knowledge.filter(k => 
      k.category === 'Gestão da Qualidade' || 
      k.category === 'Controle de Inspeções' ||
      k.category === 'ISO 9001'
    );

    let content = '';
    let confidence = 0.8;
    let suggestions: string[] = [];

    if (qualityKnowledge.length > 0) {
      const bestMatch = qualityKnowledge[0];
      content = `📊 **${bestMatch.topic}**\n\n${bestMatch.content}`;
      
      if (bestMatch.examples) {
        content += '\n\n**Exemplos Práticos:**\n';
        bestMatch.examples.forEach(example => {
          content += `• ${example}\n`;
        });
      }

      if (bestMatch.formulas) {
        content += '\n\n**Fórmulas Importantes:**\n';
        bestMatch.formulas.forEach(formula => {
          content += `• ${formula}\n`;
        });
      }

      suggestions = [
        'Criar plano de inspeção AQL',
        'Implementar controle estatístico',
        'Desenvolver procedimentos de qualidade',
        'Configurar sistema de gestão'
      ];
    } else {
      content = `🔍 **Análise de Qualidade**\n\nBaseado na sua pergunta sobre qualidade, posso ajudá-lo com:\n\n• **Controle de Qualidade**: AQL, inspeções, defeitos\n• **Gestão da Qualidade**: ISO 9001, procedimentos, documentação\n• **Melhoria Contínua**: PDCA, análise de dados, ações corretivas\n\nComo posso ajudá-lo especificamente?`;
      confidence = 0.6;
      suggestions = [
        'Explicar conceitos de AQL',
        'Criar procedimento de qualidade',
        'Implementar controle estatístico',
        'Configurar sistema ISO 9001'
      ];
    }

    return {
      content,
      confidence,
      category: 'quality',
      suggestions,
      metadata: {
        formulas: qualityKnowledge[0]?.formulas,
        examples: qualityKnowledge[0]?.examples,
        standards: qualityKnowledge[0]?.standards
      }
    };
  }

  // Gerar resposta sobre processos
  private generateProcessResponse(question: string, knowledge: any[]): AIResponse {
    const processKnowledge = knowledge.filter(k => 
      k.category === 'Lean Manufacturing' || 
      k.category === 'Six Sigma'
    );

    let content = '';
    let confidence = 0.8;
    let suggestions: string[] = [];

    if (processKnowledge.length > 0) {
      const bestMatch = processKnowledge[0];
      content = `🔄 **${bestMatch.topic}**\n\n${bestMatch.content}`;
      
      if (bestMatch.examples) {
        content += '\n\n**Exemplos de Implementação:**\n';
        bestMatch.examples.forEach(example => {
          content += `• ${example}\n`;
        });
      }

      suggestions = [
        'Implementar metodologia DMAIC',
        'Aplicar ferramentas Lean',
        'Criar fluxograma de processo',
        'Desenvolver plano de melhoria'
      ];
    } else {
      content = `⚙️ **Otimização de Processos**\n\nPara melhorar seus processos, posso ajudá-lo com:\n\n• **Lean Manufacturing**: Eliminação de desperdícios\n• **Six Sigma**: Redução de variações\n• **DMAIC**: Metodologia de melhoria\n• **5S**: Organização e padronização\n\nQual aspecto você gostaria de focar?`;
      confidence = 0.6;
      suggestions = [
        'Implementar 5S',
        'Aplicar DMAIC',
        'Criar fluxograma',
        'Otimizar processo'
      ];
    }

    return {
      content,
      confidence,
      category: 'process',
      suggestions,
      metadata: {
        examples: processKnowledge[0]?.examples
      }
    };
  }

  // Gerar resposta estatística
  private generateStatisticalResponse(question: string, knowledge: any[]): AIResponse {
    const statisticalKnowledge = knowledge.filter(k => 
      k.category === 'Gestão da Qualidade' && 
      (k.topic.includes('CEP') || k.topic.includes('Estatístico'))
    );

    let content = '';
    let confidence = 0.9;
    let suggestions: string[] = [];

    if (statisticalKnowledge.length > 0) {
      const bestMatch = statisticalKnowledge[0];
      content = `📈 **${bestMatch.topic}**\n\n${bestMatch.content}`;
      
      if (bestMatch.formulas) {
        content += '\n\n**Fórmulas Estatísticas:**\n';
        bestMatch.formulas.forEach(formula => {
          content += `• ${formula}\n`;
        });
      }

      suggestions = [
        'Criar gráfico de controle',
        'Calcular capabilidade do processo',
        'Analisar tendências',
        'Implementar CEP'
      ];
    } else {
      content = `📊 **Análise Estatística**\n\nPara análise estatística de qualidade, posso ajudá-lo com:\n\n• **Gráficos de Controle**: Monitoramento de processos\n• **Capabilidade**: Cp, Cpk, Pp, Ppk\n• **Análise de Tendências**: Padrões e variações\n• **Controle Estatístico**: CEP e limites\n\nQue tipo de análise você precisa?`;
      confidence = 0.7;
      suggestions = [
        'Criar gráfico de controle',
        'Calcular indicadores',
        'Analisar dados',
        'Implementar CEP'
      ];
    }

    return {
      content,
      confidence,
      category: 'statistical',
      suggestions,
      metadata: {
        formulas: statisticalKnowledge[0]?.formulas
      }
    };
  }

  // Gerar resposta sobre implementação
  private generateImplementationResponse(question: string, knowledge: any[]): AIResponse {
    let content = `🛠️ **Guia de Implementação**\n\nBaseado na sua pergunta sobre implementação, aqui está um passo a passo:\n\n`;
    let confidence = 0.8;
    let suggestions: string[] = [];

    if (knowledge.length > 0) {
      const bestMatch = knowledge[0];
      content += `**${bestMatch.topic}**\n\n${bestMatch.content}\n\n`;
      
      if (bestMatch.examples) {
        content += '**Passos de Implementação:**\n';
        bestMatch.examples.forEach((example, index) => {
          content += `${index + 1}. ${example}\n`;
        });
      }

      suggestions = [
        'Criar plano de implementação',
        'Desenvolver cronograma',
        'Definir responsabilidades',
        'Estabelecer indicadores'
      ];
    } else {
      content += `**Passos Gerais:**\n1. **Planejamento**: Definir objetivos e escopo\n2. **Preparação**: Treinar equipe e preparar recursos\n3. **Execução**: Implementar gradualmente\n4. **Monitoramento**: Acompanhar resultados\n5. **Melhoria**: Ajustar e otimizar\n\nQual processo específico você quer implementar?`;
      confidence = 0.6;
      suggestions = [
        'Planejar implementação',
        'Treinar equipe',
        'Executar projeto',
        'Monitorar resultados'
      ];
    }

    return {
      content,
      confidence,
      category: 'implementation',
      suggestions,
      metadata: {
        examples: knowledge[0]?.examples
      }
    };
  }

  // Gerar resposta geral
  private generateGeneralResponse(question: string, knowledge: any[]): AIResponse {
    let content = `🤖 **Assistência Geral**\n\nOlá! Sou o Guru Severino, seu assistente especializado em qualidade e processos.\n\n`;
    let confidence = 0.5;
    let suggestions: string[] = [];

    if (knowledge.length > 0) {
      const bestMatch = knowledge[0];
      content += `Encontrei informações relevantes sobre **${bestMatch.topic}**:\n\n${bestMatch.content}`;
      confidence = 0.7;
    } else {
      content += `Posso ajudá-lo com:\n\n• **Gestão da Qualidade**: AQL, ISO 9001, controle de processos\n• **Lean & Six Sigma**: DMAIC, 5S, eliminação de desperdícios\n• **Análise Estatística**: Gráficos, indicadores, tendências\n• **Implementação**: Planos, procedimentos, treinamentos\n\nComo posso ajudá-lo hoje?`;
    }

    suggestions = [
      'Explicar conceitos de qualidade',
      'Criar plano de melhoria',
      'Analisar dados',
      'Implementar processo'
    ];

    return {
      content,
      confidence,
      category: 'general',
      suggestions,
      metadata: {
        examples: knowledge[0]?.examples
      }
    };
  }

  // Personalizar resposta
  private personalizeResponse(response: AIResponse): AIResponse {
    // Adicionar contexto se relevante
    if (this.context && this.context !== 'general') {
      response.content += `\n\n💡 **Contexto Atual**: Estou vendo que você está na página de ${this.context}. Posso ajudá-lo com funcionalidades específicas desta área.`;
    }

    // Adicionar sugestões baseadas no histórico
    if (this.conversationHistory.length > 1) {
      const lastQuestion = this.conversationHistory[this.conversationHistory.length - 2];
      if (lastQuestion.toLowerCase().includes('gráfico') || lastQuestion.toLowerCase().includes('kpi')) {
        response.suggestions.unshift('Criar visualização personalizada');
      }
    }

    return response;
  }

  // Gerar análise estruturada
  async generateAnalysis(data: any, type: 'quality' | 'process' | 'statistical'): Promise<AnalysisResult> {
    let analysis: AnalysisResult;

    switch (type) {
      case 'quality':
        analysis = this.generateQualityAnalysis(data);
        break;
      case 'process':
        analysis = this.generateProcessAnalysis(data);
        break;
      case 'statistical':
        analysis = this.generateStatisticalAnalysis(data);
        break;
      default:
        analysis = this.generateGeneralAnalysis(data);
    }

    return analysis;
  }

  // Gerar análise de qualidade
  private generateQualityAnalysis(data: any): AnalysisResult {
    return {
      type: 'quality',
      title: 'Análise de Qualidade',
      content: `📊 **Análise de Qualidade Detalhada**\n\n**Indicadores Principais:**\n• Taxa de Aceitação: ${data.acceptanceRate || 'N/A'}%\n• Defeitos por Milhão: ${data.dpmo || 'N/A'}\n• Nível Sigma: ${data.sigmaLevel || 'N/A'}\n\n**Tendências Identificadas:**\n• ${data.trends || 'Análise em andamento...'}\n\n**Pontos de Atenção:**\n• ${data.attentionPoints || 'Nenhum ponto crítico identificado'}`,
      data,
      recommendations: [
        'Implementar controle estatístico de processo',
        'Revisar critérios de aceitação',
        'Treinar equipe em inspeção',
        'Otimizar processo de produção'
      ]
    };
  }

  // Gerar análise de processo
  private generateProcessAnalysis(data: any): AnalysisResult {
    return {
      type: 'process',
      title: 'Análise de Processo',
      content: `⚙️ **Análise de Processo Detalhada**\n\n**Eficiência do Processo:**\n• Tempo de ciclo: ${data.cycleTime || 'N/A'} min\n• Produtividade: ${data.productivity || 'N/A'}%\n• OEE: ${data.oee || 'N/A'}%\n\n**Desperdícios Identificados:**\n• ${data.waste || 'Análise em andamento...'}\n\n**Oportunidades de Melhoria:**\n• ${data.improvements || 'Processo otimizado'}`,
      data,
      recommendations: [
        'Implementar metodologia Lean',
        'Aplicar ferramentas 5S',
        'Otimizar fluxo de trabalho',
        'Reduzir tempo de setup'
      ]
    };
  }

  // Gerar análise estatística
  private generateStatisticalAnalysis(data: any): AnalysisResult {
    return {
      type: 'statistical',
      title: 'Análise Estatística',
      content: `📈 **Análise Estatística Detalhada**\n\n**Capabilidade do Processo:**\n• Cp: ${data.cp || 'N/A'}\n• Cpk: ${data.cpk || 'N/A'}\n• Pp: ${data.pp || 'N/A'}\n• Ppk: ${data.ppk || 'N/A'}\n\n**Controle Estatístico:**\n• Processo ${data.inControl ? 'sob controle' : 'fora de controle'}\n• Variação: ${data.variation || 'N/A'}\n\n**Tendências:**\n• ${data.trends || 'Análise em andamento...'}`,
      data,
      recommendations: [
        'Implementar gráficos de controle',
        'Investigar causas de variação',
        'Otimizar parâmetros do processo',
        'Estabelecer limites de controle'
      ]
    };
  }

  // Gerar análise geral
  private generateGeneralAnalysis(data: any): AnalysisResult {
    return {
      type: 'recommendation',
      title: 'Análise Geral',
      content: `🔍 **Análise Geral dos Dados**\n\n**Resumo:**\n${data.summary || 'Análise em andamento...'}\n\n**Principais Descobertas:**\n• ${data.findings || 'Processando dados...'}\n\n**Próximos Passos:**\n• ${data.nextSteps || 'Aguardando definição de objetivos'}`,
      data,
      recommendations: [
        'Definir objetivos específicos',
        'Coletar dados adicionais',
        'Implementar melhorias',
        'Monitorar resultados'
      ]
    };
  }
}

// Instância singleton
export const severinoAI = new SeverinoAI();
