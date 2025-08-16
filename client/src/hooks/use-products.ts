import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  code: string;
  description: string;
  ean?: string;
  category: string;
  family?: string;
  businessUnit?: string;
  technicalParameters?: any;
  createdAt: string;
}

export interface CreateProductData {
  code: string;
  description: string;
  ean?: string;
  category: string;
  family?: string;
  businessUnit?: string;
  technicalParameters?: any;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

// API functions
const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch('/api/products');
  if (!response.ok) {
    throw new Error('Erro ao buscar produtos');
  }
  return response.json();
};

const fetchProduct = async (id: string): Promise<Product> => {
  const response = await fetch(`/api/products/${id}`);
  if (!response.ok) {
    throw new Error('Erro ao buscar produto');
  }
  return response.json();
};

const createProduct = async (data: CreateProductData): Promise<Product> => {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao criar produto');
  }
  
  return response.json();
};

const updateProduct = async (data: UpdateProductData): Promise<Product> => {
  const { id, ...updateData } = data;
  const response = await fetch(`/api/products/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao atualizar produto');
  }
  
  return response.json();
};

const deleteProduct = async (id: string): Promise<{ message: string; deletedProduct: { id: string; code: string } }> => {
  const response = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao excluir produto');
  }
  
  return response.json();
};

// Hook principal
export const useProducts = () => {
  const queryClient = useQueryClient();
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
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para criar produto
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (newProduct) => {
      queryClient.setQueryData(['products'], (old: Product[] = []) => [newProduct, ...old]);
      toast({
        title: "✅ Produto criado!",
        description: `Produto "${newProduct.description}" foi criado com sucesso.`,
      });
      setIsCreating(false);
    },
    onError: (error: Error) => {
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
      queryClient.setQueryData(['products'], (old: Product[] = []) => 
        old.map(product => product.id === updatedProduct.id ? updatedProduct : product)
      );
      toast({
        title: "✅ Produto atualizado!",
        description: `Produto "${updatedProduct.description}" foi atualizado com sucesso.`,
      });
      setIsUpdating(false);
    },
    onError: (error: Error) => {
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
      queryClient.setQueryData(['products'], (old: Product[] = []) => 
        old.filter(product => product.id !== result.deletedProduct.id)
      );
      toast({
        title: "✅ Produto excluído!",
        description: `Produto "${result.deletedProduct.code}" foi excluído com sucesso.`,
      });
      setIsDeleting(false);
    },
    onError: (error: Error) => {
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
  });
};
