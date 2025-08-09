import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BUSINESS_UNITS } from "@/lib/constants";
import ProductForm from "@/components/products/product-form";

export default function ProductsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<string>("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await apiRequest('POST', '/api/products', productData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Produto criado com sucesso",
        description: "O produto foi adicionado ao catálogo",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowCreateDialog(false);
    },
    onError: () => {
      toast({
        title: "Erro ao criar produto",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  });

  const filteredProducts = products?.filter((product: any) => {
    const matchesSearch = !searchTerm || 
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBusinessUnit = !selectedBusinessUnit || 
      product.businessUnit === selectedBusinessUnit;

    return matchesSearch && matchesBusinessUnit;
  }) || [];

  const canCreateProducts = user?.role === 'engineering' || user?.role === 'manager';

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Catálogo de Produtos</h2>
          <p className="text-neutral-600">Gerenciamento completo do catálogo WAP</p>
        </div>
        {canCreateProducts && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <span className="material-icons mr-2">add_circle</span>
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Produto</DialogTitle>
              </DialogHeader>
              <ProductForm
                onSubmit={(data) => createProductMutation.mutate(data)}
                onCancel={() => setShowCreateDialog(false)}
                isLoading={createProductMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por código ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedBusinessUnit === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedBusinessUnit("")}
              >
                Todas
              </Button>
              {Object.entries(BUSINESS_UNITS).map(([key, label]) => (
                <Button
                  key={key}
                  variant={selectedBusinessUnit === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedBusinessUnit(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length > 0 ? filteredProducts.map((product: any) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                    {product.code}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-2">
                    {product.description}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Categoria: {product.category}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`
                    ${product.businessUnit === 'DIY' ? 'border-orange-200 text-orange-700 bg-orange-50' : ''}
                    ${product.businessUnit === 'TECH' ? 'border-blue-200 text-blue-700 bg-blue-50' : ''}
                    ${product.businessUnit === 'KITCHEN_BEAUTY' ? 'border-pink-200 text-pink-700 bg-pink-50' : ''}
                    ${product.businessUnit === 'MOTOR_COMFORT' ? 'border-green-200 text-green-700 bg-green-50' : ''}
                  `}
                >
                  {BUSINESS_UNITS[product.businessUnit as keyof typeof BUSINESS_UNITS]}
                </Badge>
              </div>

              {/* Technical Parameters */}
              {product.technicalParameters && Object.keys(product.technicalParameters).length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-neutral-700 mb-2">Parâmetros Técnicos:</p>
                  <div className="space-y-1">
                    {Object.entries(product.technicalParameters).slice(0, 3).map(([param, value]) => (
                      <div key={param} className="flex justify-between text-xs">
                        <span className="text-neutral-500">{param}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                    {Object.keys(product.technicalParameters).length > 3 && (
                      <p className="text-xs text-neutral-400">
                        +{Object.keys(product.technicalParameters).length - 3} mais...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <span className="material-icons mr-1 text-sm">visibility</span>
                  Ver Detalhes
                </Button>
                {canCreateProducts && (
                  <Button variant="outline" size="sm">
                    <span className="material-icons text-sm">edit</span>
                  </Button>
                )}
              </div>

              {/* Creation Date */}
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-xs text-neutral-400">
                  Criado em: {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <span className="material-icons text-6xl text-neutral-300 mb-4 block">inventory_2</span>
                <h3 className="text-lg font-medium text-neutral-800 mb-2">
                  {searchTerm || selectedBusinessUnit ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                </h3>
                <p className="text-neutral-600 mb-4">
                  {searchTerm || selectedBusinessUnit 
                    ? 'Tente ajustar os filtros de busca' 
                    : 'Comece adicionando produtos ao catálogo'
                  }
                </p>
                {canCreateProducts && !searchTerm && !selectedBusinessUnit && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <span className="material-icons mr-2">add_circle</span>
                    Cadastrar Primeiro Produto
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {products?.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-neutral-600">
                  Total de produtos: <span className="font-medium">{products.length}</span>
                </span>
                <span className="text-neutral-600">
                  Filtrados: <span className="font-medium">{filteredProducts.length}</span>
                </span>
              </div>
              <div className="flex items-center space-x-4">
                {Object.entries(BUSINESS_UNITS).map(([key, label]) => {
                  const count = products.filter((p: any) => p.businessUnit === key).length;
                  return (
                    <span key={key} className="text-neutral-600">
                      {label}: <span className="font-medium">{count}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
