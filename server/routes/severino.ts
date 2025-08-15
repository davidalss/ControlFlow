import { Router, Request, Response } from 'express';
import geminiService from '../services/geminiService';
import { SeverinoAction, SeverinoResponse, QualityInspectionData, DataAnalysisRequest } from '../types/severino';

const router = Router();

// Middleware para autenticação (simplificado)
const authenticateUser = (req: Request, res: Response, next: Function) => {
  // Aqui você pode implementar sua lógica de autenticação
  // Por enquanto, vamos usar um userId mock
  (req as any).userId = req.headers['x-user-id'] || 'user_' + Date.now();
  next();
};

// Rota principal para chat com Severino
router.post('/chat', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;
    const userId = (req as any).userId;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem é obrigatória'
      });
    }

    console.log(`🤖 Severino - Mensagem recebida de ${userId}: ${message}`);

    // Gerar resposta usando Gemini
    const response = await geminiService.generateResponse(message, userId, context);

    // Analisar intenção do usuário
    const intent = await geminiService.analyzeUserIntent(message);

    const severinoResponse: SeverinoResponse = {
      message: response,
      confidence: intent.confidence,
      requiresUserAction: false,
      suggestions: getSuggestionsBasedOnIntent(intent.intent, context?.currentPage)
    };

    // Se for um comando, adicionar ações
    if (intent.intent === 'command') {
      severinoResponse.actions = getActionsFromIntent(message, context);
      severinoResponse.requiresUserAction = true;
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
