import { Router, Request, Response } from 'express';
import geminiService from '../services/geminiService';
import { SeverinoAction, SeverinoResponse, QualityInspectionData, DataAnalysisRequest } from '../types/severino';

const router = Router();

// Middleware para autenticação (simplificado)
const authenticateUser = (req: Request, res: Response, next: Function) => {
  // Usar o userId real passado no header
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'User ID é obrigatório'
    });
  }
  (req as any).userId = userId;
  next();
};

// Rota principal para chat com Severino
router.post('/chat', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { message, context, sessionId } = req.body;
    const userId = (req as any).userId;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem é obrigatória'
      });
    }

            console.log(`🤖 Severino - Mensagem recebida de ${userId}: ${message}`);

    // Preparar contexto incluindo mídia se houver
    const enhancedContext = {
      ...context,
      media: req.body.media || [],
      sessionId: sessionId // Incluir sessionId no contexto
    };

    // Log para debug
    console.log('📥 Dados recebidos no servidor:', {
      hasMessage: !!req.body.message,
      hasContext: !!req.body.context,
      hasMedia: !!(req.body.media),
      mediaLength: req.body.media?.length || 0,
      mediaType: req.body.media?.[0]?.type
    });
    
    if (req.body.media && req.body.media.length > 0) {
      console.log('🖼️ Servidor recebeu mídia:', req.body.media.length, 'itens');
      console.log('📋 Tipo da primeira mídia:', req.body.media[0].type);
      console.log('📋 URL da primeira mídia:', req.body.media[0].url?.substring(0, 50) + '...');
    }

    // Gerar resposta usando Gemini
    console.log('🔄 Iniciando geração de resposta...');
    const response = await geminiService.generateResponse(message, userId, enhancedContext);
    
    console.log('📋 Resposta do Gemini:', response);
    console.log('📋 Tipo da resposta:', typeof response);
    console.log('📋 Resposta é objeto?', typeof response === 'object');
    if (typeof response === 'object') {
      console.log('📋 Chaves do objeto:', Object.keys(response));
      console.log('📋 Tem propriedade message?', 'message' in response);
      console.log('📋 Tem propriedade media?', 'media' in response);
      if ('message' in response) {
        console.log('📋 Conteúdo da message:', response.message);
      }
    }

    // Verificar se a resposta inclui mídia (imagem, gráfico, etc.)
    let severinoResponse: SeverinoResponse;
    
    if (typeof response === 'object' && response.media) {
      // Resposta com mídia (imagem, gráfico, etc.)
      severinoResponse = {
        message: typeof response.message === 'string' ? response.message : 'Análise concluída com sucesso',
        confidence: 0.9,
        requiresUserAction: false,
        suggestions: response.suggestions || [],
        media: response.media
      };
    } else if (typeof response === 'object' && response.message) {
      // Resposta de objeto com mensagem (como análise de imagem)
      const intent = await geminiService.analyzeUserIntent(message);
      
      severinoResponse = {
        message: response.message,
        confidence: intent.confidence,
        requiresUserAction: false,
        suggestions: response.suggestions || getSuggestionsBasedOnIntent(intent.intent, context?.currentPage)
      };
    } else {
      // Resposta normal de texto
      const intent = await geminiService.analyzeUserIntent(message);
      
      severinoResponse = {
        message: typeof response === 'string' ? response : 'Resposta processada com sucesso',
        confidence: intent.confidence,
        requiresUserAction: false,
        suggestions: getSuggestionsBasedOnIntent(intent.intent, context?.currentPage)
      };
    }

    // Se for um comando, adicionar ações (apenas para respostas de texto)
    if (typeof response === 'string') {
      const intent = await geminiService.analyzeUserIntent(message);
      if (intent.intent === 'command') {
        severinoResponse.actions = getActionsFromIntent(message, context);
        severinoResponse.requiresUserAction = true;
      }
    }

    res.json({
      success: true,
      data: severinoResponse
    });

  } catch (error) {
    console.error('Erro no chat do Severino:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para executar ações do Severino
router.post('/actions/execute', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { action, data } = req.body;
    const userId = (req as any).userId;

    console.log(`⚡ Executando ação: ${action.type} para usuário ${userId}`);

    // Simular execução de ação
    const result = await executeSeverinoAction(action, data, userId);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erro ao executar ação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao executar ação'
    });
  }
});

// Rota para criar inspeção via Severino
router.post('/inspections/create', authenticateUser, async (req: Request, res: Response) => {
  try {
    const inspectionData: QualityInspectionData = req.body;
    const userId = (req as any).userId;

    console.log(`🔍 Criando inspeção via Severino para usuário ${userId}`);

    // Aqui você pode integrar com o script Python de automação
    const result = await createInspectionViaAutomation(inspectionData, userId);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erro ao criar inspeção:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar inspeção'
    });
  }
});

// Rota para análise de dados
router.post('/analytics/analyze', authenticateUser, async (req: Request, res: Response) => {
  try {
    const analysisRequest: DataAnalysisRequest = req.body;
    const userId = (req as any).userId;

    console.log(`📊 Análise de dados solicitada por ${userId}`);

    // Aqui você pode integrar com scripts Python de análise
    const result = await analyzeDataViaAutomation(analysisRequest, userId);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erro na análise de dados:', error);
    res.status(500).json({
      success: false,
      error: 'Erro na análise de dados'
    });
  }
});

// Rota para verificar treinamentos
router.get('/training/check', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { teamId } = req.query;

    console.log(`📚 Verificando treinamentos para usuário ${userId}`);

    // Aqui você pode integrar com script Python de verificação
    const result = await checkTrainingStatus(userId, teamId as string);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erro ao verificar treinamentos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar treinamentos'
    });
  }
});

// Rota para obter contexto da conversa
router.get('/context', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const context = geminiService.getConversationContext(userId);

    res.json({
      success: true,
      data: context
    });

  } catch (error) {
    console.error('Erro ao obter contexto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter contexto'
    });
  }
});

// Rota para limpar contexto da conversa
router.delete('/context', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    geminiService.clearConversationContext(userId);

    res.json({
      success: true,
      message: 'Contexto limpo com sucesso'
    });

  } catch (error) {
    console.error('Erro ao limpar contexto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao limpar contexto'
    });
  }
});

// Rota para atualizar preferências do usuário
router.put('/preferences', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const preferences = req.body;

    geminiService.updateUserPreferences(userId, preferences);

    res.json({
      success: true,
      message: 'Preferências atualizadas com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar preferências'
    });
  }
});

// Rota para obter estatísticas do Severino
router.get('/stats', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const context = geminiService.getConversationContext(userId);

    const stats = {
      totalMessages: context?.messages.length || 0,
      lastActivity: context?.lastActivity || null,
      userPreferences: context?.userPreferences || null,
      conversationDuration: context ? 
        Date.now() - context.lastActivity.getTime() : 0
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter estatísticas'
    });
  }
});

// Funções auxiliares

function getSuggestionsBasedOnIntent(intent: string, currentPage?: string): string[] {
  const suggestions: Record<string, string[]> = {
    question: [
      'Posso explicar melhor algum conceito?',
      'Gostaria de ver exemplos práticos?',
      'Posso mostrar a documentação relacionada?'
    ],
    command: [
      'Posso ajudar a executar essa ação?',
      'Gostaria de confirmar os detalhes antes de prosseguir?',
      'Posso mostrar o progresso da execução?'
    ],
    complaint: [
      'Vou investigar esse problema para você',
      'Posso escalar para o suporte técnico?',
      'Gostaria de tentar uma abordagem alternativa?'
    ],
    praise: [
      'Obrigado pelo feedback!',
      'Posso sugerir outras melhorias?',
      'Gostaria de compartilhar essa experiência?'
    ],
    help: [
      'Como posso ajudar você hoje?',
      'Posso mostrar as funcionalidades disponíveis?',
      'Gostaria de um tour pelo sistema?'
    ]
  };

  return suggestions[intent] || suggestions.help;
}

function getActionsFromIntent(message: string, context?: any): SeverinoAction[] {
  const actions: SeverinoAction[] = [];
  const input = message.toLowerCase();

  if (input.includes('criar inspeção') || input.includes('nova inspeção')) {
    actions.push({
      type: 'create_inspection',
      data: {
        productCode: extractProductCode(message),
        inspectionType: extractInspectionType(message),
        priority: extractPriority(message)
      },
      priority: 'high',
      requiresConfirmation: true
    });
  }

  if (input.includes('analisar') || input.includes('dashboard') || input.includes('métricas')) {
    actions.push({
      type: 'analyze_dashboard',
      data: {
        timeRange: extractTimeRange(message),
        metrics: extractMetrics(message)
      },
      priority: 'medium',
      requiresConfirmation: false
    });
  }

  if (input.includes('treinamento') || input.includes('certificação')) {
    actions.push({
      type: 'check_training',
      data: {
        teamId: extractTeamId(message),
        status: 'pending'
      },
      priority: 'medium',
      requiresConfirmation: false
    });
  }

  return actions;
}

async function executeSeverinoAction(action: SeverinoAction, data: any, userId: string): Promise<any> {
  // Simular execução de ações
  // Aqui você pode integrar com scripts Python de automação
  
  switch (action.type) {
    case 'create_inspection':
      return await createInspectionViaAutomation(data, userId);
    
    case 'analyze_dashboard':
      return await analyzeDataViaAutomation(data, userId);
    
    case 'check_training':
      return await checkTrainingStatus(userId, data.teamId);
    
    default:
      return {
        status: 'not_implemented',
        message: 'Ação não implementada ainda'
      };
  }
}

async function createInspectionViaAutomation(data: any, userId: string): Promise<any> {
  // Simular criação de inspeção via automação Python
  console.log(`🤖 Executando automação para criar inspeção:`, data);
  
  // Aqui você chamaria o script Python
  // const result = await pythonAutomation.createInspection(data);
  
  return {
    status: 'success',
    inspectionId: `insp_${Date.now()}`,
    message: 'Inspeção criada com sucesso via automação',
    details: data
  };
}

async function analyzeDataViaAutomation(data: any, userId: string): Promise<any> {
  // Simular análise de dados via automação Python
  console.log(`📊 Executando análise de dados:`, data);
  
  // Aqui você chamaria o script Python
  // const result = await pythonAutomation.analyzeDashboard(data);
  
  return {
    status: 'success',
    analysisId: `analysis_${Date.now()}`,
    message: 'Análise concluída com sucesso',
    insights: [
      'Taxa de aprovação: 95.2%',
      'Tempo médio de inspeção: 12.5 minutos',
      'Principais defeitos: Cosméticos (45%)'
    ],
    recommendations: [
      'Implementar treinamento focado em defeitos cosméticos',
      'Revisar procedimentos de inspeção visual'
    ]
  };
}

async function checkTrainingStatus(userId: string, teamId?: string): Promise<any> {
  // Simular verificação de treinamentos
  console.log(`📚 Verificando treinamentos para usuário ${userId}`);
  
  return {
    status: 'success',
    pendingTrainings: [
      {
        id: 'train_001',
        name: 'Procedimentos de Inspeção Visual',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        priority: 'high'
      },
      {
        id: 'train_002',
        name: 'Uso de Instrumentos de Medição',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
        priority: 'medium'
      }
    ],
    totalPending: 2,
    criticalTrainings: 1
  };
}

// Funções de extração de dados do texto

function extractProductCode(message: string): string {
  const match = message.match(/(?:produto|código)\s+([A-Z0-9]+)/i);
  return match ? match[1] : '';
}

function extractInspectionType(message: string): string {
  if (message.includes('recebimento')) return 'receiving';
  if (message.includes('processo')) return 'process';
  if (message.includes('final')) return 'final';
  if (message.includes('amostra')) return 'sampling';
  return 'final';
}

function extractPriority(message: string): string {
  if (message.includes('urgente') || message.includes('crítico')) return 'high';
  if (message.includes('normal') || message.includes('padrão')) return 'medium';
  return 'low';
}

function extractTimeRange(message: string): string {
  if (message.includes('hoje')) return 'today';
  if (message.includes('semana') || message.includes('7 dias')) return 'week';
  if (message.includes('mês') || message.includes('30 dias')) return 'month';
  if (message.includes('trimestre') || message.includes('3 meses')) return 'quarter';
  return 'month';
}

function extractMetrics(message: string): string[] {
  const metrics: string[] = [];
  if (message.includes('aprovação') || message.includes('aprovados')) metrics.push('pass_rate');
  if (message.includes('defeito') || message.includes('reprovação')) metrics.push('defect_rate');
  if (message.includes('tempo') || message.includes('duração')) metrics.push('inspection_time');
  if (message.includes('produtividade')) metrics.push('productivity');
  return metrics.length > 0 ? metrics : ['pass_rate', 'defect_rate'];
}

function extractTeamId(message: string): string {
  const match = message.match(/(?:equipe|team)\s+([A-Z0-9]+)/i);
  return match ? match[1] : '';
}

export default router;
