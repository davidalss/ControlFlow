import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { toast } from '../hooks/use-toast';

export interface Supplier {
  id: string;
  code: string;
  name: string;
  type: 'imported' | 'national';
  country: string;
  category: string;
  status: 'active' | 'suspended' | 'under_review' | 'blacklisted';
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  website?: string;
  rating: number;
  performance?: string;
  lastAudit?: string;
  nextAudit?: string;
  auditScore: number;
  observations?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierProduct {
  id: string;
  supplierId: string;
  productId: string;
  isActive: boolean;
  createdAt: string;
  product: {
    id: string;
    code: string;
    description: string;
    category: string;
    businessUnit: string;
  };
}

export interface SupplierEvaluation {
  id: string;
  supplierId: string;
  evaluationDate: string;
  evaluator: string;
  qualityScore: number;
  deliveryScore: number;
  serviceScore: number;
  overallScore: number;
  comments?: string;
  recommendations?: string;
  createdAt: string;
}

export interface SupplierAudit {
  id: string;
  supplierId: string;
  auditDate: string;
  auditor: string;
  auditType: 'initial' | 'surveillance' | 'renewal' | 'special';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  score: number;
  findings?: string;
  recommendations?: string;
  nextAuditDate?: string;
  createdAt: string;
}

export interface CreateSupplierData {
  code: string;
  name: string;
  type: 'imported' | 'national';
  country: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  website?: string;
  rating: number;
  performance?: string;
  lastAudit?: string;
  nextAudit?: string;
  auditScore: number;
  observations?: string;
}

export interface UpdateSupplierData extends Partial<CreateSupplierData> {
  id: string;
}

// Supabase API functions
const fetchSuppliersFromSupabase = async (filters?: {
  search?: string;
  status?: string;
  type?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{ suppliers: Supplier[]; total: number }> => {
  try {
    let query = supabase
      .from('suppliers')
      .select('*', { count: 'exact' });

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.page && filters?.limit) {
      const from = (filters.page - 1) * filters.limit;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    query = query.order('created_at', { ascending: false });

    const { data: suppliers, error, count } = await query;

    if (error) {
      throw new Error(`Erro ao buscar fornecedores: ${error.message}`);
    }

    return {
      suppliers: suppliers || [],
      total: count || 0
    };
  } catch (error) {
    console.error('Erro ao buscar fornecedores do Supabase:', error);
    throw error;
  }
};

const fetchSupplierFromSupabase = async (id: string): Promise<Supplier> => {
  try {
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar fornecedor: ${error.message}`);
    }

    return supplier;
  } catch (error) {
    console.error('Erro ao buscar fornecedor do Supabase:', error);
    throw error;
  }
};

const createSupplierInSupabase = async (data: CreateSupplierData): Promise<Supplier> => {
  try {
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .insert([{
        ...data,
        isActive: true,
        createdBy: (await supabase.auth.getUser()).data.user?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar fornecedor: ${error.message}`);
    }

    return supplier;
  } catch (error) {
    console.error('Erro ao criar fornecedor no Supabase:', error);
    throw error;
  }
};

const updateSupplierInSupabase = async (data: UpdateSupplierData): Promise<Supplier> => {
  try {
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .update({
        ...data,
        updatedAt: new Date().toISOString()
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar fornecedor: ${error.message}`);
    }

    return supplier;
  } catch (error) {
    console.error('Erro ao atualizar fornecedor no Supabase:', error);
    throw error;
  }
};

const deleteSupplierFromSupabase = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar fornecedor: ${error.message}`);
    }
  } catch (error) {
    console.error('Erro ao deletar fornecedor do Supabase:', error);
    throw error;
  }
};

// React Query hooks
export function useSuppliers(filters?: {
  search?: string;
  status?: string;
  type?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: () => fetchSuppliersFromSupabase(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => fetchSupplierFromSupabase(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSupplierInSupabase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Sucesso",
        description: "Fornecedor criado com sucesso!",
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

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSupplierInSupabase,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', data.id] });
      toast({
        title: "Sucesso",
        description: "Fornecedor atualizado com sucesso!",
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

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSupplierFromSupabase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Sucesso",
        description: "Fornecedor deletado com sucesso!",
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

// Funções adicionais para compatibilidade
export function useSuppliersStats() {
  return useQuery({
    queryKey: ['suppliers-stats'],
    queryFn: async () => {
      // Implementação básica para stats
      const { data: suppliers } = await supabase
        .from('suppliers')
        .select('status, type, category');
      
      const stats = {
        total: suppliers?.length || 0,
        active: suppliers?.filter(s => s.status === 'active').length || 0,
        suspended: suppliers?.filter(s => s.status === 'suspended').length || 0,
        underReview: suppliers?.filter(s => s.status === 'under_review').length || 0,
        blacklisted: suppliers?.filter(s => s.status === 'blacklisted').length || 0,
        imported: suppliers?.filter(s => s.type === 'imported').length || 0,
        national: suppliers?.filter(s => s.type === 'national').length || 0,
      };
      
      return stats;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      // Implementação básica para avaliações
      const { data: evaluation, error } = await supabase
        .from('supplier_evaluations')
        .insert([{
          ...data,
          createdAt: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar avaliação: ${error.message}`);
      }

      return evaluation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Sucesso",
        description: "Avaliação criada com sucesso!",
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

export function useCreateAudit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      // Implementação básica para auditorias
      const { data: audit, error } = await supabase
        .from('supplier_audits')
        .insert([{
          ...data,
          createdAt: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar auditoria: ${error.message}`);
      }

      return audit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Sucesso",
        description: "Auditoria criada com sucesso!",
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

export function useClearMockSuppliers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Implementação básica para limpar dados mock
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .like('code', 'MOCK%');

      if (error) {
        throw new Error(`Erro ao limpar dados mock: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Sucesso",
        description: "Dados mock removidos com sucesso!",
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

// Tipos adicionais para compatibilidade
export interface CreateEvaluationData {
  supplierId: string;
  evaluationDate: string;
  evaluator: string;
  qualityScore: number;
  deliveryScore: number;
  serviceScore: number;
  overallScore: number;
  comments?: string;
  recommendations?: string;
}

export interface CreateAuditData {
  supplierId: string;
  auditDate: string;
  auditor: string;
  auditType: 'initial' | 'surveillance' | 'renewal' | 'special';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  score: number;
  findings?: string;
  recommendations?: string;
  nextAuditDate?: string;
}
