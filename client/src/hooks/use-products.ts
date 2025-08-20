import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useLogging } from '@/lib/logger';
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
  const { log } = useLogging('ProductsAPI');
  
  try {
    log.info('fetch_products_start', 'Iniciando busca de produtos');
    const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
    const response = await apiRequest('GET', `${apiUrl}/api/products`);
    const products = await response.json();
    log.info('fetch_products_success', 'Produtos carregados com sucesso', { count: products.length });
    return products;
  } catch (error) {
    log.error('fetch_products_exception', 'Exceção ao buscar produtos', { 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
    throw error;
  }
};

const fetchProduct = async (id: string): Promise<Product> => {
  const { log } = useLogging('ProductsAPI');
  
  try {
    log.info('fetch_product_start', 'Iniciando busca de produto específico', { productId: id });
    const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
    const response = await apiRequest('GET', `${apiUrl}/api/products/${id}`);
    const product = await response.json();
    log.info('fetch_product_success', 'Produto carregado com sucesso', { productId: id });
    return product;
  } catch (error) {
    log.error('fetch_product_exception', 'Exceção ao buscar produto', { 
      productId: id,
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
    throw error;
  }
};

const createProduct = async (data: CreateProductData): Promise<Product> => {
  const { log } = useLogging('ProductsAPI');
  
  try {
    log.info('create_product_start', 'Iniciando criação de produto', { productData: data });
    const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
    const response = await apiRequest('POST', `${apiUrl}/api/products`, data);
    const newProduct = await response.json();
    log.info('create_product_success', 'Produto criado com sucesso', { 
      productId: newProduct.id,
      productCode: newProduct.code 
    });
    return newProduct;
  } catch (error) {
    log.error('create_product_exception', 'Exceção ao criar produto', { 
      productData: data,
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
    throw error;
  }
};

const updateProduct = async (data: UpdateProductData): Promise<Product> => {
  const { log } = useLogging('ProductsAPI');
  const { id, ...updateData } = data;
  
  try {
    log.info('update_product_start', 'Iniciando atualização de produto', { 
      productId: id,
      updateData 
    });
    const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
    const response = await apiRequest('PATCH', `${apiUrl}/api/products/${id}`, updateData);
    const updatedProduct = await response.json();
    log.info('update_product_success', 'Produto atualizado com sucesso', { 
      productId: id,
      productCode: updatedProduct.code 
    });
    return updatedProduct;
  } catch (error) {
    log.error('update_product_exception', 'Exceção ao atualizar produto', { 
      productId: id,
      updateData,
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
    throw error;
  }
};

const deleteProduct = async (id: string): Promise<{ message: string; deletedProduct: { id: string; code: string } }> => {
  const { log } = useLogging('ProductsAPI');
  
  try {
    log.info('delete_product_start', 'Iniciando exclusão de produto', { productId: id });
    const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
    const response = await apiRequest('DELETE', `${apiUrl}/api/products/${id}`);
    const result = await response.json();
    log.info('delete_product_success', 'Produto excluído com sucesso', { 
      productId: id,
      productCode: result.deletedProduct.code 
    });
    return result;
  } catch (error) {
    log.error('delete_product_exception', 'Exceção ao excluir produto', { 
      productId: id,
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
    throw error;
  }
};

// Hook principal
export const useProducts = () => {
  const queryClient = useQueryClient();
  const { log } = useLogging('useProducts');
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
      log.info('create_mutation_success', 'Mutation de criação executada com sucesso', { 
        productId: newProduct.id,
        productCode: newProduct.code 
      });
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
      log.error('create_mutation_error', 'Erro na mutation de criação', { 
        error: error.message 
      });
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
      log.info('update_mutation_success', 'Mutation de atualização executada com sucesso', { 
        productId: updatedProduct.id,
        productCode: updatedProduct.code 
      });
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
      log.error('update_mutation_error', 'Erro na mutation de atualização', { 
        error: error.message 
      });
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
      log.info('delete_mutation_success', 'Mutation de exclusão executada com sucesso', { 
        productId: result.deletedProduct.id,
        productCode: result.deletedProduct.code 
      });
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
      log.error('delete_mutation_error', 'Erro na mutation de exclusão', { 
        error: error.message 
      });
    },
  });

  // Funções de ação
  const createProductAction = async (data: CreateProductData) => {
    setIsCreating(true);
    log.info('create_product_action', 'Iniciando ação de criação', { productData: data });
    createMutation.mutate(data);
  };

  const updateProductAction = async (data: UpdateProductData) => {
    setIsUpdating(true);
    log.info('update_product_action', 'Iniciando ação de atualização', { 
      productId: data.id,
      updateData: data 
    });
    updateMutation.mutate(data);
  };

  const deleteProductAction = async (id: string) => {
    setIsDeleting(true);
    log.info('delete_product_action', 'Iniciando ação de exclusão', { productId: id });
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
