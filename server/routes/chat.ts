import { Router } from 'express';
import { chatService } from '../services/chatService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * GET /api/chat/sessions
 * Obter todas as sessões do usuário
 */
router.get('/sessions', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const sessions = await chatService.getUserSessions(userId);
    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Erro ao obter sessões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/chat/sessions/:sessionId/messages
 * Obter mensagens de uma sessão específica
 */
router.get('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50 } = req.query;

    const messages = await chatService.getSessionMessages(sessionId, Number(limit));
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Erro ao obter mensagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/chat/sessions/:sessionId/contexts
 * Obter contextos de uma sessão específica
 */
router.get('/sessions/:sessionId/contexts', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const contexts = await chatService.getSessionContexts(sessionId);
    res.json({ success: true, data: contexts });
  } catch (error) {
    console.error('Erro ao obter contextos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/chat/sessions
 * Criar nova sessão ou obter sessão ativa
 */
router.post('/sessions', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { sessionName } = req.body;
    const session = await chatService.getOrCreateSession(userId, sessionName);
    
    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Erro ao criar/obter sessão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/chat/sessions/:sessionId/archive
 * Arquivar uma sessão
 */
router.post('/sessions/:sessionId/archive', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    await chatService.archiveSession(sessionId);
    res.json({ success: true, message: 'Sessão arquivada com sucesso' });
  } catch (error) {
    console.error('Erro ao arquivar sessão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/chat/sessions/:sessionId/label-analysis
 * Obter contexto de análise de etiquetas
 */
router.get('/sessions/:sessionId/label-analysis', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const contexts = await chatService.getLabelAnalysisContext(sessionId);
    res.json({ success: true, data: contexts });
  } catch (error) {
    console.error('Erro ao obter contexto de análise:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/chat/sessions/:sessionId/comparison
 * Obter contexto de comparações
 */
router.get('/sessions/:sessionId/comparison', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const contexts = await chatService.getComparisonContext(sessionId);
    res.json({ success: true, data: contexts });
  } catch (error) {
    console.error('Erro ao obter contexto de comparação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
