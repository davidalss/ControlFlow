import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [products] = useState([
    {
      id: "PROD-001",
      name: "Lavadora Pro 3000",
      category: "Lavadoras",
      supplier: "TechParts Inc.",
      status: "active",
      qualityScore: 95,
      lastInspection: "2025-01-15",
      defects: 2,
      price: "R$ 1.250,00",
      stock: 150
    },
    {
      id: "PROD-002",
      name: "Aspirador Compact",
      category: "Aspiradores",
      supplier: "EuroComponents",
      status: "active",
      qualityScore: 98,
      lastInspection: "2025-01-14",
      defects: 0,
      price: "R$ 890,00",
      stock: 75
    },
    {
      id: "PROD-003",
      name: "Liquidificador Turbo",
      category: "Eletrodomésticos",
      supplier: "LatinMotores",
      status: "inactive",
      qualityScore: 82,
      lastInspection: "2025-01-10",
      defects: 8,
      price: "R$ 450,00",
      stock: 0
    },
    {
      id: "PROD-004",
      name: "Furadeira Profissional",
      category: "Ferramentas",
      supplier: "AsianElectronics",
      status: "active",
      qualityScore: 88,
      lastInspection: "2025-01-12",
      defects: 3,
      price: "R$ 680,00",
      stock: 45
    }
  ]);

  const categories = [
    { id: 'all', name: 'Todas as Categorias' },
    { id: 'lavadoras', name: 'Lavadoras' },
    { id: 'aspiradores', name: 'Aspiradores' },
    { id: 'eletrodomesticos', name: 'Eletrodomésticos' },
    { id: 'ferramentas', name: 'Ferramentas' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category.toLowerCase().includes(selectedCategory);
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

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
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
                Novo Produto
              </Button>
          </motion.div>
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
                <p className="text-2xl font-bold text-blue-900">1,234</p>
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
                <p className="text-2xl font-bold text-green-900">1,156</p>
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
                <p className="text-sm font-medium text-yellow-600">Média Qualidade</p>
                <p className="text-2xl font-bold text-yellow-900">92.5%</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              </div>
            </CardContent>
          </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Categorias</p>
                <p className="text-2xl font-bold text-purple-900">24</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1">
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
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
            <CardTitle className="text-xl font-bold text-gray-900">Lista de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Qualidade</TableHead>
                  <TableHead>Última Inspeção</TableHead>
                  <TableHead>Defeitos</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <TableCell className="font-medium">{product.id}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.supplier}</TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell>
                      <span className={`font-bold ${getQualityScoreColor(product.qualityScore)}`}>
                        {product.qualityScore}%
                      </span>
                    </TableCell>
                    <TableCell>{product.lastInspection}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.defects === 0 
                          ? 'bg-green-100 text-green-800' 
                          : product.defects <= 3 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.defects}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{product.price}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock === 0 
                          ? 'bg-red-100 text-red-800' 
                          : product.stock <= 50 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

