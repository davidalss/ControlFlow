import { createWorker } from 'tesseract.js';
import { logger } from '../utils/logger';

/**
 * Serviço Singleton para gerenciar operações de OCR
 * Mantém uma única instância do worker do Tesseract
 * Gerencia inicialização e limpeza automática de recursos
 */
export class OcrService {
  private static instance: OcrService;
  private worker: any;

  private constructor() {}

  /**
   * Obtém a instância única do serviço OCR (padrão Singleton)
   * @returns Instância do OcrService
   */
  public static getInstance(): OcrService {
    if (!OcrService.instance) {
      OcrService.instance = new OcrService();
    }
    return OcrService.instance;
  }

  /**
   * Inicializa o worker do Tesseract com suporte ao idioma português
   * @throws Error se a inicialização falhar
   */
  public async initialize() {
    try {
      this.worker = await createWorker('por');
      logger.info('OCR service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize OCR service:', error);
      throw new Error('OCR initialization failed');
    }
  }

  /**
   * Reconhece texto em uma imagem codificada em base64
   * @param imageBase64 - Imagem em formato base64
   * @returns Texto reconhecido da imagem
   * @throws Error se o reconhecimento falhar
   */
  public async recognizeText(imageBase64: string): Promise<string> {
    if (!this.worker) {
      await this.initialize();
    }

    try {
      const { data: { text } } = await this.worker.recognize(imageBase64);
      return text;
    } catch (error) {
      logger.error('OCR recognition failed:', error);
      throw new Error('Failed to perform OCR recognition');
    }
  }

  /**
   * Termina o worker do Tesseract e libera recursos
   */
  public async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}
