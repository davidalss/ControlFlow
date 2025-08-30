import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import { db } from '../db';
import { etiquetaQuestions, etiquetaInspectionResults } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '../lib/logger';

// Configurar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseServiceRoleKey) {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const router = express.Router();

// Configuração do multer para armazenamento temporário
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'arquivo_referencia' || file.fieldname === 'pdf_reference') {
      // Para arquivos de referência - aceitar PDF e imagens
      const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp'
      ];
      
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Formato de arquivo não suportado. Use PDF ou imagens (JPEG, PNG, etc.) para referência'));
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

// Função para fazer upload para o Supabase Storage
async function uploadToSupabaseStorage(file: Express.Multer.File, bucket: string, path: string): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase não configurado');
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    throw new Error(`Erro ao fazer upload para Supabase Storage: ${error.message}`);
  }

  // Gerar URL pública
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

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
router.post('/', upload.single('arquivo_referencia'), async (req: any, res) => {
  const startTime = Date.now();
  
  try {
    const { titulo, descricao, limite_aprovacao, inspection_plan_id, step_id, question_id } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        message: 'Arquivo de referência é obrigatório (PDF ou imagem)' 
      });
    }
    
    logger.info('ETIQUETA_QUESTIONS', 'CREATE_QUESTION_START', { 
      titulo,
      inspection_plan_id,
      fileType: req.file.mimetype,
      fileName: req.file.originalname,
      userId: req.user?.id 
    }, req);

    let referenceUrl: string;
    let originalUrl: string;

    if (req.file.mimetype === 'application/pdf') {
      // Se for PDF, converter para imagem
      originalUrl = await uploadToSupabaseStorage(req.file, 'ENSOS', `PLANOS/etiquetas/${question_id}_reference.pdf`);
      
      // Converter PDF para imagem usando script Python
      const scriptPath = path.join(__dirname, '../../automation/pdf_to_image.py');
      
      // Salvar PDF temporariamente para conversão
      const tempPdfPath = path.join(__dirname, '../../uploads/temp', `${question_id}_temp.pdf`);
      const tempDir = path.dirname(tempPdfPath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      fs.writeFileSync(tempPdfPath, req.file.buffer);
      
      const conversionResult = await executePythonScript(scriptPath, [
        tempPdfPath,
        '--output', `${question_id}_reference.png`,
        '--upload-dir', path.join(__dirname, '../../uploads/temp')
      ]);
      
      // Limpar arquivo temporário
      try {
        fs.unlinkSync(tempPdfPath);
      } catch (error) {
        logger.warn('ETIQUETA_QUESTIONS', 'CLEANUP_TEMP_ERROR', error);
      }
      
      if (!conversionResult.success) {
        throw new Error(`Falha na conversão do PDF: ${conversionResult.error}`);
      }
      
      // Upload da imagem convertida para o Supabase Storage
      const imageFileName = `PLANOS/etiquetas/${question_id}_reference.png`;
      const imageBuffer = fs.readFileSync(conversionResult.output_image);
      referenceUrl = await uploadToSupabaseStorage(
        { ...req.file, buffer: imageBuffer, mimetype: 'image/png' } as Express.Multer.File,
        'ENSOS',
        imageFileName
      );
      
      // Limpar arquivo de imagem temporário
      try {
        fs.unlinkSync(conversionResult.output_image);
      } catch (error) {
        logger.warn('ETIQUETA_QUESTIONS', 'CLEANUP_IMAGE_ERROR', error);
      }
    } else {
      // Se for imagem, usar diretamente
      const fileExtension = req.file.originalname.split('.').pop() || 'png';
      const imageFileName = `PLANOS/etiquetas/${question_id}_reference.${fileExtension}`;
      referenceUrl = await uploadToSupabaseStorage(req.file, 'ENSOS', imageFileName);
      originalUrl = referenceUrl; // Para imagens, o original é o mesmo
    }
    
    // Salvar pergunta no banco
    const newQuestion = await db.insert(etiquetaQuestions).values({
      inspection_plan_id,
      step_id,
      question_id,
      titulo,
      descricao,
      arquivo_referencia: referenceUrl,
      limite_aprovacao: parseFloat(limite_aprovacao),
      pdf_original_url: originalUrl
    }).returning();
    
    const duration = Date.now() - startTime;
    logger.performance('ETIQUETA_QUESTIONS', 'CREATE_QUESTION', duration, { 
      id: newQuestion[0].id,
      titulo: newQuestion[0].titulo,
      fileType: req.file.mimetype
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

    // Upload da foto de teste para o Supabase Storage
    const testPhotoFileName = `PLANOS/etiquetas/test_photos/${inspection_session_id}_${Date.now()}.jpg`;
    const testPhotoUrl = await uploadToSupabaseStorage(req.file, 'ENSOS', testPhotoFileName);

    // Executar comparação de imagens usando script Python
    const scriptPath = path.join(__dirname, '../../automation/image_comparison.py');
    
    // Salvar foto de teste temporariamente para comparação
    const tempTestPhotoPath = path.join(__dirname, '../../uploads/temp', `test_${Date.now()}.jpg`);
    const tempDir = path.dirname(tempTestPhotoPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    fs.writeFileSync(tempTestPhotoPath, req.file.buffer);
    
    // Baixar imagem de referência do Supabase Storage
    const referenceImagePath = path.join(__dirname, '../../uploads/temp', `ref_${Date.now()}.png`);
    const { data: refImageData, error: refError } = await supabase.storage
      .from('ENSOS')
      .download(etiquetaQuestion.arquivo_referencia.replace(supabase.storage.from('ENSOS').getPublicUrl('').data.publicUrl, ''));
    
    if (refError) {
      throw new Error(`Erro ao baixar imagem de referência: ${refError.message}`);
    }
    
    fs.writeFileSync(referenceImagePath, Buffer.from(await refImageData.arrayBuffer()));
    
    const comparisonResult = await executePythonScript(scriptPath, [
      referenceImagePath,
      tempTestPhotoPath,
      '--method', 'ssim'
    ]);
    
    // Limpar arquivos temporários
    try {
      fs.unlinkSync(tempTestPhotoPath);
      fs.unlinkSync(referenceImagePath);
    } catch (error) {
      logger.warn('ETIQUETA_INSPECTION', 'CLEANUP_TEMP_ERROR', error);
    }
    
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
      foto_enviada: testPhotoUrl,
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
    
    // Excluir arquivos do Supabase Storage
    if (supabase) {
      try {
        // Extrair caminhos dos arquivos das URLs
        const pdfPath = question[0].pdf_original_url?.replace(supabase.storage.from('ENSOS').getPublicUrl('').data.publicUrl, '');
        const imagePath = question[0].arquivo_referencia?.replace(supabase.storage.from('ENSOS').getPublicUrl('').data.publicUrl, '');
        
        const filesToDelete = [pdfPath, imagePath].filter(Boolean);
        
        for (const filePath of filesToDelete) {
          if (filePath) {
            const { error } = await supabase.storage
              .from('ENSOS')
              .remove([filePath]);
            
            if (error) {
              logger.warn('ETIQUETA_QUESTIONS', 'DELETE_STORAGE_ERROR', error, { filePath });
            }
          }
        }
      } catch (error) {
        logger.warn('ETIQUETA_QUESTIONS', 'DELETE_STORAGE_ERROR', error);
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
