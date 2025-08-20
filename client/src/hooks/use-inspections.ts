import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

export interface Inspection {
  id: string;
  inspectionCode: string;
  fresNf: string;
  supplier: string;
  productId: string;
  productCode: string;
  productName: string;
  lotSize: number;
  inspectionDate: string;
  inspectionPlanId: string;
  inspectorId: string;
  inspectorName: string;
  nqaId: string;
  sampleSize: number;
  acceptanceNumber: number;
  rejectionNumber: number;
  minorDefects: number;
  majorDefects: number;
  criticalDefects: number;
  totalDefects: number;
  status: 'in_progress' | 'completed' | 'approved' | 'rejected';
  autoDecision?: string;
  inspectorDecision?: string;
  rncType?: string;
  rncId?: string;
  rncStatus?: string;
  photos?: any[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInspectionData {
  inspectionCode: string;
  fresNf: string;
  supplier: string;
  productId: string;
  productCode: string;
  productName: string;
  lotSize: number;
  inspectionDate: string;
  inspectionPlanId: string;
  inspectorId: string;
  inspectorName: string;
  nqaId: string;
  sampleSize: number;
  acceptanceNumber: number;
  rejectionNumber: number;
  notes?: string;
}

export interface UpdateInspectionData {
  status?: string;
  inspectorDecision?: string;
  minorDefects?: number;
  majorDefects?: number;
  criticalDefects?: number;
  totalDefects?: number;
  notes?: string;
  photos?: any[];
}

export function useInspections() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);

  // Buscar todas as inspeções
  const fetchInspections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('inspections')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setInspections(data || []);
    } catch (err) {
      console.error('Erro ao buscar inspeções:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar inspeções');
      toast({
        title: "Erro",
        description: "Não foi possível carregar as inspeções",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar inspeção por ID
  const fetchInspectionById = useCallback(async (id: string): Promise<Inspection | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('inspections')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return data;
    } catch (err) {
      console.error('Erro ao buscar inspeção:', err);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da inspeção",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  // Criar nova inspeção
  const createInspection = useCallback(async (inspectionData: CreateInspectionData): Promise<Inspection | null> => {
    try {
      setOperationLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .from('inspections')
        .insert([{
          ...inspectionData,
          minorDefects: 0,
          majorDefects: 0,
          criticalDefects: 0,
          totalDefects: 0,
          status: 'in_progress',
        }])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      setInspections(prev => [data, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Inspeção criada com sucesso",
      });

      return data;
    } catch (err) {
      console.error('Erro ao criar inspeção:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar inspeção');
      toast({
        title: "Erro",
        description: "Não foi possível criar a inspeção",
        variant: "destructive",
      });
      return null;
    } finally {
      setOperationLoading(false);
    }
  }, [toast]);

  // Atualizar inspeção
  const updateInspection = useCallback(async (id: string, updateData: UpdateInspectionData): Promise<Inspection | null> => {
    try {
      setOperationLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('inspections')
        .update({
          ...updateData,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setInspections(prev => prev.map(inspection => 
        inspection.id === id ? data : inspection
      ));

      toast({
        title: "Sucesso",
        description: "Inspeção atualizada com sucesso",
      });

      return data;
    } catch (err) {
      console.error('Erro ao atualizar inspeção:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar inspeção');
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a inspeção",
        variant: "destructive",
      });
      return null;
    } finally {
      setOperationLoading(false);
    }
  }, [toast]);

  // Deletar inspeção
  const deleteInspection = useCallback(async (id: string): Promise<boolean> => {
    try {
      setOperationLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('inspections')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setInspections(prev => prev.filter(inspection => inspection.id !== id));

      toast({
        title: "Sucesso",
        description: "Inspeção excluída com sucesso",
      });

      return true;
    } catch (err) {
      console.error('Erro ao deletar inspeção:', err);
      setError(err instanceof Error ? err.message : 'Erro ao deletar inspeção');
      toast({
        title: "Erro",
        description: "Não foi possível excluir a inspeção",
        variant: "destructive",
      });
      return false;
    } finally {
      setOperationLoading(false);
    }
  }, [toast]);

  // Buscar inspeção por ID para visualização
  const getInspectionDetails = useCallback(async (id: string): Promise<Inspection | null> => {
    try {
      setOperationLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('inspections')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return data;
    } catch (err) {
      console.error('Erro ao buscar detalhes da inspeção:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar detalhes da inspeção');
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da inspeção",
        variant: "destructive",
      });
      return null;
    } finally {
      setOperationLoading(false);
    }
  }, [toast]);

  // Carregar inspeções na inicialização
  useEffect(() => {
    if (user) {
      fetchInspections();
    }
  }, [user, fetchInspections]);

  return {
    inspections,
    loading,
    error,
    operationLoading,
    fetchInspections,
    fetchInspectionById,
    createInspection,
    updateInspection,
    deleteInspection,
    getInspectionDetails,
  };
}
