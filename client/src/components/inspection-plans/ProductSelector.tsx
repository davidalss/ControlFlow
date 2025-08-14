import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Package, 
  CheckCircle, 
  XCircle,
  Database,
  Tag
} from 'lucide-react';
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

interface ProductSelectorProps {
  onProductSelect: (product: Product) => void;
  selectedProduct?: Product | null;
  disabled?: boolean;
}

export default function ProductSelector({ 
  onProductSelect, 
  selectedProduct, 
  disabled = false 
}: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Carregar produtos
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', '/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filtrar produtos baseado no termo de busca
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts([]);
      setShowResults(false);
      return;
    }

    const filtered = products.filter(product => 
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.ean && product.ean.includes(searchTerm))
    );

    setFilteredProducts(filtered.slice(0, 10)); // Limitar a 10 resultados
    setShowResults(true);
  }, [searchTerm, products]);

  const handleProductSelect = (product: Product) => {
    onProductSelect(product);
    setSearchTerm(product.description);
    setShowResults(false);
  };

  const handleClearSelection = () => {
    onProductSelect(null as any);
    setSearchTerm('');
    setShowResults(false);
  };

  const businessUnitLabels: { [key: string]: string } = {
    'DIY': 'DIY',
    'TECH': 'TECH',
    'KITCHEN_BEAUTY': 'Cozinha & Beleza',
    'MOTOR_COMFORT': 'Motores & Conforto',
    'N/A': 'Não Classificado'
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Selecionar Produto</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Campo de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Digite o nome ou código do produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={disabled}
            />
          </div>

          {/* Produto selecionado */}
          {selectedProduct && (
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-800 dark:text-green-200">
                      Produto Selecionado
                    </h4>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{selectedProduct.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Tag className="w-4 h-4" />
                        <span>Código: {selectedProduct.code}</span>
                      </span>
                      {selectedProduct.ean && (
                        <span>EAN: {selectedProduct.ean}</span>
                      )}
                      <Badge variant="outline">
                        {businessUnitLabels[selectedProduct.businessUnit] || selectedProduct.businessUnit}
                      </Badge>
                    </div>
                  </div>
                </div>
                {!disabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearSelection}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Resultados da busca */}
          {showResults && filteredProducts.length > 0 && (
            <div className="border rounded-lg max-h-60 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{product.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="flex items-center space-x-1">
                          <Database className="w-3 h-3" />
                          <span>{product.code}</span>
                        </span>
                        {product.ean && (
                          <span>EAN: {product.ean}</span>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {businessUnitLabels[product.businessUnit] || product.businessUnit}
                        </Badge>
                      </div>
                    </div>
                    <Package className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mensagem quando não há resultados */}
          {showResults && searchTerm && filteredProducts.length === 0 && !isLoading && (
            <div className="text-center py-4 text-gray-500">
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Nenhum produto encontrado</p>
              <p className="text-sm">Tente buscar por outro termo</p>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Carregando produtos...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
