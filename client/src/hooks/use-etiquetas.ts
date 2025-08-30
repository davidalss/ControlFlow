import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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

export function useEtiquetas(planId?: string) {
  const [loading, setLoading] = useState(true);
  const [etiquetas, setEtiquetas] = useState<EtiquetaQuestion[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!planId) return;
    
    const fetchEtiquetas = async () => {
      try {
        const { data, error } = await supabase
          .from('etiqueta_questions')
          .select('*')
          .eq('inspection_plan_id', planId);

        if (error) throw error;
        setEtiquetas(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchEtiquetas();
  }, [planId]);

  const addEtiqueta = async (data: {
    inspection_plan_id: string;
    step_id: string;
    tipo_etiqueta: EtiquetaQuestion['tipo_etiqueta'];
    arquivo_referencia: string;
    limite_aprovacao: number;
  }) => {
    try {
      const { data: newEtiqueta, error } = await supabase
        .from('etiqueta_questions')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      setEtiquetas(prev => [...prev, newEtiqueta]);
      return newEtiqueta;
    } catch (err) {
      throw err;
    }
  };

  const registerInspection = async (data: {
    etiqueta_question_id: string;
    inspection_session_id: string;
    foto_enviada: string;
    percentual_similaridade: number;
    resultado_final: 'APROVADO' | 'REPROVADO';
    detalhes_comparacao?: any;
  }) => {
    try {
      const { data: result, error } = await supabase
        .from('etiqueta_inspection_results')
        .insert([{
          ...data,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    etiquetas,
    loading,
    error,
    addEtiqueta,
    registerInspection
  };
}
