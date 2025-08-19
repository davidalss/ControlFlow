import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Search, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LinkedProduct } from "@/hooks/use-inspection-plans";

interface ProductSelectorProps {
  onProductsChange: (products: LinkedProduct[]) => void;
  selectedProducts: LinkedProduct[];
}

export default function ProductSelector({ onProductsChange, selectedProducts }: ProductSelectorProps) {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Carregar produtos disponíveis
  useEffect(() => {
    loadProducts();
  }, []);
  
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', '/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filtrar produtos disponíveis (não selecionados)
  const availableProducts = products.filter(product => 
    !selectedProducts.some(sp => sp.productId === product.id) &&
    (product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     product.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const addProduct = (product: any, voltage: '127V' | '220V' | 'BIVOLT') => {
    const newLinkedProduct: LinkedProduct = {
      productId: product.id,
      productCode: product.code,
      productName: product.description,
      voltage,
      isActive: true
    };
    
    onProductsChange([...selectedProducts, newLinkedProduct]);
    
    toast({
      title: "Produto adicionado",
      description: `${product.description} (${voltage}) foi adicionado ao plano.`,
    });
  };
  
  const removeProduct = (productId: string) => {
    const productToRemove = selectedProducts.find(p => p.productId === productId);
    onProductsChange(selectedProducts.filter(p => p.productId !== productId));
    
    if (productToRemove) {
      toast({
        title: "Produto removido",
        description: `${productToRemove.productName} foi removido do plano.`,
      });
    }
  };
  
  const getVoltageBadgeColor = (voltage: string) => {
    switch (voltage) {
      case '127V': return 'bg-blue-100 text-blue-800';
      case '220V': return 'bg-green-100 text-green-800';
      case 'BIVOLT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Produtos do Plano de Inspeção</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Produtos Selecionados */}
        {selectedProducts.length > 0 && (
          <div className="space-y-2">
            <Label>Produtos selecionados:</Label>
            {selectedProducts.map(product => (
              <div key={product.productId} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Package className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{product.productName}</div>
                    <div className="text-sm text-gray-500">{product.productCode}</div>
                  </div>
                  <Badge className={getVoltageBadgeColor(product.voltage)}>
                    {product.voltage}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProduct(product.productId)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* Buscar e Adicionar Produtos */}
        <div className="space-y-3">
          <Label>Adicionar produto:</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por código ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Carregando produtos...</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableProducts.slice(0, 10).map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="font-medium">{product.description}</div>
                    <div className="text-sm text-gray-500">{product.code}</div>
                    {product.technicalParameters?.voltagem && (
                      <div className="text-xs text-gray-400">
                        Voltagem: {product.technicalParameters.voltagem}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addProduct(product, '127V')}
                      className="text-xs"
                    >
                      127V
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addProduct(product, '220V')}
                      className="text-xs"
                    >
                      220V
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addProduct(product, 'BIVOLT')}
                      className="text-xs"
                    >
                      BIVOLT
                    </Button>
                  </div>
                </div>
              ))}
              
              {availableProducts.length === 0 && searchTerm && (
                <div className="text-center py-4 text-gray-500">
                  Nenhum produto encontrado para "{searchTerm}"
                </div>
              )}
              
              {availableProducts.length === 0 && !searchTerm && (
                <div className="text-center py-4 text-gray-500">
                  Digite algo para buscar produtos
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Resumo */}
        {selectedProducts.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-800">
              Resumo: {selectedProducts.length} produto(s) selecionado(s)
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {selectedProducts.map(p => p.voltage).join(', ')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
