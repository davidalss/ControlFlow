import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

interface SeverinoState {
  isOpen: boolean;
  currentPage: string;
  currentContext: any;
  userPreferences: {
    voiceEnabled: boolean;
    autoSuggestions: boolean;
    proactiveHelp: boolean;
    learningMode: boolean;
    language: 'pt-BR' | 'en-US';
  };
  conversationHistory: Array<{
    id: string;
    timestamp: Date;
    page: string;
    query: string;
    response: string;
    helpful: boolean;
  }>;
  learningData: {
    userBehavior: Record<string, number>;
    commonQueries: Record<string, number>;
    successfulActions: Record<string, number>;
  };
  isConnected: boolean;
  lastResponse: string;
  pendingActions: Array<{
    id: string;
    type: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    data: any;
  }>;
}

interface SeverinoAction {
  type: string;
  data: any;
  target?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export const useSeverino = () => {
  const [state, setState] = useState<SeverinoState>({
    isOpen: false,
    currentPage: '',
    currentContext: null,
    userPreferences: {
      voiceEnabled: true,
      autoSuggestions: true,
      proactiveHelp: true,
      learningMode: true,
      language: 'pt-BR'
    },
    conversationHistory: [],
    learningData: {
      userBehavior: {},
      commonQueries: {},
      successfulActions: {}
    },
    isConnected: false,
    lastResponse: '',
    pendingActions: []
  });

  const { toast } = useToast();

  // Toggle Severino visibility
  const toggleSeverino = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  // Update current page context
  const updateContext = useCallback((page: string, context: any) => {
    setState(prev => ({
      ...prev,
      currentPage: page,
      currentContext: context
    }));
  }, []);

  // Process user query and generate response
  const processQuery = useCallback(async (query: string): Promise<{
    response: string;
    actions?: SeverinoAction[];
    suggestions?: string[];
    confidence: number;
  }> => {
    const lowerQuery = query.toLowerCase();
    
    // Record query for learning
    setState(prev => ({
      ...prev,
      learningData: {
        ...prev.learningData,
        commonQueries: {
          ...prev.learningData.commonQueries,
          [query]: (prev.learningData.commonQueries[query] || 0) + 1
        }
      }
    }));

    // Try to connect to Gemini API first
    try {
      const response = await fetch('/api/severino/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user_' + Date.now() // Mock user ID
        },
        body: JSON.stringify({
          message: query,
          context: {
            currentPage: state.currentPage,
            pageData: state.currentContext
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setState(prev => ({
            ...prev,
            isConnected: true,
            lastResponse: data.data.message
          }));
          
          return {
            response: data.data.message,
            actions: data.data.actions || [],
            suggestions: data.data.suggestions || [],
            confidence: data.data.confidence || 0.8
          };
        }
      }
    } catch (error) {
      console.warn('Gemini API not available, using fallback:', error);
    }

    // Quality Control Knowledge Base
    const knowledgeBase = {
      // AQL and Sampling
      aql: {
        patterns: ['aql', 'amostra', 'critério', 'aceitação', 'rejeição'],
        response: `**Critérios AQL (NBR 5426/ISO 2859-1)** 📊

**Níveis de Inspeção:**
• **Nível I:** Inspeção reduzida (menor amostra)
• **Nível II:** Inspeção normal (padrão)
• **Nível III:** Inspeção rigorosa (maior amostra)

**Critérios de Aceitação:**
• **Crítico:** 0.0 - 1.0 (defeitos que podem causar lesões)
• **Maior:** 0.0 - 4.0 (defeitos que afetam funcionalidade)
• **Menor:** 0.0 - 6.5 (defeitos cosméticos)

**Exemplo prático:**
Para um lote de 1000 peças, Nível II, AQL 2.5:
• Tamanho da amostra: 80 peças
• Aceitar se ≤ 5 defeitos
• Rejeitar se ≥ 6 defeitos

Posso ajudá-lo a calcular o tamanho da amostra para seu caso específico!`,
        actions: [
          {
            type: 'calculate_sample_size',
            data: { lotSize: 1000, level: 'II', aql: 2.5 },
            priority: 'medium'
          }
        ],
        suggestions: [
          'Calcular amostra para meu lote',
          'Explicar diferença entre níveis',
          'Mostrar tabela AQL completa'
        ],
        confidence: 0.95
      },

      // Inspection Procedures
      inspection: {
        patterns: ['inspeção', 'verificar', 'controlar', 'procedimento'],
        response: `**Guia de Inspeção de Qualidade** 🔍

**Etapas Recomendadas:**
1. **Preparação:** Verificar equipamentos e documentação
2. **Identificação:** Confirmar produto e lote
3. **Amostragem:** Seguir critérios AQL definidos
4. **Inspeção:** Executar conforme plano estabelecido
5. **Registro:** Documentar todos os achados
6. **Decisão:** Aprovar/rejeitar baseado em critérios

**Dicas Importantes:**
• Sempre documente com fotos
• Registre não conformidades detalhadamente
• Mantenha rastreabilidade completa
• Siga procedimentos de segurança

Posso ajudá-lo a criar um plano de inspeção ou executar uma inspeção!`,
        actions: [
          {
            type: 'create_inspection_plan',
            data: { productId: state.currentContext?.productId },
            priority: 'high'
          }
        ],
        suggestions: [
          'Criar plano de inspeção',
          'Iniciar inspeção',
          'Analisar resultados anteriores'
        ],
        confidence: 0.90
      },

      // Quality Improvement
      improvement: {
        patterns: ['melhorar', 'otimizar', 'sugestão', 'problema'],
        response: `**Sugestões de Melhoria de Qualidade** 💡

**Análise de Tendências:**
• Identifique padrões de não conformidades
• Analise causas raiz dos problemas
• Implemente ações corretivas preventivas

**Otimizações Recomendadas:**
• Automatizar processos repetitivos
• Padronizar procedimentos de inspeção
• Implementar controle estatístico
• Treinar equipe continuamente

**Indicadores de Performance:**
• Taxa de aprovação de lotes
• Tempo médio de inspeção
• Custo de não qualidade
• Satisfação do cliente

Posso analisar seus dados e sugerir melhorias específicas!`,
        actions: [
          {
            type: 'analyze_quality_data',
            data: { timeRange: 'last_30_days' },
            priority: 'medium'
          }
        ],
        suggestions: [
          'Analisar dados de qualidade',
          'Identificar tendências',
          'Sugerir otimizações'
        ],
        confidence: 0.85
      },

      // Training and Certification
      training: {
        patterns: ['treinamento', 'certificação', 'curso', 'aprender'],
        response: `**Sistema de Treinamento e Certificação** 🎓

**Cursos Disponíveis:**
• **Inspeção de Qualidade Básica**
• **Critérios AQL Avançado**
• **Controle Estatístico de Processo**
• **Gestão de Não Conformidades**
• **Auditoria de Qualidade**

**Certificações:**
• Certificado de Inspetor de Qualidade
• Especialista em AQL
• Auditor de Qualidade
• Coordenador de Qualidade

**Benefícios:**
• Acesso a materiais exclusivos
• Certificados reconhecidos
• Progresso personalizado
• Suporte especializado

Posso ajudá-lo a se matricular em um curso ou verificar seu progresso!`,
        actions: [
          {
            type: 'enroll_training',
            data: { courseType: 'quality_inspection' },
            priority: 'medium'
          }
        ],
        suggestions: [
          'Matricular em curso',
          'Verificar progresso',
          'Emitir certificado'
        ],
        confidence: 0.88
      },

      // Data Analysis
      analysis: {
        patterns: ['analisar', 'dados', 'relatório', 'estatística'],
        response: `**Análise de Dados de Qualidade** 📈

**Tipos de Análise:**
• **Tendências:** Evolução temporal dos indicadores
• **Correlação:** Relação entre variáveis
• **Capacidade:** Análise Cp/Cpk do processo
• **Controle:** Cartas de controle SPC
• **Predição:** Modelos preditivos

**Indicadores Principais:**
• Taxa de aprovação/rejeição
• Tempo médio de inspeção
• Custo de não qualidade
• Satisfação do cliente
• Eficiência do processo

**Relatórios Disponíveis:**
• Relatório diário de inspeções
• Análise mensal de tendências
• Relatório de não conformidades
• Dashboard executivo

Posso gerar relatórios específicos ou analisar dados em tempo real!`,
        actions: [
          {
            type: 'generate_report',
            data: { reportType: 'quality_trends', period: 'monthly' },
            priority: 'high'
          }
        ],
        suggestions: [
          'Gerar relatório de qualidade',
          'Analisar tendências',
          'Criar dashboard personalizado'
        ],
        confidence: 0.92
      }
    };

    // Find matching knowledge base entry
    for (const [key, knowledge] of Object.entries(knowledgeBase)) {
      if (knowledge.patterns.some(pattern => lowerQuery.includes(pattern))) {
        return {
          response: knowledge.response,
          actions: knowledge.actions,
          suggestions: knowledge.suggestions,
          confidence: knowledge.confidence
        };
      }
    }

    // Default response for unknown queries
    return {
      response: `Entendi sua pergunta sobre "${query}". Como especialista em qualidade, posso ajudá-lo com:

• **Procedimentos:** Explicar normas e processos
• **Análise:** Interpretar dados e resultados
• **Otimização:** Sugerir melhorias
• **Treinamento:** Fornecer orientações
• **Automação:** Executar tarefas

Pode ser mais específico sobre o que precisa? Ou posso analisar o contexto atual da página para oferecer ajuda mais direcionada.`,
      suggestions: [
        'Explicar procedimento atual',
        'Analisar dados da página',
        'Sugerir melhorias',
        'Mostrar exemplos práticos'
      ],
      confidence: 0.70
    };
  }, [state.currentContext]);

  // Execute actions
  const executeAction = useCallback(async (action: SeverinoAction) => {
    try {
      switch (action.type) {
        case 'calculate_sample_size':
          // Calculate AQL sample size
          const { lotSize, level, aql } = action.data;
          const sampleSize = calculateSampleSize(lotSize, level, aql);
          toast({
            title: "Cálculo AQL",
            description: `Para lote de ${lotSize} peças: Amostra = ${sampleSize} peças`,
          });
          break;

        case 'create_inspection_plan':
          // Create new inspection plan
          toast({
            title: "Criar Plano",
            description: "Abrindo formulário para criar novo plano de inspeção...",
          });
          break;

        case 'analyze_quality_data':
          // Analyze quality data
          toast({
            title: "Análise de Dados",
            description: "Analisando dados de qualidade dos últimos 30 dias...",
          });
          break;

        case 'enroll_training':
          // Enroll in training course
          toast({
            title: "Matrícula",
            description: "Redirecionando para página de matrícula...",
          });
          break;

        case 'generate_report':
          // Generate quality report
          toast({
            title: "Relatório",
            description: "Gerando relatório de qualidade...",
          });
          break;

        default:
          console.log('Unknown action:', action);
      }

      // Record successful action
      setState(prev => ({
        ...prev,
        learningData: {
          ...prev.learningData,
          successfulActions: {
            ...prev.learningData.successfulActions,
            [action.type]: (prev.learningData.successfulActions[action.type] || 0) + 1
          }
        }
      }));

    } catch (error) {
      console.error('Error executing action:', error);
      toast({
        title: "Erro",
        description: "Erro ao executar ação solicitada.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Calculate AQL sample size
  const calculateSampleSize = (lotSize: number, level: string, aql: number): number => {
    // Simplified AQL calculation (in real implementation, use full NBR 5426 tables)
    const levelMultipliers = { 'I': 0.5, 'II': 1, 'III': 1.5 };
    const multiplier = levelMultipliers[level as keyof typeof levelMultipliers] || 1;
    
    if (lotSize <= 8) return Math.max(2, Math.ceil(lotSize * 0.5));
    if (lotSize <= 15) return Math.max(3, Math.ceil(lotSize * 0.4));
    if (lotSize <= 25) return Math.max(5, Math.ceil(lotSize * 0.3));
    if (lotSize <= 50) return Math.max(8, Math.ceil(lotSize * 0.25));
    if (lotSize <= 90) return Math.max(13, Math.ceil(lotSize * 0.2));
    if (lotSize <= 150) return Math.max(20, Math.ceil(lotSize * 0.15));
    if (lotSize <= 280) return Math.max(32, Math.ceil(lotSize * 0.12));
    if (lotSize <= 500) return Math.max(50, Math.ceil(lotSize * 0.1));
    if (lotSize <= 1200) return Math.max(80, Math.ceil(lotSize * 0.08));
    if (lotSize <= 3200) return Math.max(125, Math.ceil(lotSize * 0.06));
    if (lotSize <= 10000) return Math.max(200, Math.ceil(lotSize * 0.05));
    if (lotSize <= 35000) return Math.max(315, Math.ceil(lotSize * 0.04));
    if (lotSize <= 150000) return Math.max(500, Math.ceil(lotSize * 0.03));
    if (lotSize <= 500000) return Math.max(800, Math.ceil(lotSize * 0.025));
    
    return Math.max(1250, Math.ceil(lotSize * 0.02));
  };

  // Proactive help based on context
  const provideProactiveHelp = useCallback(() => {
    if (!state.userPreferences.proactiveHelp || !state.currentPage) return;

    const proactiveSuggestions = {
      'inspection-plans': [
        'Precisa de ajuda para criar um plano de inspeção?',
        'Quer validar os critérios AQL do seu plano?',
        'Posso explicar como configurar etapas de inspeção'
      ],
      'inspections': [
        'Precisa de ajuda para executar a inspeção?',
        'Quer calcular o tamanho da amostra?',
        'Posso ajudar a registrar não conformidades'
      ],
      'products': [
        'Precisa de ajuda para cadastrar um produto?',
        'Quer importar produtos em massa?',
        'Posso validar os dados do produto'
      ],
      'training': [
        'Precisa de ajuda para se matricular em um curso?',
        'Quer verificar seu progresso nos treinamentos?',
        'Posso explicar o conteúdo dos cursos'
      ]
    };

    const suggestions = proactiveSuggestions[state.currentPage as keyof typeof proactiveSuggestions];
    if (suggestions) {
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      
      // Show proactive suggestion after a delay
      setTimeout(() => {
        toast({
          title: "💡 Dica do Severino",
          description: randomSuggestion,
          duration: 5000
        });
      }, 3000);
    }
  }, [state.currentPage, state.userPreferences.proactiveHelp, toast]);

  // Update user preferences
  const updatePreferences = useCallback((preferences: Partial<SeverinoState['userPreferences']>) => {
    setState(prev => ({
      ...prev,
      userPreferences: { ...prev.userPreferences, ...preferences }
    }));
  }, []);

  // Record conversation for learning
  const recordConversation = useCallback((query: string, response: string, helpful: boolean) => {
    setState(prev => ({
      ...prev,
      conversationHistory: [
        ...prev.conversationHistory,
        {
          id: Date.now().toString(),
          timestamp: new Date(),
          page: prev.currentPage,
          query,
          response,
          helpful
        }
      ]
    }));
  }, []);

  // Get learning insights
  const getLearningInsights = useCallback(() => {
    const { learningData } = state;
    
    return {
      mostCommonQueries: Object.entries(learningData.commonQueries)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      mostSuccessfulActions: Object.entries(learningData.successfulActions)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      userBehaviorPatterns: Object.entries(learningData.userBehavior)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    };
  }, [state.learningData]);

  // Provide contextual suggestions based on current page
  const getContextualSuggestions = useCallback(() => {
    const suggestions = {
      'inspection-plans': [
        'Como criar um plano de inspeção?',
        'Explicar critérios AQL',
        'Validar configurações do plano',
        'Duplicar plano existente'
      ],
      'inspections': [
        'Iniciar nova inspeção',
        'Calcular tamanho da amostra',
        'Registrar não conformidade',
        'Gerar relatório de inspeção'
      ],
      'products': [
        'Cadastrar novo produto',
        'Importar produtos em massa',
        'Validar dados do produto',
        'Exportar catálogo'
      ],
      'training': [
        'Matricular em curso',
        'Verificar progresso',
        'Emitir certificado',
        'Acessar materiais'
      ]
    };

    return suggestions[state.currentPage as keyof typeof suggestions] || [
      'Como posso ajudá-lo?',
      'Explicar procedimento atual',
      'Analisar dados da página',
      'Sugerir melhorias'
    ];
  }, [state.currentPage]);

  return {
    state,
    toggleSeverino,
    updateContext,
    processQuery,
    executeAction,
    updatePreferences,
    recordConversation,
    getLearningInsights,
    getContextualSuggestions,
    provideProactiveHelp
  };
};
