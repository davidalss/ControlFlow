import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { useAuth } from '@/hooks/use-auth';
import productNotificationService from '@/lib/notifications';
import productHistoryService from '@/lib/product-history';
import { apiRequest } from '@/lib/queryClient';

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
  businessUnit?: string;
  technicalParameters?: any;
  
  // NOVO: Suporte a múltiplas voltagens
  voltageVariants?: VoltageVariant[];
  voltageType?: '127V' | '220V' | 'BIVOLT' | 'DUAL' | 'MULTIPLE';
  isMultiVoltage?: boolean;
  
  createdAt: string;
}

export interface CreateProductData {
  code: string;
  description: string;
  ean?: string;
  category: string;
  businessUnit?: string;
  technicalParameters?: any;
  
  // NOVO: Suporte a múltiplas voltagens
  voltageVariants?: VoltageVariant[];
  voltageType?: '127V' | '220V' | 'BIVOLT' | 'DUAL' | 'MULTIPLE';
  isMultiVoltage?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

// API functions
const fetchProducts = async (): Promise<Product[]> => {
  try {
    logger.logApi({ 
      url: 'fetch_products_start', 
      method: 'GET', 
      status: 200, 
      body: 'Iniciando busca de produtos' 
    });
    const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
    const response = await apiRequest('GET', `${apiUrl}/api/products`);
    const products = await response.json();
    logger.logApi({ 
      url: 'fetch_products_success', 
      method: 'GET', 
      status: 200, 
      body: { message: 'Produtos carregados com sucesso', count: products.length }
    });
    return products;
  } catch (error) {
    logger.logError('fetch_products_exception', error, 'api');
    throw error;
  }
};

const fetchProduct = async (id: string): Promise<Product> => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
    const response = await apiRequest('GET', `${apiUrl}/api/products/${id}`);
    const product = await response.json();
    return product;
  } catch (error) {
    logger.logError('fetch_product_exception', error, 'api');
    throw error;
  }
};

const createProduct = async (data: CreateProductData): Promise<Product> => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
    const response = await apiRequest('POST', `${apiUrl}/api/products`, data);
    const newProduct = await response.json();
    return newProduct;
  } catch (error) {
    logger.logError('create_product_exception', error, 'api');
    throw error;
  }
};

const updateProduct = async (data: UpdateProductData): Promise<Product> => {
  const { id, ...updateData } = data;
  
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
    const response = await apiRequest('PATCH', `${apiUrl}/api/products/${id}`, updateData);
    const updatedProduct = await response.json();
    return updatedProduct;
  } catch (error) {
    logger.logError('update_product_exception', error, 'api');
    throw error;
  }
};

const deleteProduct = async (id: string): Promise<{ message: string; deletedProduct: { id: string; code: string } }> => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
    const response = await apiRequest('DELETE', `${apiUrl}/api/products/${id}`);
    const result = await response.json();
    return result;
  } catch (error) {
    logger.logError('delete_product_exception', error, 'api');
    throw error;
  }
};

// Hook principal
export const useProducts = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Query para buscar todos os produtos
  const {
    data: products = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Mutation para criar produto
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (newProduct) => {
      queryClient.setQueryData(['products'], (old: Product[] = []) => [newProduct, ...old]);
      
      // Registrar no histórico
      productHistoryService.recordProductCreated(
        newProduct, 
        user?.id, 
        user?.name
      );
      
      // Enviar notificação
      productNotificationService.notifyProductCreated(
        newProduct.code,
        newProduct.description,
        user?.name
      );
      
      toast({
        title: "✅ Produto criado!",
        description: `Produto "${newProduct.description}" foi criado com sucesso.`,
      });
      setIsCreating(false);

    },
    onError: (error: Error) => {
      // Enviar notificação de erro
      productNotificationService.notifyError(
        'criar',
        error.message,
        undefined,
        user?.name
      );
      
      toast({
        title: "❌ Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
      setIsCreating(false);

    },
  });

  // Mutation para atualizar produto
  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: (updatedProduct) => {
      // Obter dados antigos para comparação
      const oldProduct = queryClient.getQueryData(['products']) as Product[];
      const oldProductData = oldProduct?.find(p => p.id === updatedProduct.id);
      
      // Atualizar o cache imediatamente
      queryClient.setQueryData(['products'], (old: Product[] = []) => 
        old.map(product => product.id === updatedProduct.id ? updatedProduct : product)
      );
      
      // Registrar no histórico se houver dados antigos
      if (oldProductData) {
        productHistoryService.recordProductUpdated(
          updatedProduct.id,
          updatedProduct.code,
          oldProductData,
          updatedProduct,
          user?.id,
          user?.name
        );
      }
      
      // Enviar notificação
      productNotificationService.notifyProductUpdated(
        updatedProduct.code,
        updatedProduct.description,
        user?.name
      );
      
      toast({
        title: "✅ Produto atualizado!",
        description: `Produto "${updatedProduct.description}" foi atualizado com sucesso.`,
      });
      setIsUpdating(false);
      
    },
    onError: (error: Error) => {
      // Enviar notificação de erro
      productNotificationService.notifyError(
        'atualizar',
        error.message,
        undefined,
        user?.name
      );
      
      toast({
        title: "❌ Erro ao atualizar produto",
        description: error.message,
        variant: "destructive",
      });
      setIsUpdating(false);
      
    },
  });

  // Mutation para excluir produto
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (result) => {
      // Obter dados do produto antes de excluir
      const oldProduct = queryClient.getQueryData(['products']) as Product[];
      const deletedProductData = oldProduct?.find(p => p.id === result.deletedProduct.id);
      
      queryClient.setQueryData(['products'], (old: Product[] = []) => 
        old.filter(product => product.id !== result.deletedProduct.id)
      );
      
      // Registrar no histórico se houver dados do produto
      if (deletedProductData) {
        productHistoryService.recordProductDeleted(
          deletedProductData,
          user?.id,
          user?.name
        );
      }
      
      // Enviar notificação
      productNotificationService.notifyProductDeleted(
        result.deletedProduct.code,
        deletedProductData?.description || 'Produto',
        user?.name
      );
      
      toast({
        title: "✅ Produto excluído!",
        description: `Produto "${result.deletedProduct.code}" foi excluído com sucesso.`,
      });
      setIsDeleting(false);
      
    },
    onError: (error: Error) => {
      // Enviar notificação de erro
      productNotificationService.notifyError(
        'excluir',
        error.message,
        undefined,
        user?.name
      );
      
      toast({
        title: "❌ Erro ao excluir produto",
        description: error.message,
        variant: "destructive",
      });
      setIsDeleting(false);
      
    },
  });

  // Funções de ação
  const createProductAction = async (data: CreateProductData) => {
    setIsCreating(true);

    createMutation.mutate(data);
  };

  const updateProductAction = async (data: UpdateProductData) => {
    setIsUpdating(true);
    
    updateMutation.mutate(data);
  };

  const deleteProductAction = async (id: string) => {
    setIsDeleting(true);

    deleteMutation.mutate(id);
  };

  return {
    // Data
    products,
    isLoading,
    error,
    
    // Loading states
    isCreating,
    isUpdating,
    isDeleting,
    
    // Actions
    createProduct: createProductAction,
    updateProduct: updateProductAction,
    deleteProduct: deleteProductAction,
    refetch,
  };
};

// Hook para buscar produto individual
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
