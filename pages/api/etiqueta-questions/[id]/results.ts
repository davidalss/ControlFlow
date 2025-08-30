import { NextApiRequest, NextApiResponse } from 'next';
import { EtiquetaService } from '@/lib/etiqueta/service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID da pergunta é obrigatório' });
  }

  try {
    const etiquetaService = new EtiquetaService();
    const results = await etiquetaService.getInspectionResults(id);
    res.status(200).json(results);
  } catch (error: any) {
    console.error('Erro ao buscar resultados:', error);
    res.status(500).json({ message: error.message });
  }
}
