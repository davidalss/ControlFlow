import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

export interface Product {
  id: string;
  code: string;
  description: string;
  ean?: string;
  category: string;
  family?: string;
  businessUnit: string;
  technicalParameters?: any;
  createdAt: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest('GET', '/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      console.error('Erro ao carregar produtos:', err);
      setError(err.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find(product => product.id === id);
  };

  const getProductByCode = (code: string): Product | undefined => {
    return products.find(product => product.code === code);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    loading,
    error,
    loadProducts,
    getProductById,
    getProductByCode
  };
}
