import { createWorker } from 'tesseract.js';
import { supabase } from '../lib/supabase';
import fetch from 'node-fetch';
import sharp from 'sharp';

interface OCRResult {
  success: boolean;
  text?: string;
  error?: string;
}

export class OCRService {
  private worker: any;

  constructor() {
    this.initWorker();
  }

  private async initWorker() {
    this.worker = await createWorker({
      logger: process.env.NODE_ENV === 'development' ? m => console.log(m) : undefined,
      // Usando caminho da web para os arquivos do Tesseract
      workerPath: 'https://unpkg.com/tesseract.js@v4.0.1/dist/worker.min.js',
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      corePath: 'https://unpkg.com/tesseract.js-core@v4.0.1/tesseract-core.wasm.js',
    });
    await this.worker.loadLanguage('por');
    await this.worker.initialize('por');
  }

  private async preprocessImage(imageUrl: string): Promise<Buffer> {
    const response = await fetch(imageUrl);
    const imageBuffer = await response.arrayBuffer();
    
    return await sharp(Buffer.from(imageBuffer))
      .normalize() // Normalizar contraste
      .modulate({ brightness: 1.2 }) // Aumentar brilho
      .sharpen() // Melhorar nitidez
      .threshold(128) // Binarização
      .toBuffer();
  }

  public async performOCR(imageUrl: string): Promise<OCRResult> {
    try {
      // Pré-processar imagem
      const processedImage = await this.preprocessImage(imageUrl);
      
      // Executar OCR
      const { data: { text } } = await this.worker.recognize(processedImage);
      
      return {
        success: true,
        text: text
      };
    } catch (error: any) {
      console.error('Erro no OCR:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  public async compareTexts(text1: string, text2: string): Promise<number> {
    // Função de similaridade usando distância de Levenshtein
    function levenshteinDistance(str1: string, str2: string): number {
      const m = str1.length;
      const n = str2.length;
      const dp: number[][] = Array.from({ length: m + 1 }, () => 
        Array.from({ length: n + 1 }, () => 0)
      );

      for (let i = 0; i <= m; i++) dp[i][0] = i;
      for (let j = 0; j <= n; j++) dp[0][j] = j;

      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (str1[i - 1] === str2[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1];
          } else {
            dp[i][j] = Math.min(
              dp[i - 1][j - 1] + 1,
              dp[i - 1][j] + 1,
              dp[i][j - 1] + 1
            );
          }
        }
      }

      return dp[m][n];
    }

    // Normalizar textos
    const normalizeText = (text: string) => {
      return text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const normalized1 = normalizeText(text1);
    const normalized2 = normalizeText(text2);

    // Calcular similaridade
    const maxLength = Math.max(normalized1.length, normalized2.length);
    const distance = levenshteinDistance(normalized1, normalized2);
    const similarity = 1 - (distance / maxLength);

    return similarity;
  }

  public async compareImages(referenceUrl: string, testUrl: string): Promise<{
    success: boolean;
    score?: number;
    details?: {
      texto_referencia: string;
      texto_enviado: string;
      diferencas_encontradas: string[];
    };
    error?: string;
  }> {
    try {
      // 1. Executar OCR nas duas imagens
      const [referenceResult, testResult] = await Promise.all([
        this.performOCR(referenceUrl),
        this.performOCR(testUrl)
      ]);

      if (!referenceResult.success || !testResult.success) {
        throw new Error('Falha ao processar uma ou ambas as imagens');
      }

      // 2. Calcular similaridade
      const score = await this.compareTexts(
        referenceResult.text!,
        testResult.text!
      );

      // 3. Encontrar diferenças
      const differences = this.findDifferences(
        referenceResult.text!,
        testResult.text!
      );

      return {
        success: true,
        score,
        details: {
          texto_referencia: referenceResult.text!,
          texto_enviado: testResult.text!,
          diferencas_encontradas: differences
        }
      };
    } catch (error: any) {
      console.error('Erro na comparação:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private findDifferences(text1: string, text2: string): string[] {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    const differences: string[] = [];

    // Palavras em text1 que não estão em text2
    for (const word of words1) {
      if (!words2.has(word)) {
        differences.push(`Faltando: ${word}`);
      }
    }

    // Palavras em text2 que não estão em text1
    for (const word of words2) {
      if (!words1.has(word)) {
        differences.push(`Adicional: ${word}`);
      }
    }

    return differences;
  }

  public async cleanup() {
    if (this.worker) {
      await this.worker.terminate();
    }
  }
}
