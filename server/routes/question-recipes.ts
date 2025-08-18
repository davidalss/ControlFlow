import { Router } from 'express';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';
import { questionRecipes } from '../../shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { logger } from '../lib/logger';

const router = Router();

// GET /api/question-recipes/plan/:planId - Listar receitas de um plano
router.get('/plan/:planId', async (req, res) => {
  const startTime = Date.now();
  const { planId } = req.params;
  
  try {
    logger.info('QUESTION_RECIPES', 'GET_RECIPES_BY_PLAN_START', { planId }, req);
    
    const result = await db.select()
      .from(questionRecipes)
      .where(eq(questionRecipes.planId, planId))
      .orderBy(desc(questionRecipes.createdAt));
    
    const duration = Date.now() - startTime;
    logger.crud('QUESTION_RECIPES', {
      operation: 'LIST',
      entity: 'question_recipes',
      entityId: planId,
      result: { count: result.length },
      success: true
    }, req);
    
    logger.performance('QUESTION_RECIPES', 'GET_RECIPES_BY_PLAN', duration, { planId, count: result.length }, req);
    
    res.json(result);
  } catch (error) {
    logger.error('QUESTION_RECIPES', 'GET_RECIPES_BY_PLAN_ERROR', error, { planId }, req);
    res.status(500).json({ message: 'Erro ao buscar receitas de perguntas' });
  }
});

// GET /api/question-recipes/:id - Buscar receita específica
router.get('/:id', async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;
  
  try {
    logger.info('QUESTION_RECIPES', 'GET_RECIPE_BY_ID_START', { id }, req);
    
    const result = await db.select()
      .from(questionRecipes)
      .where(eq(questionRecipes.id, id));
    
    if (result.length === 0) {
      logger.warn('QUESTION_RECIPES', 'GET_RECIPE_BY_ID_NOT_FOUND', { id }, req);
      return res.status(404).json({ message: 'Receita de pergunta não encontrada' });
    }
    
    const duration = Date.now() - startTime;
    logger.crud('QUESTION_RECIPES', {
      operation: 'READ',
      entity: 'question_recipes',
      entityId: id,
      result: { questionName: result[0].questionName },
      success: true
    }, req);
    
    logger.performance('QUESTION_RECIPES', 'GET_RECIPE_BY_ID', duration, { id }, req);
    
    res.json(result[0]);
  } catch (error) {
    logger.error('QUESTION_RECIPES', 'GET_RECIPE_BY_ID_ERROR', error, { id }, req);
    res.status(500).json({ message: 'Erro ao buscar receita de pergunta' });
  }
});

// POST /api/question-recipes - Criar nova receita
router.post('/', async (req: AuthRequest, res) => {
  const startTime = Date.now();
  
  try {
    const {
      planId,
      questionId,
      questionName,
      questionType,
      minValue,
      maxValue,
      expectedValue,
      tolerance,
      unit,
      options,
      defectType,
      isRequired,
      description
    } = req.body;

    logger.info('QUESTION_RECIPES', 'CREATE_RECIPE_START', { 
      planId, 
      questionName,
      userId: req.user?.id 
    }, req);

    // Validações básicas
    if (!planId) {
      return res.status(400).json({ message: 'ID do plano é obrigatório' });
    }

    if (!questionName) {
      return res.status(400).json({ message: 'Nome da pergunta é obrigatório' });
    }

    if (!questionType) {
      return res.status(400).json({ message: 'Tipo da pergunta é obrigatório' });
    }

    if (!defectType) {
      return res.status(400).json({ message: 'Tipo de defeito é obrigatório' });
    }

    // Validações específicas para perguntas numéricas
    if (questionType === 'number') {
      if (minValue === undefined && maxValue === undefined && expectedValue === undefined) {
        return res.status(400).json({ 
          message: 'Para perguntas numéricas, é necessário definir pelo menos um valor mínimo, máximo ou esperado' 
        });
      }
    }

    const result = await db.insert(questionRecipes).values({
      planId,
      questionId,
      questionName,
      questionType,
      minValue,
      maxValue,
      expectedValue,
      tolerance,
      unit,
      options: options ? JSON.stringify(options) : null,
      defectType,
      isRequired: isRequired !== undefined ? isRequired : true,
      description
    }).returning();

    const newRecipe = result[0];
    const duration = Date.now() - startTime;
    
    logger.crud('QUESTION_RECIPES', {
      operation: 'CREATE',
      entity: 'question_recipes',
      entityId: newRecipe.id,
      changes: { planId, questionName, questionType, defectType },
      result: { 
        id: newRecipe.id,
        questionName: newRecipe.questionName
      },
      success: true
    }, req);
    
    logger.performance('QUESTION_RECIPES', 'CREATE_RECIPE', duration, { id: newRecipe.id }, req);

    res.status(201).json(newRecipe);
  } catch (error: any) {
    logger.error('QUESTION_RECIPES', 'CREATE_RECIPE_ERROR', { 
      error: error?.message || 'Erro desconhecido', 
      stack: error?.stack,
      body: req.body,
      userId: req.user?.id 
    }, req);
    res.status(500).json({ message: 'Erro ao criar receita de pergunta' });
  }
});

// PUT /api/question-recipes/:id - Atualizar receita
router.put('/:id', async (req: AuthRequest, res) => {
  const startTime = Date.now();
  const { id } = req.params;
  const updateData = req.body;
  
  try {
    logger.info('QUESTION_RECIPES', 'UPDATE_RECIPE_START', { 
      id, 
      updateData,
      userId: req.user?.id 
    }, req);

    // Buscar receita atual
    const currentRecipe = await db.select()
      .from(questionRecipes)
      .where(eq(questionRecipes.id, id));

    if (currentRecipe.length === 0) {
      logger.warn('QUESTION_RECIPES', 'UPDATE_RECIPE_NOT_FOUND', { id }, req);
      return res.status(404).json({ message: 'Receita de pergunta não encontrada' });
    }

    // Preparar dados para atualização
    const updateValues: any = {
      ...updateData,
      updatedAt: new Date()
    };

    // Converter options para JSON se fornecido
    if (updateData.options) {
      updateValues.options = JSON.stringify(updateData.options);
    }

    const result = await db.update(questionRecipes)
      .set(updateValues)
      .where(eq(questionRecipes.id, id))
      .returning();

    const updatedRecipe = result[0];
    const duration = Date.now() - startTime;
    
    logger.crud('QUESTION_RECIPES', {
      operation: 'UPDATE',
      entity: 'question_recipes',
      entityId: id,
      changes: updateData,
      result: { 
        id,
        questionName: updatedRecipe.questionName
      },
      success: true
    }, req);
    
    logger.performance('QUESTION_RECIPES', 'UPDATE_RECIPE', duration, { id }, req);

    res.json(updatedRecipe);
  } catch (error) {
    logger.error('QUESTION_RECIPES', 'UPDATE_RECIPE_ERROR', error, { 
      id, 
      userId: req.user?.id 
    }, req);
    res.status(500).json({ message: 'Erro ao atualizar receita de pergunta' });
  }
});

// DELETE /api/question-recipes/:id - Excluir receita
router.delete('/:id', async (req: AuthRequest, res) => {
  const startTime = Date.now();
  const { id } = req.params;
  
  try {
    logger.info('QUESTION_RECIPES', 'DELETE_RECIPE_START', { 
      id, 
      userId: req.user?.id 
    }, req);
    
    const result = await db.delete(questionRecipes)
      .where(eq(questionRecipes.id, id))
      .returning();

    if (result.length === 0) {
      logger.warn('QUESTION_RECIPES', 'DELETE_RECIPE_NOT_FOUND', { id }, req);
      return res.status(404).json({ message: 'Receita de pergunta não encontrada' });
    }

    const duration = Date.now() - startTime;
    
    logger.crud('QUESTION_RECIPES', {
      operation: 'DELETE',
      entity: 'question_recipes',
      entityId: id,
      result: { 
        id,
        questionName: result[0].questionName
      },
      success: true
    }, req);
    
    logger.performance('QUESTION_RECIPES', 'DELETE_RECIPE', duration, { id }, req);

    res.json({ message: 'Receita de pergunta excluída com sucesso' });
  } catch (error) {
    logger.error('QUESTION_RECIPES', 'DELETE_RECIPE_ERROR', error, { 
      id, 
      userId: req.user?.id 
    }, req);
    res.status(500).json({ message: 'Erro ao excluir receita de pergunta' });
  }
});

// POST /api/question-recipes/bulk - Criar múltiplas receitas
router.post('/bulk', async (req: AuthRequest, res) => {
  const startTime = Date.now();
  
  try {
    const { planId, recipes } = req.body;

    logger.info('QUESTION_RECIPES', 'CREATE_BULK_RECIPES_START', { 
      planId, 
      count: recipes?.length || 0,
      userId: req.user?.id 
    }, req);

    if (!planId) {
      return res.status(400).json({ message: 'ID do plano é obrigatório' });
    }

    if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
      return res.status(400).json({ message: 'Lista de receitas é obrigatória' });
    }

    // Preparar dados para inserção
    const recipesToInsert = recipes.map((recipe: any) => ({
      planId,
      questionId: recipe.questionId,
      questionName: recipe.questionName,
      questionType: recipe.questionType,
      minValue: recipe.minValue,
      maxValue: recipe.maxValue,
      expectedValue: recipe.expectedValue,
      tolerance: recipe.tolerance,
      unit: recipe.unit,
      options: recipe.options ? JSON.stringify(recipe.options) : null,
      defectType: recipe.defectType,
      isRequired: recipe.isRequired !== undefined ? recipe.isRequired : true,
      description: recipe.description
    }));

    const result = await db.insert(questionRecipes).values(recipesToInsert).returning();
    const duration = Date.now() - startTime;
    
    logger.crud('QUESTION_RECIPES', {
      operation: 'CREATE_BULK',
      entity: 'question_recipes',
      entityId: planId,
      changes: { planId, count: recipes.length },
      result: { 
        planId,
        createdCount: result.length
      },
      success: true
    }, req);
    
    logger.performance('QUESTION_RECIPES', 'CREATE_BULK_RECIPES', duration, { 
      planId, 
      count: result.length 
    }, req);

    res.status(201).json({
      message: `${result.length} receitas criadas com sucesso`,
      recipes: result
    });
  } catch (error: any) {
    logger.error('QUESTION_RECIPES', 'CREATE_BULK_RECIPES_ERROR', { 
      error: error?.message || 'Erro desconhecido', 
      stack: error?.stack,
      body: req.body,
      userId: req.user?.id 
    }, req);
    res.status(500).json({ message: 'Erro ao criar receitas de perguntas' });
  }
});

export default router;
