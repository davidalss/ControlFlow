import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  History,
  Eye,
  Download,
  Upload,
  RefreshCw,
  BarChart3,
  Package,
  Tag,
  Building,
  Hash
} from 'lucide-react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, Product, CreateProductData, UpdateProductData } from '@/hooks/use-products-supabase';
import { ProductForm } from '@/components/products/product-form';
import ProductHistoryModal from '@/components/products/ProductHistoryModal';

import { motion, AnimatePresence } from 'framer-motion';

export default function ProductsPage() {
  const { data: products = [], isLoading, refetch } = useProducts();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  
  // Estados locais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Estados de filtro e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [businessUnitFilter, setBusinessUnitFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'code' | 'description' | 'category' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtrar e ordenar produtos
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = 
        (product.code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (product.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (product.ean?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
             const matchesBusinessUnit = businessUnitFilter === 'all' || product.business_unit === businessUnitFilter;
      
      return matchesSearch && matchesCategory && matchesBusinessUnit;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'code':
          comparison = (a.code || '').localeCompare(b.code || '');
          break;
        case 'description':
          comparison = (a.description || '').localeCompare(b.description || '');
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
                 case 'createdAt':
           comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Estatísticas
  const stats = {
    total: products.length,
    categories: new Set(products.map(p => p.category)).size,
         businessUnits: new Set(products.filter(p => p.business_unit).map(p => p.business_unit)).size,
    withEAN: products.filter(p => p.ean).length
  };

  // Obter categorias e business units únicas
  const categories = Array.from(new Set(products.map(p => p.category))).sort();
     const businessUnits = Array.from(new Set(products.filter(p => p.business_unit).map(p => p.business_unit!))).sort();

  // Handlers
  const handleCreate = async (data: CreateProductData | UpdateProductData) => {
    if ('id' in data) return; // Se tem ID, é update, não create
    
    try {
      await createProductMutation.mutateAsync(data);
      setShowCreateModal(false);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleEdit = async (data: CreateProductData | UpdateProductData) => {
    if (!('id' in data)) return; // Se não tem ID, é create, não update
    
    try {
      await updateProductMutation.mutateAsync(data);
      setShowEditModal(false);
      setEditingProduct(null);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      await deleteProductMutation.mutateAsync(selectedProduct.id);
      setShowDeleteDialog(false);
      setSelectedProduct(null);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const openHistoryModal = (product: Product) => {
    setSelectedProduct(product);
    setShowHistoryModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportProducts = () => {
    const dataStr = JSON.stringify(filteredProducts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `produtos_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Produtos</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie o catálogo de produtos</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={exportProducts}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total de Produtos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.categories}</p>
                <p className="text-sm text-gray-600">Categorias</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.businessUnits}</p>
                <p className="text-sm text-gray-600">Business Units</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Hash className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.withEAN}</p>
                <p className="text-sm text-gray-600">Com EAN</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por código, descrição ou EAN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={businessUnitFilter} onValueChange={setBusinessUnitFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por BU" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as BUs</SelectItem>
                {businessUnits.map(bu => (
                  <SelectItem key={bu} value={bu}>{bu}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Produtos ({filteredProducts.length})</span>
            <div className="flex items-center space-x-2 text-sm">
              <span>Ordenar por:</span>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="code">Código</SelectItem>
                  <SelectItem value="description">Descrição</SelectItem>
                  <SelectItem value="category">Categoria</SelectItem>
                  <SelectItem value="createdAt">Data</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">Carregando produtos...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">
                {searchTerm || categoryFilter !== 'all' || businessUnitFilter !== 'all' 
                  ? 'Nenhum produto encontrado com os filtros aplicados' 
                  : 'Nenhum produto cadastrado'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="max-h-96 overflow-y-auto border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>EAN</TableHead>
                      <TableHead>Business Unit</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredProducts.map((product, index) => (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <TableCell className="font-medium">{product.code}</TableCell>
                          <TableCell>{product.description}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{product.category}</Badge>
                          </TableCell>
                          <TableCell>{product.ean || '-'}</TableCell>
                                                     <TableCell>{product.business_unit ?? '-'}</TableCell>
                           <TableCell>{formatDate(product.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openHistoryModal(product)}
                                title="Ver histórico"
                              >
                                <History className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(product)}
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog(product)}
                                title="Excluir"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

       {/* Modal de Criação */}
       {showCreateModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowCreateModal(false)}></div>
           <div className="relative bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-semibold text-black">Criar Novo Produto</h2>
               <button
                 onClick={() => setShowCreateModal(false)}
                 className="text-gray-500 hover:text-gray-700"
               >
                 ✕
               </button>
             </div>
             <p className="text-gray-600 mb-4">
               Preencha os campos abaixo para criar um novo produto no sistema.
             </p>
             <ProductForm
               onSave={handleCreate}
               onCancel={() => setShowCreateModal(false)}
               isLoading={createProductMutation.isPending}
             />
           </div>
         </div>
       )}

             {/* Modal de Edição */}
       {showEditModal && editingProduct && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
             setShowEditModal(false);
             setEditingProduct(null);
           }}></div>
           <div className="relative bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-semibold text-black">Editar Produto</h2>
               <button
                 onClick={() => {
                   setShowEditModal(false);
                   setEditingProduct(null);
                 }}
                 className="text-gray-500 hover:text-gray-700"
               >
                 ✕
               </button>
             </div>
             <p className="text-gray-600 mb-4">
               Modifique os campos abaixo para atualizar as informações do produto.
             </p>
             <ProductForm
               product={editingProduct}
               onSave={handleEdit}
               onCancel={() => {
                 setShowEditModal(false);
                 setEditingProduct(null);
               }}
               isLoading={updateProductMutation.isPending}
             />
           </div>
         </div>
       )}

      {/* Modal de Histórico */}
      <ProductHistoryModal
        product={selectedProduct}
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setSelectedProduct(null);
        }}
      />

             {/* Dialog de Confirmação de Exclusão */}
       {showDeleteDialog && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteDialog(false)}></div>
           <div className="relative bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full z-10">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-semibold text-black">Confirmar Exclusão</h2>
               <button
                 onClick={() => setShowDeleteDialog(false)}
                 className="text-gray-500 hover:text-gray-700"
               >
                 ✕
               </button>
             </div>
             <p className="text-gray-600 mb-6">
               Tem certeza que deseja excluir o produto "{selectedProduct?.code}" ({selectedProduct?.description})?
               Esta ação não pode ser desfeita.
             </p>
             <div className="flex justify-end space-x-3">
               <Button
                 variant="outline"
                 onClick={() => setShowDeleteDialog(false)}
                 disabled={deleteProductMutation.isPending}
               >
                 Cancelar
               </Button>
               <Button
                 onClick={handleDelete}
                 disabled={deleteProductMutation.isPending}
                 className="bg-red-600 hover:bg-red-700"
               >
                 {deleteProductMutation.isPending ? 'Excluindo...' : 'Excluir'}
               </Button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}

