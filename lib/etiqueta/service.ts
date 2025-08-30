import { createClient } from '@supabase/supabase-js';
import { uploadEtiquetaInspecao, uploadEtiquetaReferencia } from './storage';
import { createWorker } from 'tesseract.js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Sistema de logs estruturado para OCR
class OcrLogger {
  private static instance: OcrLogger;
  
  static getInstance(): OcrLogger {
    if (!OcrLogger.instance) {
      OcrLogger.instance = new OcrLogger();
    }
    return OcrLogger.instance;
  }

  info(message: string, data?: any) {
    console.log(`[OCR-INFO] ${new Date().toISOString()} - ${message}`, data || '');
  }

  warn(message: string, data?: any) {
    console.warn(`[OCR-WARN] ${new Date().toISOString()} - ${message}`, data || '');
  }

  error(message: string, error?: any, data?: any) {
    console.error(`[OCR-ERROR] ${new Date().toISOString()} - ${message}`, {
      error: error?.message || error,
      stack: error?.stack,
      ...data
    });
  }

  performance(operation: string, duration: number, data?: any) {
    console.log(`[OCR-PERF] ${new Date().toISOString()} - ${operation} took ${duration}ms`, data || '');
  }

  debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[OCR-DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
    }
  }
}

const logger = OcrLogger.getInstance();

export interface EtiquetaQuestion {
  id: string;
  inspection_plan_id: string;
  step_id: string;
  tipo_etiqueta: 'EAN' | 'DUN' | 'ENCE' | 'ANATEL' | 'INMETRO' | 'ENERGY' | 'QR_CODE';
  arquivo_referencia: string;
  limite_aprovacao: number;
  pdf_original_url?: string;
  created_at: Date;
}

export interface EtiquetaInspectionResult {
  id: string;
  etiqueta_question_id: string;
  inspection_session_id: string;
  foto_enviada: string;
  percentual_similaridade: number;
  resultado_final: 'APROVADO' | 'REPROVADO';
  detalhes_comparacao?: {
    texto_referencia: string;
    texto_enviado: string;
    diferencas_encontradas: string[];
    score_percentage: number;
  };
  created_at: Date;
  created_by?: string;
}

export class EtiquetaService {
  private ocrWorker: any = null;

  /**
   * Inicializa o worker do OCR para processamento de etiquetas
   */
  private async initializeOcrWorker() {
    const startTime = Date.now();
    
    try {
      if (!this.ocrWorker) {
        logger.info('Inicializando worker do OCR', { language: 'por' });
        this.ocrWorker = await createWorker('por');
        logger.info('Worker do OCR inicializado com sucesso');
      }
      
      const duration = Date.now() - startTime;
      logger.performance('OCR_WORKER_INIT', duration);
      
      return this.ocrWorker;
    } catch (error) {
      logger.error('Falha ao inicializar worker do OCR', error);
      throw new Error('Falha ao inicializar OCR worker');
    }
  }

  /**
   * Processa texto de uma imagem usando OCR
   */
  private async extractTextFromImage(imageUrl: string): Promise<string> {
    const startTime = Date.now();
    
    try {
      logger.info('Iniciando extração de texto da imagem', { imageUrl });
      
      const worker = await this.initializeOcrWorker();
      
      // Fazer download da imagem
      logger.debug('Fazendo download da imagem', { imageUrl });
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Falha ao baixar imagem: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      logger.debug('Imagem baixada com sucesso', { 
        size: buffer.length,
        contentType: response.headers.get('content-type')
      });
      
      // Processar com OCR
      logger.info('Processando imagem com OCR');
      const { data: { text } } = await worker.recognize(buffer);
      
      const extractedText = text.trim();
      const duration = Date.now() - startTime;
      
      logger.info('Texto extraído com sucesso', { 
        textLength: extractedText.length,
        preview: extractedText.substring(0, 100) + (extractedText.length > 100 ? '...' : '')
      });
      
      logger.performance('OCR_TEXT_EXTRACTION', duration, { textLength: extractedText.length });
      
      return extractedText;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Falha ao extrair texto da imagem', error, { 
        imageUrl, 
        duration 
      });
      throw new Error(`Falha ao processar imagem com OCR: ${error.message}`);
    }
  }

  /**
   * Calcula similaridade entre dois textos
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const startTime = Date.now();
    
    try {
      if (!text1 || !text2) {
        logger.warn('Um dos textos está vazio para comparação', { 
          text1Length: text1?.length || 0, 
          text2Length: text2?.length || 0 
        });
        return 0;
      }
      
      // Normalizar textos
      const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim();
      const normalized1 = normalize(text1);
      const normalized2 = normalize(text2);
      
      if (normalized1 === normalized2) {
        logger.info('Textos idênticos após normalização', { similarity: 1.0 });
        return 1.0;
      }
      
      // Algoritmo de similaridade baseado em distância de Levenshtein
      const distance = this.levenshteinDistance(normalized1, normalized2);
      const maxLength = Math.max(normalized1.length, normalized2.length);
      const similarity = maxLength > 0 ? 1 - (distance / maxLength) : 0;
      
      const duration = Date.now() - startTime;
      
      logger.info('Similaridade calculada', { 
        similarity: similarity.toFixed(4),
        distance,
        maxLength,
        text1Length: normalized1.length,
        text2Length: normalized2.length
      });
      
      logger.performance('TEXT_SIMILARITY_CALC', duration, { similarity });
      
      return similarity;
    } catch (error) {
      logger.error('Erro ao calcular similaridade de texto', error, { text1, text2 });
      return 0;
    }
  }

  /**
   * Calcula distância de Levenshtein entre duas strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    try {
      const matrix = [];
      
      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
      }
      
      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
      }
      
      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      
      const distance = matrix[str2.length][str1.length];
      logger.debug('Distância de Levenshtein calculada', { distance, str1Length: str1.length, str2Length: str2.length });
      
      return distance;
    } catch (error) {
      logger.error('Erro ao calcular distância de Levenshtein', error, { str1, str2 });
      return Math.max(str1.length, str2.length); // Fallback para máxima distância
    }
  }

  /**
   * Encontra diferenças entre dois textos
   */
  private findDifferences(text1: string, text2: string): string[] {
    try {
      const differences: string[] = [];
      
      if (!text1 || !text2) {
        differences.push('Um dos textos está vazio');
        logger.warn('Texto vazio detectado na comparação', { 
          text1Empty: !text1, 
          text2Empty: !text2 
        });
        return differences;
      }
      
      // Normalizar textos
      const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim();
      const normalized1 = normalize(text1);
      const normalized2 = normalize(text2);
      
      if (normalized1 !== normalized2) {
        // Comparar caracteres
        const maxLength = Math.max(normalized1.length, normalized2.length);
        for (let i = 0; i < maxLength; i++) {
          if (normalized1[i] !== normalized2[i]) {
            differences.push(`Diferença na posição ${i + 1}: "${normalized1[i] || 'vazio'}" vs "${normalized2[i] || 'vazio'}"`);
          }
        }
        
        // Verificar comprimentos diferentes
        if (normalized1.length !== normalized2.length) {
          differences.push(`Comprimentos diferentes: ${normalized1.length} vs ${normalized2.length} caracteres`);
        }
        
        logger.info('Diferenças encontradas entre textos', { 
          differencesCount: differences.length,
          differences: differences.slice(0, 5) // Log apenas as primeiras 5 diferenças
        });
      } else {
        logger.info('Nenhuma diferença encontrada entre os textos');
      }
      
      return differences.length > 0 ? differences : ['Textos idênticos'];
    } catch (error) {
      logger.error('Erro ao encontrar diferenças entre textos', error, { text1, text2 });
      return ['Erro ao comparar textos'];
    }
  }

  // Criar nova pergunta de etiqueta
  async createEtiquetaQuestion(data: {
    inspection_plan_id: string;
    step_id: string;
    tipo_etiqueta: EtiquetaQuestion['tipo_etiqueta'];
    arquivo_referencia: File;
    limite_aprovacao: number;
  }) {
    const startTime = Date.now();
    
    try {
      logger.info('Criando nova pergunta de etiqueta', {
        inspection_plan_id: data.inspection_plan_id,
        step_id: data.step_id,
        tipo_etiqueta: data.tipo_etiqueta,
        limite_aprovacao: data.limite_aprovacao
      });

      // 1. Gerar ID único para a etiqueta
      const etiquetaId = crypto.randomUUID();
      logger.debug('ID único gerado para etiqueta', { etiquetaId });

      // 2. Fazer upload do arquivo de referência
      logger.info('Fazendo upload do arquivo de referência');
      const arquivoReferenciaUrl = await uploadEtiquetaReferencia(
        data.arquivo_referencia,
        etiquetaId
      );
      logger.info('Upload do arquivo de referência concluído', { arquivoReferenciaUrl });

      // 3. Criar registro no banco
      logger.info('Criando registro no banco de dados');
      const { data: etiqueta, error } = await supabase
        .from('etiqueta_questions')
        .insert([
          {
            id: etiquetaId,
            inspection_plan_id: data.inspection_plan_id,
            step_id: data.step_id,
            tipo_etiqueta: data.tipo_etiqueta,
            arquivo_referencia: arquivoReferenciaUrl,
            limite_aprovacao: data.limite_aprovacao,
            pdf_original_url: arquivoReferenciaUrl
          }
        ])
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar registro no banco', error, { etiquetaId });
        throw error;
      }

      const duration = Date.now() - startTime;
      logger.info('Pergunta de etiqueta criada com sucesso', { etiquetaId, duration });
      logger.performance('CREATE_ETIQUETA_QUESTION', duration, { etiquetaId });

      return etiqueta;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Falha ao criar pergunta de etiqueta', error, { duration });
      throw error;
    }
  }

  // Realizar inspeção de etiqueta
  async inspectEtiqueta(data: {
    etiquetaQuestionId: string;
    inspectionSessionId: string;
    testPhoto: File;
    userId?: string;
  }) {
    const startTime = Date.now();
    
    try {
      logger.info('Iniciando inspeção de etiqueta', {
        etiquetaQuestionId: data.etiquetaQuestionId,
        inspectionSessionId: data.inspectionSessionId,
        userId: data.userId,
        testPhotoSize: data.testPhoto.size,
        testPhotoType: data.testPhoto.type
      });

      // 1. Upload da foto de teste
      logger.info('Fazendo upload da foto de teste');
      const fotoUrl = await uploadEtiquetaInspecao(
        data.testPhoto,
        data.inspectionSessionId
      );
      logger.info('Upload da foto de teste concluído', { fotoUrl });

      // 2. Buscar etiqueta de referência
      logger.info('Buscando etiqueta de referência no banco');
      const { data: etiquetaQuestion, error: fetchError } = await supabase
        .from('etiqueta_questions')
        .select('*')
        .eq('id', data.etiquetaQuestionId)
        .single();

      if (fetchError) {
        logger.error('Erro ao buscar etiqueta de referência', fetchError, { etiquetaQuestionId: data.etiquetaQuestionId });
        throw new Error('Etiqueta não encontrada');
      }

      if (!etiquetaQuestion) {
        logger.warn('Etiqueta de referência não encontrada', { etiquetaQuestionId: data.etiquetaQuestionId });
        throw new Error('Etiqueta não encontrada');
      }

      logger.info('Etiqueta de referência encontrada', {
        tipo_etiqueta: etiquetaQuestion.tipo_etiqueta,
        limite_aprovacao: etiquetaQuestion.limite_aprovacao
      });

      // 3. Executar análise OCR e comparação
      logger.info('Executando análise OCR e comparação');
      const resultado = await this.compareImages(
        etiquetaQuestion.arquivo_referencia,
        fotoUrl
      );

      // 4. Determinar resultado final
      const isApproved = resultado.score >= etiquetaQuestion.limite_aprovacao;
      logger.info('Resultado da inspeção determinado', {
        score: resultado.score,
        limite_aprovacao: etiquetaQuestion.limite_aprovacao,
        isApproved
      });

      // 5. Salvar resultado
      logger.info('Salvando resultado da inspeção no banco');
      const { data: inspectionResult, error: saveError } = await supabase
        .from('etiqueta_inspection_results')
        .insert([
          {
            etiqueta_question_id: data.etiquetaQuestionId,
            inspection_session_id: data.inspectionSessionId,
            foto_enviada: fotoUrl,
            percentual_similaridade: resultado.score,
            resultado_final: isApproved ? 'APROVADO' : 'REPROVADO',
            detalhes_comparacao: resultado.details,
            created_by: data.userId
          }
        ])
        .select()
        .single();

      if (saveError) {
        logger.error('Erro ao salvar resultado da inspeção', saveError);
        throw saveError;
      }

      const duration = Date.now() - startTime;
      const finalResult = {
        ...inspectionResult,
        similarity_percentage: resultado.score * 100,
        approved: isApproved
      };

      logger.info('Inspeção de etiqueta concluída com sucesso', {
        resultId: inspectionResult.id,
        similarity_percentage: finalResult.similarity_percentage,
        approved: finalResult.approved,
        duration
      });

      logger.performance('INSPECT_ETIQUETA', duration, {
        resultId: inspectionResult.id,
        similarity_percentage: finalResult.similarity_percentage
      });

      return finalResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Falha na inspeção de etiqueta', error, { duration });
      throw error;
    }
  }

  // Comparar imagens usando OCR real
  private async compareImages(referenceUrl: string, testUrl: string) {
    const startTime = Date.now();
    
    try {
      logger.info('Iniciando comparação de etiquetas com OCR', { referenceUrl, testUrl });
      
      // 1. Extrair texto da imagem de referência
      logger.info('Extraindo texto da etiqueta de referência');
      const textoReferencia = await this.extractTextFromImage(referenceUrl);
      logger.info('Texto de referência extraído', { 
        textLength: textoReferencia.length,
        preview: textoReferencia.substring(0, 100) + (textoReferencia.length > 100 ? '...' : '')
      });
      
      // 2. Extrair texto da imagem de teste
      logger.info('Extraindo texto da etiqueta de teste');
      const textoEnviado = await this.extractTextFromImage(testUrl);
      logger.info('Texto de teste extraído', { 
        textLength: textoEnviado.length,
        preview: textoEnviado.substring(0, 100) + (textoEnviado.length > 100 ? '...' : '')
      });
      
      // 3. Calcular similaridade
      logger.info('Calculando similaridade entre textos');
      const similarityScore = this.calculateTextSimilarity(textoReferencia, textoEnviado);
      logger.info('Score de similaridade calculado', { similarityScore });
      
      // 4. Encontrar diferenças
      logger.info('Identificando diferenças entre textos');
      const diferencas = this.findDifferences(textoReferencia, textoEnviado);
      logger.info('Diferenças identificadas', { 
        differencesCount: diferencas.length,
        differences: diferencas.slice(0, 3) // Log apenas as primeiras 3 diferenças
      });
      
      const duration = Date.now() - startTime;
      
      const result = {
        success: true,
        score: similarityScore,
        details: {
          texto_referencia: textoReferencia,
          texto_enviado: textoEnviado,
          diferencas_encontradas: diferencas,
          score_percentage: similarityScore * 100
        }
      };

      logger.info('Comparação de imagens concluída com sucesso', {
        score: similarityScore,
        differencesCount: diferencas.length,
        duration
      });

      logger.performance('COMPARE_IMAGES', duration, { score: similarityScore });
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Falha na comparação de imagens', error, { 
        referenceUrl, 
        testUrl, 
        duration 
      });
      throw new Error(`Falha na comparação de etiquetas: ${error.message}`);
    }
  }

  // Buscar resultados de inspeção com informações do usuário
  async getInspectionResults(etiquetaQuestionId: string) {
    const startTime = Date.now();
    
    try {
      logger.info('Buscando resultados de inspeção', { etiquetaQuestionId });
      
      const { data, error } = await supabase
        .from('etiqueta_inspection_results')
        .select(`
          *,
          users(
            email,
            name:user_metadata->name
          )
        `)
        .eq('etiqueta_question_id', etiquetaQuestionId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar resultados de inspeção', error, { etiquetaQuestionId });
        throw error;
      }

      // Formatar dados para exibição
      const formattedResults = data?.map(item => ({
        ...item,
        similarity_percentage: item.percentual_similaridade ? 
          (item.percentual_similaridade * 100).toFixed(2) : '0.00',
        inspector_name: item.users?.name || 'N/A',
        inspector_email: item.users?.email || 'N/A'
      })) || [];

      const duration = Date.now() - startTime;
      
      logger.info('Resultados de inspeção recuperados com sucesso', {
        etiquetaQuestionId,
        resultsCount: formattedResults.length,
        duration
      });

      logger.performance('GET_INSPECTION_RESULTS', duration, { resultsCount: formattedResults.length });

      return formattedResults;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Falha ao buscar resultados de inspeção', error, { etiquetaQuestionId, duration });
      throw error;
    }
  }

  /**
   * Limpa recursos do OCR
   */
  async cleanup() {
    try {
      if (this.ocrWorker) {
        logger.info('Terminando worker do OCR');
        await this.ocrWorker.terminate();
        this.ocrWorker = null;
        logger.info('Worker do OCR terminado com sucesso');
      }
    } catch (error) {
      logger.error('Erro ao limpar recursos do OCR', error);
    }
  }
}
