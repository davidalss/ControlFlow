import { Router } from 'express';
import { chatService } from '../services/chatService';
import { authenticateSupabaseToken } from '../middleware/supabaseAuth';

const router = Router();



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

    console.log('🔍 Tentando obter mensagens para sessão:', sessionId);
    
    // Verificar se a sessão existe primeiro
    const session = await chatService.getSessionById(sessionId);
    if (!session) {
      console.log('❌ Sessão não encontrada:', sessionId);
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    console.log('✅ Sessão encontrada, buscando mensagens...');
    const messages = await chatService.getSessionMessages(sessionId, Number(limit));
    console.log('📨 Mensagens encontradas:', messages.length);
    
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('❌ Erro ao obter mensagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
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
