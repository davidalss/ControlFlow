import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { EtiquetaService } from '@/lib/etiqueta/service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Sistema de logs para API de inspeção
class InspectionApiLogger {
  info(message: string, data?: any) {
    console.log(`[INSPECTION-API-INFO] ${new Date().toISOString()} - ${message}`, data || '');
  }

  warn(message: string, data?: any) {
    console.warn(`[INSPECTION-API-WARN] ${new Date().toISOString()} - ${message}`, data || '');
  }

  error(message: string, error?: any, data?: any) {
    console.error(`[INSPECTION-API-ERROR] ${new Date().toISOString()} - ${message}`, {
      error: error?.message || error,
      stack: error?.stack,
      ...data
    });
  }

  performance(operation: string, duration: number, data?: any) {
    console.log(`[INSPECTION-API-PERF] ${new Date().toISOString()} - ${operation} took ${duration}ms`, data || '');
  }
}

const logger = new InspectionApiLogger();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const startTime = Date.now();
  const { id } = req.query;

  logger.info('Requisição de inspeção recebida', {
    method: req.method,
    url: req.url,
    etiquetaQuestionId: id,
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
  });

  if (req.method !== 'POST') {
    logger.warn('Método HTTP não permitido', { method: req.method });
    return res.status(405).json({ message: 'Método não permitido' });
  }

  if (!id || typeof id !== 'string') {
    logger.warn('ID da pergunta inválido ou ausente', { id });
    return res.status(400).json({ message: 'ID da pergunta é obrigatório' });
  }

  try {
    logger.info('Iniciando processamento da inspeção', { etiquetaQuestionId: id });

    // Parsear o form data
    logger.info('Parseando form data');
    const form = formidable({ });
    const [fields, files] = await form.parse(req);

    logger.debug('Form data parseado', {
      fieldsCount: Object.keys(fields).length,
      filesCount: Object.keys(files).length,
      fields: Object.keys(fields),
      files: Object.keys(files)
    });

    // Validar campos obrigatórios
    if (!fields.inspection_session_id) {
      logger.warn('ID da sessão ausente na requisição');
      return res.status(400).json({ message: 'ID da sessão é obrigatório' });
    }

    const inspectionSessionId = fields.inspection_session_id[0];
    logger.info('ID da sessão validado', { inspectionSessionId });

    // Validar foto
    const testPhoto = files.test_photo?.[0];
    if (!testPhoto) {
      logger.warn('Foto de teste ausente na requisição');
      return res.status(400).json({ message: 'Foto de teste é obrigatória' });
    }

    logger.info('Foto de teste validada', {
      filename: testPhoto.originalFilename,
      size: testPhoto.size,
      mimetype: testPhoto.mimetype,
      filepath: testPhoto.filepath
    });

    // Criar instância do serviço
    logger.info('Criando instância do serviço de etiqueta');
    const etiquetaService = new EtiquetaService();

    // Realizar inspeção
    logger.info('Executando inspeção de etiqueta', {
      etiquetaQuestionId: id,
      inspectionSessionId,
      testPhotoSize: testPhoto.size
    });

    const result = await etiquetaService.inspectEtiqueta({
      etiquetaQuestionId: id,
      inspectionSessionId: inspectionSessionId,
      testPhoto: fs.createReadStream(testPhoto.filepath) as any,
      userId: (req as any).user?.id // Se tiver autenticação
    });

    logger.info('Inspeção executada com sucesso', {
      resultId: result.id,
      similarity_percentage: result.similarity_percentage,
      approved: result.approved
    });

    // Limpar arquivo temporário
    try {
      logger.info('Limpando arquivo temporário', { filepath: testPhoto.filepath });
      fs.unlinkSync(testPhoto.filepath);
      logger.info('Arquivo temporário removido com sucesso');
    } catch (cleanupError) {
      logger.warn('Erro ao limpar arquivo temporário', cleanupError, { filepath: testPhoto.filepath });
      // Não falha a requisição por erro de limpeza
    }

    const duration = Date.now() - startTime;
    
    logger.info('Resposta de inspeção enviada com sucesso', {
      etiquetaQuestionId: id,
      resultId: result.id,
      duration
    });

    logger.performance('INSPECTION_API_REQUEST', duration, {
      etiquetaQuestionId: id,
      resultId: result.id,
      similarity_percentage: result.similarity_percentage
    });

    res.status(200).json(result);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    logger.error('Erro ao realizar inspeção', error, {
      etiquetaQuestionId: id,
      duration,
      stack: error.stack
    });

    // Tentar limpar arquivo temporário em caso de erro
    try {
      const testPhoto = (req as any).files?.test_photo?.[0];
      if (testPhoto?.filepath && fs.existsSync(testPhoto.filepath)) {
        logger.info('Limpando arquivo temporário após erro', { filepath: testPhoto.filepath });
        fs.unlinkSync(testPhoto.filepath);
      }
    } catch (cleanupError) {
      logger.warn('Erro ao limpar arquivo temporário após erro', cleanupError);
    }

    res.status(500).json({ 
      message: error.message || 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
