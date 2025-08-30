import { createClient } from '@supabase/supabase-js';
import { uploadEtiquetaInspecao, uploadEtiquetaReferencia } from './storage';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  // Criar nova pergunta de etiqueta
  async createEtiquetaQuestion(data: {
    inspection_plan_id: string;
    step_id: string;
    tipo_etiqueta: EtiquetaQuestion['tipo_etiqueta'];
    arquivo_referencia: File;
    limite_aprovacao: number;
  }) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await fetch('/api/etiqueta-questions', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar pergunta');
    }

    return response.json();
  }

  // Realizar inspeção de etiqueta
  async inspectEtiqueta(data: {
    etiquetaQuestionId: string;
    inspectionSessionId: string;
    testPhoto: File;
    userId?: string;
  }) {
    const formData = new FormData();
    formData.append('inspection_session_id', data.inspectionSessionId);
    formData.append('test_photo', data.testPhoto);
    
    const response = await fetch(`/api/etiqueta-questions/${data.etiquetaQuestionId}/inspect`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao realizar inspeção');
    }

    return response.json();
  }

  // Buscar resultados de inspeção
  async getInspectionResults(etiquetaQuestionId: string) {
    const response = await fetch(`/api/etiqueta-questions/${etiquetaQuestionId}/results`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao buscar resultados');
    }

    return response.json();
  }
}
