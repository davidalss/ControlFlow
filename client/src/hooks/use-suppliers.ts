import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { toast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';

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
  eventType: 'container_receipt' | 'audit' | 'quality_review' | 'performance_review';
  eventDescription?: string;
  qualityScore: number;
  deliveryScore: number;
  costScore: number;
  communicationScore: number;
  technicalScore: number;
  overallScore: number;
  strengths?: string;
  weaknesses?: string;
  recommendations?: string;
  observations?: string;
  evaluatedBy: string;
  createdAt: string;
}

export interface SupplierAudit {
  id: string;
  supplierId: string;
  auditDate: string;
  auditor: string;
  auditType: 'initial' | 'surveillance' | 'recertification' | 'follow_up';
  score: number;
  status: 'passed' | 'failed' | 'conditional';
  findings?: string;
  recommendations?: string;
  correctiveActions?: string;
  nextAuditDate?: string;
  isActive: boolean;
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
  observations?: string;
  productIds?: string[];
}

export interface UpdateSupplierData extends Partial<CreateSupplierData> {
  status?: 'active' | 'suspended' | 'under_review' | 'blacklisted';
}

export interface CreateEvaluationData {
  evaluationDate?: string;
  eventType: 'container_receipt' | 'audit' | 'quality_review' | 'performance_review';
  eventDescription?: string;
  qualityScore: number;
  deliveryScore: number;
  costScore: number;
  communicationScore: number;
  technicalScore: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  observations?: string;
}

export interface CreateAuditData {
  auditDate?: string;
  auditor: string;
  auditType: 'initial' | 'surveillance' | 'recertification' | 'follow_up';
  score: number;
  status: 'passed' | 'failed' | 'conditional';
  findings?: string[];
  recommendations?: string[];
  correctiveActions?: string[];
  nextAuditDate?: string;
}

export interface SuppliersFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  category?: string;
  country?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SuppliersStats {
  totalSuppliers: number;
  suppliersByStatus: Array<{ status: string; count: number }>;
  suppliersByType: Array<{ type: string; count: number }>;
  suppliersByCountry: Array<{ country: string; count: number }>;
  averageRating: number;
}

// Hook para listar fornecedores
export const useSuppliers = (filters: SuppliersFilters = {}) => {
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: async (): Promise<{ suppliers: Supplier[]; pagination: any }> => {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await apiRequest('GET', `/api/suppliers?${params.toString()}`);
      return response.json();
    },
  });
};

// Hook para buscar fornecedor específico
export const useSupplier = (id: string) => {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: async (): Promise<{
      supplier: Supplier;
      products: SupplierProduct[];
      evaluations: SupplierEvaluation[];
      audits: SupplierAudit[];
    }> => {
      const response = await apiRequest('GET', `/api/suppliers/${id}`);
      return response.json();
    },
    enabled: !!id,
  });
};

// Hook para estatísticas de fornecedores
export const useSuppliersStats = () => {
  return useQuery({
    queryKey: ['suppliers-stats'],
    queryFn: async (): Promise<SuppliersStats> => {
      const response = await apiRequest('GET', '/api/suppliers/stats/overview');
      return response.json();
    },
  });
};

// Hook para avaliações de fornecedor
export const useSupplierEvaluations = (supplierId: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['supplier-evaluations', supplierId, page, limit],
    queryFn: async (): Promise<{ evaluations: SupplierEvaluation[]; pagination: any }> => {
      const response = await apiRequest('GET', `/api/suppliers/${supplierId}/evaluations?page=${page}&limit=${limit}`);
      return response.json();
    },
    enabled: !!supplierId,
  });
};

// Hook para auditorias de fornecedor
export const useSupplierAudits = (supplierId: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['supplier-audits', supplierId, page, limit],
    queryFn: async (): Promise<{ audits: SupplierAudit[]; pagination: any }> => {
      const response = await apiRequest('GET', `/api/suppliers/${supplierId}/audits?page=${page}&limit=${limit}`);
      return response.json();
    },
    enabled: !!supplierId,
  });
};

// Hook para criar fornecedor
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSupplierData): Promise<Supplier> => {
      const response = await apiRequest('POST', '/api/suppliers', data);
      const result = await response.json();
      return result.supplier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Fornecedor criado com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para atualizar fornecedor
export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSupplierData }): Promise<Supplier> => {
      const response = await apiRequest('PUT', `/api/suppliers/${id}`, data);
      const result = await response.json();
      return result.supplier;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', id] });
      queryClient.invalidateQueries({ queryKey: ['suppliers-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Fornecedor atualizado com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para deletar fornecedor
export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiRequest('DELETE', `/api/suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Fornecedor deletado com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para criar avaliação
export const useCreateEvaluation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ supplierId, data }: { supplierId: string; data: CreateEvaluationData }): Promise<SupplierEvaluation> => {
      const response = await apiRequest('POST', `/api/suppliers/${supplierId}/evaluations`, data);
      const result = await response.json();
      return result.evaluation;
    },
    onSuccess: (_, { supplierId }) => {
      queryClient.invalidateQueries({ queryKey: ['supplier', supplierId] });
      queryClient.invalidateQueries({ queryKey: ['supplier-evaluations', supplierId] });
      toast({
        title: 'Sucesso',
        description: 'Avaliação criada com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para criar auditoria
export const useCreateAudit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ supplierId, data }: { supplierId: string; data: CreateAuditData }): Promise<SupplierAudit> => {
      const response = await apiRequest('POST', `/api/suppliers/${supplierId}/audits`, data);
      const result = await response.json();
      return result.audit;
    },
    onSuccess: (_, { supplierId }) => {
      queryClient.invalidateQueries({ queryKey: ['supplier', supplierId] });
      queryClient.invalidateQueries({ queryKey: ['supplier-audits', supplierId] });
      toast({
        title: 'Sucesso',
        description: 'Auditoria criada com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para limpar fornecedores fictícios
export const useClearMockSuppliers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<{ deletedCount: number }> => {
      const response = await apiRequest('DELETE', '/api/suppliers/clear-mock');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers-stats'] });
      toast({
        title: 'Sucesso',
        description: `${data.deletedCount} fornecedores fictícios removidos com sucesso`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
