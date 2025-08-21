import { Router } from 'express';
import { authenticateSupabaseToken } from '../middleware/supabaseAuth';
import { storage } from '../storage';
import { logger } from '../lib/logger';

const router = Router();

// GET /api/blocks - Listar blocks
router.get('/', authenticateSupabaseToken, async (req: any, res) => {
  try {
    // Por enquanto, retornar array vazio até implementar a funcionalidade
    res.json([]);
  } catch (error) {
    logger.error('BLOCKS', 'GET_BLOCKS_ERROR', error, {}, req);
    res.status(500).json({ message: 'Erro ao buscar blocks' });
  }
});

// GET /api/blocks/:id - Buscar block específico
router.get('/:id', authenticateSupabaseToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    // Por enquanto, retornar 404 até implementar a funcionalidade
    res.status(404).json({ message: 'Block não encontrado' });
  } catch (error) {
    logger.error('BLOCKS', 'GET_BLOCK_BY_ID_ERROR', error, { id: req.params.id }, req);
    res.status(500).json({ message: 'Erro ao buscar block' });
  }
});

// POST /api/blocks - Criar novo block
router.post('/', authenticateSupabaseToken, async (req: any, res) => {
  try {
    // Por enquanto, retornar erro até implementar a funcionalidade
    res.status(501).json({ message: 'Funcionalidade não implementada' });
  } catch (error) {
    logger.error('BLOCKS', 'CREATE_BLOCK_ERROR', error, {}, req);
    res.status(500).json({ message: 'Erro ao criar block' });
  }
});

// PATCH /api/blocks/:id - Atualizar block
router.patch('/:id', authenticateSupabaseToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    // Por enquanto, retornar erro até implementar a funcionalidade
    res.status(501).json({ message: 'Funcionalidade não implementada' });
  } catch (error) {
    logger.error('BLOCKS', 'UPDATE_BLOCK_ERROR', error, { id: req.params.id }, req);
    res.status(500).json({ message: 'Erro ao atualizar block' });
  }
});

export default router;
