import { Router } from 'express';
import { authenticateSupabaseToken } from '../middleware/supabaseAuth';
import { storage } from '../storage';
import { logger } from '../lib/logger';

const router = Router();

// GET /api/inspections - Listar inspeções
router.get('/', authenticateSupabaseToken, async (req: any, res) => {
  try {
    // Por enquanto, retornar array vazio até implementar a funcionalidade
    res.json([]);
  } catch (error) {
    logger.error('INSPECTIONS', 'GET_INSPECTIONS_ERROR', error, {}, req);
    res.status(500).json({ message: 'Erro ao buscar inspeções' });
  }
});

// GET /api/inspections/:id - Buscar inspeção específica
router.get('/:id', authenticateSupabaseToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    // Por enquanto, retornar 404 até implementar a funcionalidade
    res.status(404).json({ message: 'Inspeção não encontrada' });
  } catch (error) {
    logger.error('INSPECTIONS', 'GET_INSPECTION_BY_ID_ERROR', error, { id: req.params.id }, req);
    res.status(500).json({ message: 'Erro ao buscar inspeção' });
  }
});

// POST /api/inspections - Criar nova inspeção
router.post('/', authenticateSupabaseToken, async (req: any, res) => {
  try {
    // Por enquanto, retornar erro até implementar a funcionalidade
    res.status(501).json({ message: 'Funcionalidade não implementada' });
  } catch (error) {
    logger.error('INSPECTIONS', 'CREATE_INSPECTION_ERROR', error, {}, req);
    res.status(500).json({ message: 'Erro ao criar inspeção' });
  }
});

export default router;
