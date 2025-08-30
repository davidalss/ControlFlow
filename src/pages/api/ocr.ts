import { NextApiRequest, NextApiResponse } from 'next';
import { OcrService } from '../../services/ocrService';
import { withAuth } from '../../middleware/withAuth';
import { logger } from '../../utils/logger';

/**
 * Endpoint da API para processamento de OCR
 * Requer autenticação via JWT
 * Aceita imagens em base64 e retorna o texto reconhecido
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verifica se o método HTTP é POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;

    // Valida se a imagem foi fornecida
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Obtém a instância do serviço OCR e processa a imagem
    const ocrService = OcrService.getInstance();
    const recognizedText = await ocrService.recognizeText(image);

    // Retorna o texto reconhecido
    return res.status(200).json({ text: recognizedText });
  } catch (error) {
    logger.error('OCR API error:', error);
    return res.status(500).json({ error: 'Failed to process image' });
  }
}

// Aplica middleware de autenticação ao handler
export default withAuth(handler);
