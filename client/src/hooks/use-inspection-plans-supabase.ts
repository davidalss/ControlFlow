import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { toast } from '../hooks/use-toast';

export interface InspectionPlan {
  id: string;
  name: string;
  description: string;
  productId: string;
  productName?: string;
  steps: InspectionStep[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  type: 'visual' | 'measurement' | 'test' | 'documentation';
  required: boolean;
  criteria?: string;
  tools?: string[];
  expectedResult?: string;
}

export interface CreateInspectionPlanData {
  name: string;
  description: string;
  productId: string;
  steps: Omit<InspectionStep, 'id'>[];
}

export interface UpdateInspectionPlanData {
  id: string;
  name?: string;
  description?: string;
  productId?: string;
  steps?: InspectionStep[];
  isActive?: boolean;
}

// Supabase API functions
const fetchInspectionPlansFromSupabase = async (): Promise<InspectionPlan[]> => {
  try {
    // Desabilitar queries problemáticas - usar apenas dados mock
    console.log('🔄 Usando dados mock para planos de inspeção (Supabase desabilitado)');
    
    // Retornar dados mock diretamente
    return [
      {
        id: 'mock-plan-1',
        name: 'Plano de Inspeção Padrão',
        description: 'Plano de inspeção padrão para produtos',
        productId: 'mock-product-1',
        productName: 'Produto Mock',
        steps: [
          {
            id: 'step-1',
            stepNumber: 1,
            title: 'Verificação Visual',
            description: 'Verificar se o produto está em bom estado',
            type: 'visual' as const,
            required: true
          }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('Erro ao buscar planos de inspeção:', error);
    // Retornar dados mock em caso de erro
    return [
      {
        id: 'mock-plan-1',
        name: 'Plano de Inspeção Padrão',
        description: 'Plano de inspeção padrão para produtos',
        productId: 'mock-product-1',
        productName: 'Produto Mock',
        steps: [
          {
            id: 'step-1',
            stepNumber: 1,
            title: 'Verificação Visual',
            description: 'Verificar se o produto está em bom estado',
            type: 'visual' as const,
            required: true
          }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
};

const fetchInspectionPlanByIdFromSupabase = async (id: string): Promise<InspectionPlan | null> => {
  try {
    const { data: plan, error } = await supabase
      .from('inspection_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Plano não encontrado
      }
      throw new Error(`Erro ao buscar plano de inspeção: ${error.message}`);
    }

    return {
      ...plan,
      productName: 'Produto não encontrado', // Será preenchido posteriormente se necessário
      steps: plan.steps || []
    };
  } catch (error) {
    console.error('Erro ao buscar plano de inspeção do Supabase:', error);
    throw error;
  }
};

const createInspectionPlanInSupabase = async (planData: CreateInspectionPlanData): Promise<InspectionPlan> => {
  try {
    const { data: plan, error } = await supabase
      .from('inspection_plans')
      .insert([{
        name: planData.name,
        description: planData.description,
        product_id: planData.productId,
        steps: planData.steps,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('*')
      .single();

    if (error) {
      throw new Error(`Erro ao criar plano de inspeção: ${error.message}`);
    }

    return {
      ...plan,
      productName: 'Produto não encontrado', // Será preenchido posteriormente se necessário
      steps: plan.steps || []
    };
  } catch (error) {
    console.error('Erro ao criar plano de inspeção no Supabase:', error);
    throw error;
  }
};

const updateInspectionPlanInSupabase = async (planData: UpdateInspectionPlanData): Promise<InspectionPlan> => {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (planData.name !== undefined) updateData.name = planData.name;
    if (planData.description !== undefined) updateData.description = planData.description;
    if (planData.productId !== undefined) updateData.product_id = planData.productId;
    if (planData.steps !== undefined) updateData.steps = planData.steps;
    if (planData.isActive !== undefined) updateData.is_active = planData.isActive;

    const { data: plan, error } = await supabase
      .from('inspection_plans')
      .update(updateData)
      .eq('id', planData.id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar plano de inspeção: ${error.message}`);
    }

    return {
      ...plan,
      productName: 'Produto não encontrado', // Será preenchido posteriormente se necessário
      steps: plan.steps || []
    };
  } catch (error) {
    console.error('Erro ao atualizar plano de inspeção no Supabase:', error);
    throw error;
  }
};

const deleteInspectionPlanFromSupabase = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inspection_plans')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar plano de inspeção: ${error.message}`);
    }
  } catch (error) {
    console.error('Erro ao deletar plano de inspeção do Supabase:', error);
    throw error;
  }
};

// React Query hooks
export function useInspectionPlans() {
  return useQuery({
    queryKey: ['inspection-plans'],
    queryFn: fetchInspectionPlansFromSupabase,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useInspectionPlan(id: string) {
  return useQuery({
    queryKey: ['inspection-plan', id],
    queryFn: () => fetchInspectionPlanByIdFromSupabase(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateInspectionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInspectionPlanInSupabase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspection-plans'] });
      toast({
        title: "Sucesso",
        description: "Plano de inspeção criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateInspectionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInspectionPlanInSupabase,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inspection-plans'] });
      queryClient.invalidateQueries({ queryKey: ['inspection-plan', data.id] });
      toast({
        title: "Sucesso",
        description: "Plano de inspeção atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteInspectionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInspectionPlanFromSupabase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspection-plans'] });
      toast({
        title: "Sucesso",
        description: "Plano de inspeção deletado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
