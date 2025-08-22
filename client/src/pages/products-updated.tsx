import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
import { useProducts, Product, CreateProductData, UpdateProductData } from '@/hooks/use-products';
import { ProductForm } from '@/components/products/product-form';
import ProductHistoryModal from '@/components/products/ProductHistoryModal';

import { motion, AnimatePresence } from 'framer-motion';

export default function ProductsPage() {
  const { products, isLoading, isCreating, isUpdating, isDeleting, createProduct, updateProduct, deleteProduct, refetch } = useProducts();
  
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Função para filtrar produtos
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesBusinessUnit = businessUnitFilter === 'all' || product.business_unit === businessUnitFilter;
    
    return matchesSearch && matchesCategory && matchesBusinessUnit;
  }).sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  }) || [];

  // Obter categorias e unidades de negócio únicas
  const categories = [...new Set(products?.map(p => p.category).filter(Boolean))] || [];
  const businessUnits = [...new Set(products?.map(p => p.business_unit).filter(Boolean))] || [];

  // Handlers
  const handleCreateProduct = async (data: CreateProductData) => {
    try {
      await createProduct(data);
      setShowCreateModal(false);
    } catch (error) {
      // Erro já tratado no hook useProducts
    }
  };

  const handleUpdateProduct = async (data: UpdateProductData) => {
    if (!editingProduct) return;
    
    try {
      await updateProduct({ id: editingProduct.id, data });
      setShowEditModal(false);
      setEditingProduct(null);
    } catch (error) {
      // Erro já tratado no hook useProducts
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      await deleteProduct(selectedProduct.id);
      setShowDeleteDialog(false);
      setSelectedProduct(null);
    } catch (error) {
      // Erro já tratado no hook useProducts
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const handleHistoryClick = (product: Product) => {
    setSelectedProduct(product);
    setShowHistoryModal(true);
  };

  const handleRefresh = () => {
    refetch();
  };

  // Estatísticas
  const stats = {
    total: filteredProducts.length,
    categories: categories.length,
    businessUnits: businessUnits.length,
    recentlyAdded: filteredProducts.filter(p => {
      const createdAt = new Date(p.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdAt > weekAgo;
    }).length
  };

  return (
    <motion.div 
      className="ds-container max-w-none"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4"
        variants={itemVariants}
      >
        <div>
          <h1 className="ds-heading-1 flex items-center gap-3">
            <Package className="w-8 h-8" />
            Gestão de Produtos
          </h1>
          <p className="ds-text-secondary">
            Gerencie seu catálogo de produtos e informações detalhadas
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="ds-button-secondary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="ds-button-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="ds-grid ds-grid-4 mb-8"
        variants={itemVariants}
      >
        <Card className="ds-card">
          <CardContent className="ds-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="ds-text-sm ds-text-secondary">Total de Produtos</p>
                <p className="ds-heading-3">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="ds-card">
          <CardContent className="ds-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="ds-text-sm ds-text-secondary">Categorias</p>
                <p className="ds-heading-3">{stats.categories}</p>
              </div>
              <Tag className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="ds-card">
          <CardContent className="ds-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="ds-text-sm ds-text-secondary">Unidades de Negócio</p>
                <p className="ds-heading-3">{stats.businessUnits}</p>
              </div>
              <Building className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="ds-card">
          <CardContent className="ds-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="ds-text-sm ds-text-secondary">Adicionados (7 dias)</p>
                <p className="ds-heading-3">{stats.recentlyAdded}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filtros */}
      <motion.div variants={itemVariants}>
        <Card className="ds-card mb-8">
          <CardHeader className="ds-card-header">
            <CardTitle className="ds-heading-3 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent className="ds-card-content">
            <div className="ds-grid ds-grid-2 lg:ds-grid-4 gap-4">
              <div>
                <label className="ds-label">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Código ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ds-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="ds-label">Categoria</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="ds-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="ds-label">Unidade de Negócio</label>
                <Select value={businessUnitFilter} onValueChange={setBusinessUnitFilter}>
                  <SelectTrigger className="ds-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as unidades</SelectItem>
                    {businessUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="ds-label">Ordenar por</label>
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}>
                  <SelectTrigger className="ds-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-desc">Mais recentes</SelectItem>
                    <SelectItem value="createdAt-asc">Mais antigos</SelectItem>
                    <SelectItem value="code-asc">Código (A-Z)</SelectItem>
                    <SelectItem value="code-desc">Código (Z-A)</SelectItem>
                    <SelectItem value="description-asc">Descrição (A-Z)</SelectItem>
                    <SelectItem value="description-desc">Descrição (Z-A)</SelectItem>
                    <SelectItem value="category-asc">Categoria (A-Z)</SelectItem>
                    <SelectItem value="category-desc">Categoria (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabela de Produtos */}
      <motion.div variants={itemVariants}>
        <Card className="ds-card">
          <CardHeader className="ds-card-header">
            <CardTitle className="ds-heading-3">
              Produtos ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="ds-card-content p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="ds-text-secondary">Carregando produtos...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="ds-heading-3 mb-2">Nenhum produto encontrado</h3>
                <p className="ds-text-secondary mb-4">
                  {searchTerm || categoryFilter !== 'all' || businessUnitFilter !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando seu primeiro produto'
                  }
                </p>
                {!searchTerm && categoryFilter === 'all' && businessUnitFilter === 'all' && (
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="ds-button-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Produto
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="w-[140px]">Categoria</TableHead>
                      <TableHead className="w-[160px]">Unidade de Negócio</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[100px] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredProducts.map((product, index) => (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <TableCell className="font-mono text-sm">
                            {product.code}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium ds-text">{product.description}</div>
                              {product.specifications && (
                                <div className="ds-text-xs ds-text-muted">
                                  {product.specifications}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {product.category && (
                              <Badge variant="secondary">
                                {product.category}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {product.business_unit && (
                              <Badge variant="outline">
                                {product.business_unit}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={product.is_active ? "default" : "secondary"}
                              className={product.is_active ? "bg-green-100 text-green-800" : ""}
                            >
                              {product.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleHistoryClick(product)}
                                className="ds-button-ghost h-8 w-8 p-0"
                              >
                                <History className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(product)}
                                className="ds-button-ghost h-8 w-8 p-0"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(product)}
                                className="ds-button-ghost h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                disabled={isDeleting}
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
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modais */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Produto</DialogTitle>
          </DialogHeader>
          <ProductForm
            onSubmit={handleCreateProduct}
            onCancel={() => setShowCreateModal(false)}
            isLoading={isCreating}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              initialData={editingProduct}
              onSubmit={handleUpdateProduct}
              onCancel={() => {
                setShowEditModal(false);
                setEditingProduct(null);
              }}
              isLoading={isUpdating}
            />
          )}
        </DialogContent>
      </Dialog>

      {selectedProduct && (
        <ProductHistoryModal
          isOpen={showHistoryModal}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "{selectedProduct?.code} - {selectedProduct?.description}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
