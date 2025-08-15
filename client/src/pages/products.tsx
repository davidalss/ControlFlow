import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { Plus, Search, Eye, Edit, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProductForm, { ProductFormData } from "@/components/products/product-form";
import ProductDetailsDialog, { ProductDetails } from "@/components/products/product-details-dialog";
import { apiRequest } from "@/lib/queryClient";

export interface Product {
  id: string;
  code: string;
  description: string;
  ean?: string;
  category: string;
  family?: string;
  businessUnit: 'DIY' | 'TECH' | 'KITCHEN_BEAUTY' | 'MOTOR_COMFORT' | 'N/A';
  technicalParameters?: any;
  createdAt: string;
}

const businessUnitLabels: { [key: string]: string } = {
  'DIY': 'DIY',
  'TECH': 'TECH',
  'KITCHEN_BEAUTY': 'Cozinha & Beleza',
  'MOTOR_COMFORT': 'Motores & Conforto',
  'N/A': 'Não Classificado'
};

export default function ProductsPage() {
  const { toast } = useToast();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load products from database
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', '/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error: any) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos do banco de dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Filtered products
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.ean && product.ean.includes(searchTerm));
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesBusinessUnit = selectedBusinessUnit === 'all' || product.businessUnit === selectedBusinessUnit;
    
    return matchesSearch && matchesCategory && matchesBusinessUnit;
  });

  // Get unique categories and business units for filters
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(cat => cat && cat.trim() !== '')))];
  const businessUnits = ['all', ...Array.from(new Set(products.map(p => p.businessUnit).filter(bu => bu && bu.trim() !== '')))];

  // Handlers
  const handleCreateSuccess = async (newProduct?: ProductFormData) => {
    if (!newProduct) return;
    try {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/products', newProduct);
      const createdProduct = await response.json();
      setProducts(prev => [...prev, createdProduct]);
      setShowCreateDialog(false);
      toast({
        title: "Produto criado",
        description: "O produto foi criado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar produto.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSuccess = async (updatedProduct?: ProductFormData) => {
    if (!updatedProduct) return;
    if (!selectedProduct) return;
    
    try {
      setIsLoading(true);
      const response = await apiRequest('PATCH', `/api/products/${selectedProduct.id}`, updatedProduct);
      const editedProduct = await response.json();
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? editedProduct : p));
      setShowEditDialog(false);
      setSelectedProduct(null);
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar produto.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailsDialog(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowEditDialog(true);
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        setIsLoading(true);
        await apiRequest('DELETE', `/api/products/${productToDelete.id}`);
        setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
        setShowDeleteDialog(false);
        setProductToDelete(null);
        toast({
          title: "Produto excluído",
          description: "O produto foi excluído com sucesso.",
        });
      } catch (error: any) {
        toast({
          title: "Erro",
          description: error.message || "Erro ao excluir produto.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadProducts();
    setIsRefreshing(false);
  };

  // Stats - Calculated from real data
  const totalProducts = products.length;
  const activeProducts = products.length; // All products are considered active
  const categoriesCount = new Set(products.map(p => p.category)).size;
  const businessUnitsCount = new Set(products.map(p => p.businessUnit)).size;
  
  // Detailed Business Unit statistics
  const businessUnitStats = products.reduce((acc, product) => {
    const bu = product.businessUnit || 'N/A';
    acc[bu] = (acc[bu] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const unclassifiedCount = businessUnitStats['N/A'] || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Produtos</h1>
            <p className="text-gray-600 mt-2">Gerencie o catálogo de produtos e suas especificações</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total de Produtos</p>
                <p className="text-2xl font-bold text-blue-900">{totalProducts.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Produtos Ativos</p>
                <p className="text-2xl font-bold text-green-900">{activeProducts.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Categorias</p>
                <p className="text-2xl font-bold text-yellow-900">{categoriesCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Business Units</p>
                <p className="text-2xl font-bold text-purple-900">{businessUnitsCount}</p>
                {unclassifiedCount > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {unclassifiedCount} sem classificação
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Business Unit Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="bg-white rounded-lg border border-gray-200 p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Distribuição por Business Unit</h3>
                     <Button
             variant="outline"
             size="sm"
             onClick={() => {
               setSelectedCategory('all');
               setSelectedBusinessUnit('all');
               setSearchTerm('');
             }}
             className="text-gray-600"
           >
             Limpar Filtros
           </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Object.entries(businessUnitStats).map(([bu, count]) => (
            <div key={bu} className="text-center p-3 rounded-lg border hover:shadow-md transition-shadow">
              <div className={`text-sm font-medium ${
                bu === 'N/A' ? 'text-red-600' : 
                bu === 'DIY' ? 'text-blue-600' :
                bu === 'TECH' ? 'text-green-600' :
                bu === 'KITCHEN_BEAUTY' ? 'text-purple-600' :
                bu === 'MOTOR_COMFORT' ? 'text-orange-600' : 'text-gray-600'
              }`}>
                {bu === 'N/A' ? 'Sem Classificação' : 
                 bu === 'KITCHEN_BEAUTY' ? 'Cozinha & Beleza' :
                 bu === 'MOTOR_COMFORT' ? 'Motores & Conforto' : bu}
              </div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-xs text-gray-500 mb-2">
                {((count / totalProducts) * 100).toFixed(1)}%
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBusinessUnit(bu)}
                className={`text-xs ${
                  bu === 'N/A' ? 'text-red-600 border-red-300 hover:bg-red-50' :
                  bu === 'DIY' ? 'text-blue-600 border-blue-300 hover:bg-blue-50' :
                  bu === 'TECH' ? 'text-green-600 border-green-300 hover:bg-green-50' :
                  bu === 'KITCHEN_BEAUTY' ? 'text-purple-600 border-purple-300 hover:bg-purple-50' :
                  bu === 'MOTOR_COMFORT' ? 'text-orange-600 border-orange-300 hover:bg-orange-50' : ''
                }`}
              >
                Ver Produtos
              </Button>
            </div>
          ))}
        </div>
        {unclassifiedCount > 0 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-red-700">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">
                  {unclassifiedCount} produtos ({((unclassifiedCount / totalProducts) * 100).toFixed(1)}%) sem classificação de Business Unit
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBusinessUnit('N/A')}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Ver Produtos
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar produtos por código, descrição ou EAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
                 <Select value={selectedCategory} onValueChange={setSelectedCategory}>
           <SelectTrigger className="w-48">
             <SelectValue placeholder="Categoria" />
           </SelectTrigger>
           <SelectContent>
             {categories.map(category => (
               <SelectItem key={category} value={category}>
                 {category === 'all' ? 'Todas as Categorias' : category}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
                 <Select value={selectedBusinessUnit} onValueChange={setSelectedBusinessUnit}>
           <SelectTrigger className="w-48">
             <SelectValue placeholder="Business Unit" />
           </SelectTrigger>
           <SelectContent>
             {businessUnits.map(bu => (
               <SelectItem key={bu} value={bu}>
                 {bu === 'all' ? 'Todas as BUs' : businessUnitLabels[bu] || bu}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              Lista de Produtos ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando produtos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-600">Tente ajustar os filtros ou criar um novo produto.</p>
              </div>
                         ) : (
               <div className="overflow-x-auto w-full border rounded-lg">
                 <Table className="w-full min-w-[1400px]">
                  <TableHeader>
                    <TableRow>
                                             <TableHead className="w-36 bg-gray-50 font-semibold text-gray-900 border-r">Código</TableHead>
                       <TableHead className="w-80 bg-gray-50 font-semibold text-gray-900 border-r">Descrição</TableHead>
                       <TableHead className="w-40 bg-gray-50 font-semibold text-gray-900 border-r">EAN</TableHead>
                       <TableHead className="w-56 bg-gray-50 font-semibold text-gray-900 border-r">Categoria</TableHead>
                       <TableHead className="w-48 bg-gray-50 font-semibold text-gray-900 border-r">Business Unit</TableHead>
                       <TableHead className="w-36 bg-gray-50 font-semibold text-gray-900 border-r">Data Criação</TableHead>
                       <TableHead className="w-40 sticky right-0 bg-gray-50 font-semibold text-gray-900 shadow-[-4px_0_8px_rgba(0,0,0,0.1)]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product, index) => (
                                             <motion.tr
                         key={product.id}
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ duration: 0.3, delay: index * 0.05 }}
                         className="hover:bg-gray-50 border-b border-gray-100"
                       >
                                                 <TableCell className="font-mono text-sm w-36 border-r align-top py-3">{product.code}</TableCell>
                         <TableCell className="w-80 max-w-80 truncate border-r align-top py-3 px-4">{product.description}</TableCell>
                         <TableCell className="font-mono text-sm w-40 border-r align-top py-3">{product.ean || '-'}</TableCell>
                         <TableCell className="w-56 border-r align-top py-3">
                           <div className="space-y-2">
                             <Badge variant="secondary" className="text-xs">
                               {product.category}
                             </Badge>
                             <div className="text-xs text-gray-500 truncate">
                               {product.technicalParameters?.familia_comercial || '-'}
                             </div>
                           </div>
                         </TableCell>
                         <TableCell className="w-48 border-r align-top py-3">
                           <Badge 
                             variant="outline" 
                             className={`text-xs ${
                               product.businessUnit === 'DIY' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                               product.businessUnit === 'TECH' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                               product.businessUnit === 'KITCHEN_BEAUTY' ? 'border-pink-200 text-pink-700 bg-pink-50' :
                               product.businessUnit === 'MOTOR_COMFORT' ? 'border-green-200 text-green-700 bg-green-50' :
                               'border-gray-200 text-gray-700 bg-gray-50'
                             }`}
                           >
                             {businessUnitLabels[product.businessUnit] || product.businessUnit}
                           </Badge>
                         </TableCell>
                         <TableCell className="text-sm text-gray-600 w-36 border-r align-top py-3">
                           {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                         </TableCell>
                         <TableCell className="w-40 sticky right-0 bg-white shadow-[-4px_0_8px_rgba(0,0,0,0.1)] align-top py-3">
                                                      <div className="flex items-center justify-center space-x-2">
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleViewDetails(product)}
                               className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-md"
                               title="Ver detalhes"
                             >
                               <Eye className="w-4 h-4" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleEdit(product)}
                               className="h-9 w-9 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 hover:border-green-300 rounded-md"
                               title="Editar produto"
                             >
                               <Edit className="w-4 h-4" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleDelete(product)}
                               className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-md"
                               title="Excluir produto"
                             >
                               <Trash2 className="w-4 h-4" />
                             </Button>
                           </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialogs */}
      
      {/* Create Product Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
          </DialogHeader>
                     <ProductForm onSuccess={handleCreateSuccess} onCancel={() => setShowCreateDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm 
              product={selectedProduct}
              onSuccess={handleEditSuccess} 
              onCancel={() => setShowEditDialog(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        product={selectedProduct}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "{productToDelete?.code}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

