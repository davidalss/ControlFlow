import { api } from './api';

/**
 * Interface para o resultado do OCR
 */
export interface OcrResult {
  text: string;
}

/**
 * Utilitário cliente para fazer requisições ao serviço de OCR
 * Gerencia erros e formata respostas
 * Inclui tipagem TypeScript para melhor desenvolvimento
 * 
 * @param imageBase64 - Imagem codificada em base64 para processamento
 * @returns Promise com o texto reconhecido
 * @throws Error se a requisição falhar
 */
export const performOcr = async (imageBase64: string): Promise<string> => {
  try {
    const response = await api.post<OcrResult>('/api/ocr', { image: imageBase64 });
    return response.data.text;
  } catch (error) {
    console.error('OCR request failed:', error);
    throw new Error('Failed to perform OCR analysis');
  }
};
