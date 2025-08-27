import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { db } from '../db';
import { etiquetaQuestions, etiquetaInspectionResults } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '../lib/logger';

const router = express.Router();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/etiquetas');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'pdf_reference') {
      // Para PDFs de referência
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos PDF são permitidos para referência'));
      }
    } else if (file.fieldname === 'test_photo') {
      // Para fotos de teste
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos de imagem são permitidos para teste'));
      }
    } else {
      cb(new Error('Campo de arquivo não reconhecido'));
    }
  }
});

// Função para executar script Python
async function executePythonScript(scriptPath: string, args: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [scriptPath, ...args]);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (error) {
          reject(new Error(`Erro ao parsear resultado do Python: ${stdout}`));
        }
      } else {
        reject(new Error(`Script Python falhou: ${stderr}`));
      }
    });
    
    pythonProcess.on('error', (error) => {
      reject(new Error(`Erro ao executar script Python: ${error.message}`));
    });
  });
}

// POST /api/etiqueta-questions - Criar nova pergunta de etiqueta
router.post('/', upload.single('pdf_reference'), async (req: any, res) => {
  const startTime = Date.now();
  
  try {
    const { titulo, descricao, limite_aprovacao, inspection_plan_id, step_id, question_id } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        message: 'Arquivo PDF de referência é obrigatório' 
      });
    }
    
    logger.info('ETIQUETA_QUESTIONS', 'CREATE_QUESTION_START', { 
      titulo,
      inspection_plan_id,
      userId: req.user?.id 
    }, req);

    // Converter PDF para imagem usando script Python
    const pdfPath = req.file.path;
    const scriptPath = path.join(__dirname, '../../automation/pdf_to_image.py');
    
    const conversionResult = await executePythonScript(scriptPath, [
      pdfPath,
      '--output', `${question_id}_reference.png`,
      '--upload-dir', path.join(__dirname, '../../uploads/etiquetas/images')
    ]);
    
    if (!conversionResult.success) {
      throw new Error(`Falha na conversão do PDF: ${conversionResult.error}`);
    }
    
    // Salvar pergunta no banco
    const newQuestion = await db.insert(etiquetaQuestions).values({
      inspection_plan_id,
      step_id,
      question_id,
      titulo,
      descricao,
      arquivo_referencia: conversionResult.output_image,
      limite_aprovacao: parseFloat(limite_aprovacao),
      pdf_original_url: req.file.path
    }).returning();
    
    const duration = Date.now() - startTime;
    logger.performance('ETIQUETA_QUESTIONS', 'CREATE_QUESTION', duration, { 
      id: newQuestion[0].id,
      titulo: newQuestion[0].titulo 
    });

    res.status(201).json(newQuestion[0]);
  } catch (error: any) {
    logger.error('ETIQUETA_QUESTIONS', 'CREATE_QUESTION_ERROR', error, { 
      titulo: req.body?.titulo,
      userId: req.user?.id 
    }, req);
    res.status(500).json({ message: 'Erro ao criar pergunta de etiqueta' });
  }
});

// GET /api/etiqueta-questions - Listar perguntas de etiqueta
router.get('/', async (req: any, res) => {
  try {
    const { inspection_plan_id, step_id } = req.query;
    
    let whereClause = {};
    if (inspection_plan_id) {
      whereClause = { ...whereClause, inspection_plan_id };
    }
    if (step_id) {
      whereClause = { ...whereClause, step_id };
    }
    
    const questions = await db.select().from(etiquetaQuestions).where(whereClause);
    
    res.json(questions);
  } catch (error: any) {
    logger.error('ETIQUETA_QUESTIONS', 'GET_QUESTIONS_ERROR', error, req);
    res.status(500).json({ message: 'Erro ao buscar perguntas de etiqueta' });
  }
});

// GET /api/etiqueta-questions/:id - Buscar pergunta específica
router.get('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const question = await db.select()
      .from(etiquetaQuestions)
      .where(eq(etiquetaQuestions.id, id))
      .limit(1);
    
    if (question.length === 0) {
      return res.status(404).json({ message: 'Pergunta não encontrada' });
    }
    
    res.json(question[0]);
  } catch (error: any) {
    logger.error('ETIQUETA_QUESTIONS', 'GET_QUESTION_ERROR', error, req);
    res.status(500).json({ message: 'Erro ao buscar pergunta' });
  }
});

// POST /api/etiqueta-questions/:id/inspect - Executar inspeção de etiqueta
router.post('/:id/inspect', upload.single('test_photo'), async (req: any, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const { inspection_session_id } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        message: 'Foto de teste é obrigatória' 
      });
    }
    
    // Buscar pergunta de etiqueta
    const question = await db.select()
      .from(etiquetaQuestions)
      .where(eq(etiquetaQuestions.id, id))
      .limit(1);
    
    if (question.length === 0) {
      return res.status(404).json({ message: 'Pergunta não encontrada' });
    }
    
    const etiquetaQuestion = question[0];
    
    logger.info('ETIQUETA_INSPECTION', 'INSPECT_START', { 
      question_id: id,
      userId: req.user?.id 
    }, req);

    // Executar comparação de imagens usando script Python
    const scriptPath = path.join(__dirname, '../../automation/image_comparison.py');
    const referenceImage = etiquetaQuestion.arquivo_referencia;
    const testImage = req.file.path;
    
    const comparisonResult = await executePythonScript(scriptPath, [
      referenceImage,
      testImage,
      '--method', 'ssim'
    ]);
    
    if (!comparisonResult.success) {
      throw new Error(`Falha na comparação de imagens: ${comparisonResult.error}`);
    }
    
    // Determinar resultado final
    const similarityScore = comparisonResult.score;
    const isApproved = similarityScore >= etiquetaQuestion.limite_aprovacao;
    const resultadoFinal = isApproved ? 'APROVADO' : 'REPROVADO';
    
    // Salvar resultado no banco
    const inspectionResult = await db.insert(etiquetaInspectionResults).values({
      etiqueta_question_id: id,
      inspection_session_id,
      foto_enviada: req.file.path,
      percentual_similaridade: similarityScore,
      resultado_final: resultadoFinal,
      detalhes_comparacao: comparisonResult,
      created_by: req.user?.id
    }).returning();
    
    const duration = Date.now() - startTime;
    logger.performance('ETIQUETA_INSPECTION', 'INSPECT_COMPLETE', duration, { 
      question_id: id,
      resultado: resultadoFinal,
      similarity: similarityScore
    });

    res.json({
      success: true,
      result: inspectionResult[0],
      comparison: comparisonResult,
      approved: isApproved,
      similarity_score: similarityScore,
      similarity_percentage: comparisonResult.score_percentage
    });
    
  } catch (error: any) {
    logger.error('ETIQUETA_INSPECTION', 'INSPECT_ERROR', error, { 
      question_id: req.params?.id,
      userId: req.user?.id 
    }, req);
    res.status(500).json({ message: 'Erro ao executar inspeção de etiqueta' });
  }
});

// GET /api/etiqueta-questions/:id/results - Buscar resultados de inspeção
router.get('/:id/results', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const results = await db.select()
      .from(etiquetaInspectionResults)
      .where(eq(etiquetaInspectionResults.etiqueta_question_id, id))
      .orderBy(etiquetaInspectionResults.created_at)
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));
    
    res.json(results);
  } catch (error: any) {
    logger.error('ETIQUETA_RESULTS', 'GET_RESULTS_ERROR', error, req);
    res.status(500).json({ message: 'Erro ao buscar resultados' });
  }
});

// DELETE /api/etiqueta-questions/:id - Excluir pergunta de etiqueta
router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    
    // Buscar pergunta para obter caminhos dos arquivos
    const question = await db.select()
      .from(etiquetaQuestions)
      .where(eq(etiquetaQuestions.id, id))
      .limit(1);
    
    if (question.length === 0) {
      return res.status(404).json({ message: 'Pergunta não encontrada' });
    }
    
    // Excluir arquivos físicos
    const filesToDelete = [
      question[0].arquivo_referencia,
      question[0].pdf_original_url
    ].filter(Boolean);
    
    for (const filePath of filesToDelete) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        logger.warn('ETIQUETA_QUESTIONS', 'DELETE_FILE_ERROR', error, { filePath });
      }
    }
    
    // Excluir do banco (cascade irá excluir resultados também)
    await db.delete(etiquetaQuestions).where(eq(etiquetaQuestions.id, id));
    
    res.json({ message: 'Pergunta excluída com sucesso' });
  } catch (error: any) {
    logger.error('ETIQUETA_QUESTIONS', 'DELETE_QUESTION_ERROR', error, req);
    res.status(500).json({ message: 'Erro ao excluir pergunta' });
  }
});

export default router;
