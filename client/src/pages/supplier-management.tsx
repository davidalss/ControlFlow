import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  useSuppliers, 
  useSupplier, 
  useSuppliersStats, 
  useCreateSupplier, 
  useUpdateSupplier, 
  useDeleteSupplier,
  useCreateEvaluation,
  useCreateAudit,
  useClearMockSuppliers,
  type Supplier,
  type CreateSupplierData,
  type CreateEvaluationData,
  type CreateAuditData
} from '../hooks/use-suppliers';
import { useProducts } from '../hooks/use-products';

// Schemas de validação
const supplierSchema = z.object({
  code: z.string().min(1, 'Código é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['imported', 'national']),
  country: z.string().min(1, 'País é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  contactPerson: z.string().min(1, 'Contato é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  address: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  observations: z.string().optional(),
  productIds: z.array(z.string()).optional(),
});

const evaluationSchema = z.object({
  evaluationDate: z.string().optional(),
  eventType: z.enum(['container_receipt', 'audit', 'quality_review', 'performance_review']),
  eventDescription: z.string().optional(),
  qualityScore: z.number().min(0).max(100),
  deliveryScore: z.number().min(0).max(100),
  costScore: z.number().min(0).max(100),
  communicationScore: z.number().min(0).max(100),
  technicalScore: z.number().min(0).max(100),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
  observations: z.string().optional(),
});

const auditSchema = z.object({
  auditDate: z.string().optional(),
  auditor: z.string().min(1, 'Auditor é obrigatório'),
  auditType: z.enum(['initial', 'surveillance', 'recertification', 'follow_up']),
  score: z.number().min(0).max(100),
  status: z.enum(['passed', 'failed', 'conditional']),
  findings: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
  correctiveActions: z.array(z.string()).optional(),
  nextAuditDate: z.string().optional(),
});

export default function SupplierManagementPage() {
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Hooks
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useSuppliers({
    status: filterStatus !== 'all' ? filterStatus : undefined,
    category: filterCategory !== 'all' ? filterCategory : undefined,
    type: filterType !== 'all' ? filterType : undefined,
    search: searchTerm || undefined,
  });

  const { data: supplierData, isLoading: isLoadingSupplier } = useSupplier(selectedSupplier);
  const { data: statsData } = useSuppliersStats();
  const { data: productsData } = useProducts();

  // Mutations
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();
  const createEvaluation = useCreateEvaluation();
  const createAudit = useCreateAudit();
  const clearMockSuppliers = useClearMockSuppliers();

  // Forms
  const createForm = useForm<CreateSupplierData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      code: '',
      name: '',
      type: 'national',
      country: '',
      category: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      observations: '',
      productIds: [],
    },
  });

  const editForm = useForm<CreateSupplierData>({
    resolver: zodResolver(supplierSchema),
  });

  const evaluationForm = useForm<CreateEvaluationData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      eventType: 'container_receipt',
      qualityScore: 0,
      deliveryScore: 0,
      costScore: 0,
      communicationScore: 0,
      technicalScore: 0,
      strengths: [],
      weaknesses: [],
      recommendations: [],
    },
  });

  const auditForm = useForm<CreateAuditData>({
    resolver: zodResolver(auditSchema),
    defaultValues: {
      auditor: '',
      auditType: 'surveillance',
      score: 0,
      status: 'passed',
      findings: [],
      recommendations: [],
      correctiveActions: [],
    },
  });

  // Handlers
  const handleCreateSupplier = (data: CreateSupplierData) => {
    createSupplier.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        createForm.reset();
      },
    });
  };

  const handleEditSupplier = (data: CreateSupplierData) => {
    if (editingSupplier) {
      updateSupplier.mutate(
        { id: editingSupplier.id, data },
        {
          onSuccess: () => {
            setIsEditDialogOpen(false);
            setEditingSupplier(null);
            editForm.reset();
          },
        }
      );
    }
  };

  const handleDeleteSupplier = (id: string) => {
    deleteSupplier.mutate(id);
  };

  const handleCreateEvaluation = (data: CreateEvaluationData) => {
    createEvaluation.mutate(
      { supplierId: selectedSupplier, data },
      {
        onSuccess: () => {
          setIsEvaluationDialogOpen(false);
          evaluationForm.reset();
        },
      }
    );
  };

  const handleCreateAudit = (data: CreateAuditData) => {
    createAudit.mutate(
      { supplierId: selectedSupplier, data },
      {
        onSuccess: () => {
          setIsAuditDialogOpen(false);
          auditForm.reset();
        },
      }
    );
  };

  const handleEditClick = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    editForm.reset({
      code: supplier.code,
      name: supplier.name,
      type: supplier.type,
      country: supplier.country,
      category: supplier.category,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address || '',
      website: supplier.website || '',
      observations: supplier.observations || '',
      productIds: supplierData?.products.map(p => p.productId) || [],
    });
    setIsEditDialogOpen(true);
  };

  // Funções auxiliares
  const getStatusBadge = (status: Supplier['status']) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'suspended': return <Badge variant="destructive">Suspenso</Badge>;
      case 'under_review': return <Badge className="bg-yellow-100 text-yellow-800">Em Revisão</Badge>;
      case 'blacklisted': return <Badge className="bg-red-100 text-red-800">Lista Negra</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 90) return 'text-green-600';
    if (value >= 80) return 'text-blue-600';
    if (value >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const suppliers = suppliersData?.suppliers || [];
  const selectedSupplierData = supplierData?.supplier;
  const supplierAudits = supplierData?.audits || [];
  const supplierEvaluations = supplierData?.evaluations || [];

  // Dados para gráficos (mock para demonstração)
  const performanceData = selectedSupplierData ? [
    { name: 'Qualidade', value: 85 },
    { name: 'Entrega', value: 90 },
    { name: 'Custo', value: 75 },
    { name: 'Comunicação', value: 88 },
    { name: 'Técnico', value: 82 },
  ] : [];

  if (isLoadingSuppliers) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando fornecedores...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Fornecedores</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => clearMockSuppliers.mutate()}
            disabled={clearMockSuppliers.isPending}
          >
            {clearMockSuppliers.isPending ? 'Limpando...' : 'Limpar Mock'}
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Novo Fornecedor</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Fornecedor</DialogTitle>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreateSupplier)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código</FormLabel>
                          <FormControl>
                            <Input placeholder="SUP001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do fornecedor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="national">Nacional</SelectItem>
                              <SelectItem value="imported">Importado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País</FormLabel>
                          <FormControl>
                            <Input placeholder="Brasil" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <FormControl>
                            <Input placeholder="Componentes Eletrônicos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contato</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do contato" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contato@fornecedor.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="+55 11 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input placeholder="Endereço completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://www.fornecedor.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={createForm.control}
                    name="observations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Observações adicionais" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createSupplier.isPending}>
                      {createSupplier.isPending ? 'Criando...' : 'Criar Fornecedor'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                  <SelectItem value="under_review">Em Revisão</SelectItem>
                  <SelectItem value="blacklisted">Lista Negra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="national">Nacional</SelectItem>
                  <SelectItem value="imported">Importado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  <SelectItem value="Componentes Eletrônicos">Componentes Eletrônicos</SelectItem>
                  <SelectItem value="Motores e Bombas">Motores e Bombas</SelectItem>
                  <SelectItem value="Componentes Mecânicos">Componentes Mecânicos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Buscar</Label>
              <Input 
                placeholder="Nome, código ou contato" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suppliers List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Fornecedores ({suppliers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suppliers.map(supplier => (
                  <div
                    key={supplier.id}
                    className={`p-3 border rounded transition-colors ${
                      selectedSupplier === supplier.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="cursor-pointer"
                      onClick={() => setSelectedSupplier(supplier.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{supplier.name}</h3>
                          <p className="text-sm text-gray-600">{supplier.code}</p>
                          <p className="text-sm text-gray-500">{supplier.country}</p>
                          <p className="text-xs text-gray-400">{supplier.type === 'imported' ? 'Importado' : 'Nacional'}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(supplier.status)}
                          <div className={`text-lg font-bold ${getRatingColor(supplier.rating)}`}>
                            {supplier.rating.toFixed(1)} ⭐
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(supplier)}
                      >
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o fornecedor "{supplier.name}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSupplier(supplier.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
                {suppliers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum fornecedor encontrado</p>
                    <p className="text-sm">Crie um novo fornecedor para começar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supplier Details */}
        <div className="lg:col-span-2">
          {selectedSupplierData ? (
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="audits">Auditorias</TabsTrigger>
                <TabsTrigger value="metrics">Métricas</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      Informações do Fornecedor
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEvaluationDialogOpen(true)}
                        >
                          Nova Avaliação
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsAuditDialogOpen(true)}
                        >
                          Nova Auditoria
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome</Label>
                        <p className="font-medium">{selectedSupplierData.name}</p>
                      </div>
                      <div>
                        <Label>Código</Label>
                        <p className="font-medium">{selectedSupplierData.code}</p>
                      </div>
                      <div>
                        <Label>País</Label>
                        <p>{selectedSupplierData.country}</p>
                      </div>
                      <div>
                        <Label>Categoria</Label>
                        <p>{selectedSupplierData.category}</p>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div>{getStatusBadge(selectedSupplierData.status)}</div>
                      </div>
                      <div>
                        <Label>Avaliação</Label>
                        <p className={`text-lg font-bold ${getRatingColor(selectedSupplierData.rating)}`}>
                          {selectedSupplierData.rating.toFixed(1)} ⭐
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contato</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Contato</Label>
                        <p>{selectedSupplierData.contactPerson}</p>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <p>{selectedSupplierData.email}</p>
                      </div>
                      <div>
                        <Label>Telefone</Label>
                        <p>{selectedSupplierData.phone}</p>
                      </div>
                      <div>
                        <Label>Próxima Auditoria</Label>
                        <p>{new Date(selectedSupplierData.nextAudit).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={performanceData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Performance"
                          dataKey="value"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedSupplierData.performance).map(([key, value]) => (
                    <Card key={key}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <span className="capitalize">{key}</span>
                          <span className={`text-lg font-bold ${getPerformanceColor(value)}`}>
                            {value}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className={`h-2 rounded-full ${
                              value >= 90 ? 'bg-green-500' :
                              value >= 80 ? 'bg-blue-500' :
                              value >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="audits" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Auditorias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {supplierAudits.map(audit => (
                        <div key={audit.id} className="border rounded p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-medium">Auditoria {audit.auditDate}</h3>
                              <p className="text-sm text-gray-600">Auditor: {audit.auditor}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={audit.status === 'passed' ? 'default' : audit.status === 'conditional' ? 'secondary' : 'destructive'}>
                                {audit.status === 'passed' ? 'Aprovado' : audit.status === 'conditional' ? 'Condicional' : 'Reprovado'}
                              </Badge>
                              <div className="text-lg font-bold text-blue-600">{audit.score}%</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Achados</Label>
                              <ul className="text-sm text-gray-600 mt-1">
                                {audit.findings.map((finding, index) => (
                                  <li key={index} className="list-disc list-inside">• {finding}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Recomendações</Label>
                              <ul className="text-sm text-gray-600 mt-1">
                                {audit.recommendations.map((rec, index) => (
                                  <li key={index} className="list-disc list-inside">• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas de Qualidade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedSupplierData.metrics.defectRate}%
                        </div>
                        <div className="text-sm text-gray-600">Taxa de Defeitos</div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedSupplierData.metrics.onTimeDelivery}%
                        </div>
                        <div className="text-sm text-gray-600">Entrega no Prazo</div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedSupplierData.metrics.costVariance}%
                        </div>
                        <div className="text-sm text-gray-600">Variação de Custo</div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-orange-600">
                          {selectedSupplierData.metrics.responseTime} dias
                        </div>
                        <div className="text-sm text-gray-600">Tempo de Resposta</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Evolução das Métricas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={[
                        { month: 'Jan', defects: 2.5, delivery: 92, cost: -2.1 },
                        { month: 'Fev', defects: 2.1, delivery: 94, cost: -3.2 },
                        { month: 'Mar', defects: 1.8, delivery: 96, cost: -1.8 },
                        { month: 'Abr', defects: 2.1, delivery: 94.5, cost: -3.2 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="defects" stroke="#ef4444" name="Taxa de Defeitos (%)" />
                        <Line type="monotone" dataKey="delivery" stroke="#10b981" name="Entrega no Prazo (%)" />
                        <Line type="monotone" dataKey="cost" stroke="#3b82f6" name="Variação de Custo (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Selecione um fornecedor para ver os detalhes</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Fornecedor</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSupplier)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="national">Nacional</SelectItem>
                          <SelectItem value="imported">Importado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contato</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateSupplier.isPending}>
                  {updateSupplier.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Avaliação */}
      <Dialog open={isEvaluationDialogOpen} onOpenChange={setIsEvaluationDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Avaliação de Fornecedor</DialogTitle>
          </DialogHeader>
          <Form {...evaluationForm}>
            <form onSubmit={evaluationForm.handleSubmit(handleCreateEvaluation)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={evaluationForm.control}
                  name="evaluationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Avaliação</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={evaluationForm.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Evento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="container_receipt">Recebimento de Container</SelectItem>
                          <SelectItem value="audit">Auditoria</SelectItem>
                          <SelectItem value="quality_review">Revisão de Qualidade</SelectItem>
                          <SelectItem value="performance_review">Revisão de Performance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={evaluationForm.control}
                  name="eventDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição do Evento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Recebimento Container ABC123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Critérios de Avaliação (0-100)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={evaluationForm.control}
                    name="qualityScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualidade</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={evaluationForm.control}
                    name="deliveryScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entrega</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={evaluationForm.control}
                    name="costScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custo</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={evaluationForm.control}
                    name="communicationScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comunicação</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={evaluationForm.control}
                    name="technicalScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suporte Técnico</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={evaluationForm.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Observações sobre a avaliação" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEvaluationDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createEvaluation.isPending}>
                  {createEvaluation.isPending ? 'Criando...' : 'Criar Avaliação'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Auditoria */}
      <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Auditoria de Fornecedor</DialogTitle>
          </DialogHeader>
          <Form {...auditForm}>
            <form onSubmit={auditForm.handleSubmit(handleCreateAudit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={auditForm.control}
                  name="auditDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Auditoria</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={auditForm.control}
                  name="auditor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auditor</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do auditor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={auditForm.control}
                  name="auditType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Auditoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="initial">Inicial</SelectItem>
                          <SelectItem value="surveillance">Vigilância</SelectItem>
                          <SelectItem value="recertification">Recertificação</SelectItem>
                          <SelectItem value="follow_up">Acompanhamento</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={auditForm.control}
                  name="score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Score (0-100)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={auditForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="passed">Aprovado</SelectItem>
                          <SelectItem value="failed">Reprovado</SelectItem>
                          <SelectItem value="conditional">Condicional</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={auditForm.control}
                  name="nextAuditDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Próxima Auditoria</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAuditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createAudit.isPending}>
                  {createAudit.isPending ? 'Criando...' : 'Criar Auditoria'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
