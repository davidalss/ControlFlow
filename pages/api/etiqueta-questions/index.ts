import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { EtiquetaService } from '@/lib/etiqueta/service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    // Parsear o form data
    const form = formidable({ });
    const [fields, files] = await form.parse(req);

    // Validar campos obrigatórios
    if (!fields.inspection_plan_id || !fields.step_id || !fields.tipo_etiqueta || !fields.limite_aprovacao) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando' });
    }

    // Validar arquivo
    const arquivo = files.arquivo_referencia?.[0];
    if (!arquivo) {
      return res.status(400).json({ message: 'Arquivo de referência é obrigatório' });
    }

    // Criar instância do serviço
    const etiquetaService = new EtiquetaService();

    // Criar pergunta de etiqueta
    const result = await etiquetaService.createEtiquetaQuestion({
      inspection_plan_id: fields.inspection_plan_id[0],
      step_id: fields.step_id[0],
      tipo_etiqueta: fields.tipo_etiqueta[0] as any,
      arquivo_referencia: fs.createReadStream(arquivo.filepath) as any,
      limite_aprovacao: Number(fields.limite_aprovacao[0])
    });

    // Limpar arquivo temporário
    fs.unlinkSync(arquivo.filepath);

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Erro ao criar pergunta de etiqueta:', error);
    res.status(500).json({ message: error.message });
  }
}
