import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabaseClient';

export interface VoltageVariant {
  voltage: '127V' | '220V';
  ean?: string;
  code?: string;
  description?: string;
  technicalParameters?: any;
}

export interface Product {
  id: string;
  code: string;
  description: string;
  ean?: string;
  category: string;
  business_unit?: string;
  technical_parameters?: any;
  
  // NOVO: Suporte a múltiplas voltagens
  voltage_variants?: VoltageVariant[];
  voltage_type?: '127V' | '220V' | 'BIVOLT' | 'DUAL' | 'MULTIPLE';
  is_multi_voltage?: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  code: string;
  description: string;
  ean?: string;
  category: string;
  business_unit?: string;
  technical_parameters?: any;
  
  // NOVO: Suporte a múltiplas voltagens
  voltage_variants?: VoltageVariant[];
  voltage_type?: '127V' | '220V' | 'BIVOLT' | 'DUAL' | 'MULTIPLE';
  is_multi_voltage?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

// Supabase API functions
const fetchProductsFromSupabase = async (): Promise<Product[]> => {
  try {
    logger.logApi({ 
      url: 'supabase_products_start', 
      method: 'GET', 
      status: 200, 
      body: 'Iniciando busca de produtos do Supabase' 
    });

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar produtos: ${error.message}`);
    }

    logger.logApi({ 
      url: 'supabase_products_success', 
      method: 'GET', 
      status: 200, 
      body: { message: 'Produtos carregados do Supabase com sucesso', count: products?.length || 0 }
    });

    return products || [];
  } catch (error) {
    logger.logError('supabase_products_exception', error, 'api');
    throw error;
  }
};

const fetchProductFromSupabase = async (id: string): Promise<Product> => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar produto: ${error.message}`);
    }

    return product;
  } catch (error) {
    logger.logError('supabase_product_exception', error, 'api');
    throw error;
  }
};

const createProductInSupabase = async (data: CreateProductData): Promise<Product> => {
  try {
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar produto: ${error.message}`);
    }

    return newProduct;
  } catch (error) {
    logger.logError('supabase_create_product_exception', error, 'api');
    throw error;
  }
};

const updateProductInSupabase = async (data: UpdateProductData): Promise<Product> => {
  try {
    const { id, ...updateData } = data;
    
    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar produto: ${error.message}`);
    }

    return updatedProduct;
  } catch (error) {
    logger.logError('supabase_update_product_exception', error, 'api');
    throw error;
  }
};

const deleteProductFromSupabase = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar produto: ${error.message}`);
    }
  } catch (error) {
    logger.logError('supabase_delete_product_exception', error, 'api');
    throw error;
  }
};

// React Query hooks
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProductsFromSupabase,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductFromSupabase(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: CreateProductData) => createProductInSupabase(data),
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Produto criado",
        description: `Produto "${newProduct.code}" criado com sucesso!`,
      });
      
      // Log de atividade
      logger.logApi({
        url: 'product_created',
        method: 'POST',
        status: 201,
        body: { productId: newProduct.id, productCode: newProduct.code, userId: user?.id }
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: UpdateProductData) => updateProductInSupabase(data),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', updatedProduct.id] });
      toast({
        title: "Produto atualizado",
        description: `Produto "${updatedProduct.code}" atualizado com sucesso!`,
      });
      
      // Log de atividade
      logger.logApi({
        url: 'product_updated',
        method: 'PUT',
        status: 200,
        body: { productId: updatedProduct.id, productCode: updatedProduct.code, userId: user?.id }
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: string) => deleteProductFromSupabase(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Produto deletado",
        description: "Produto deletado com sucesso!",
      });
      
      // Log de atividade
      logger.logApi({
        url: 'product_deleted',
        method: 'DELETE',
        status: 200,
        body: { productId: deletedId, userId: user?.id }
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao deletar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
