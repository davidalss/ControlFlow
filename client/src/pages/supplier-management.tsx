import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
} from '../hooks/use-suppliers-supabase';
import { useProducts } from '../hooks/use-products-supabase';
import { SupplierForm } from '../components/suppliers/supplier-form';
import { SupplierDetails } from '../components/suppliers/supplier-details';
import SupplierTutorial from '../components/suppliers/SupplierTutorial';
import { Eye, Edit, Trash2, Plus, RefreshCw, Download, HelpCircle } from 'lucide-react';

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
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Estados dos modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  
  // Estados dos fornecedores
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplierForDelete, setSelectedSupplierForDelete] = useState<Supplier | null>(null);

  // Hooks
  const { data: suppliersData, isLoading: isLoadingSuppliers, refetch } = useSuppliers({
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
  const evaluationForm = useForm<CreateEvaluationData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      evaluationDate: new Date().toISOString().split('T')[0],
      eventType: 'container_receipt',
      eventDescription: '',
      qualityScore: 0,
      deliveryScore: 0,
      costScore: 0,
      communicationScore: 0,
      technicalScore: 0,
      strengths: [],
      weaknesses: [],
      recommendations: [],
      observations: '',
    },
  });

  const auditForm = useForm<CreateAuditData>({
    resolver: zodResolver(auditSchema),
    defaultValues: {
      auditDate: new Date().toISOString().split('T')[0],
      auditor: '',
      auditType: 'surveillance',
      score: 0,
      status: 'passed',
      findings: [],
      recommendations: [],
      correctiveActions: [],
      nextAuditDate: '',
    },
  });

  // Handlers
  const handleCreateSupplier = async (data: CreateSupplierData | any) => {
    try {
      await createSupplier.mutateAsync(data);
      setShowCreateModal(false);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleEditSupplier = async (data: CreateSupplierData | any) => {
    if (!editingSupplier) return;
    
    try {
      await updateSupplier.mutateAsync({ id: editingSupplier.id, data });
      setShowEditModal(false);
            setEditingSupplier(null);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleDeleteSupplier = async () => {
    if (!selectedSupplierForDelete) return;
    
    try {
      await deleteSupplier.mutateAsync(selectedSupplierForDelete.id);
      setShowDeleteDialog(false);
      setSelectedSupplierForDelete(null);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleCreateEvaluation = (data: CreateEvaluationData) => {
    // Garantir que os campos numéricos sejam números
    const evaluationData = {
      ...data,
      qualityScore: Number(data.qualityScore),
      deliveryScore: Number(data.deliveryScore),
      costScore: Number(data.costScore),
      communicationScore: Number(data.communicationScore),
      technicalScore: Number(data.technicalScore),
    };

    createEvaluation.mutate(
      { supplierId: selectedSupplier, data: evaluationData },
      {
        onSuccess: () => {
          setIsEvaluationDialogOpen(false);
          evaluationForm.reset();
        },
      }
    );
  };

  const handleCreateAudit = (data: CreateAuditData) => {
    // Garantir que o score seja um número
    const auditData = {
      ...data,
      score: Number(data.score),
    };

    createAudit.mutate(
      { supplierId: selectedSupplier, data: auditData },
      {
        onSuccess: () => {
          setIsAuditDialogOpen(false);
          auditForm.reset();
        },
      }
    );
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowEditModal(true);
  };

  const openDetailsModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowDetailsModal(true);
  };

  const openDeleteDialog = (supplier: Supplier) => {
    setSelectedSupplierForDelete(supplier);
    setShowDeleteDialog(true);
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

  // Calcular performance real baseada nas avaliações
  const performanceData = useMemo(() => {
    if (!supplierEvaluations || supplierEvaluations.length === 0) {
      return [];
    }
    
    // Pegar as últimas 5 avaliações para cálculo
    const recentEvaluations = supplierEvaluations.slice(0, 5);
    
    const avgQuality = recentEvaluations.reduce((sum, evaluation) => sum + evaluation.qualityScore, 0) / recentEvaluations.length;
    const avgDelivery = recentEvaluations.reduce((sum, evaluation) => sum + evaluation.deliveryScore, 0) / recentEvaluations.length;
    const avgCost = recentEvaluations.reduce((sum, evaluation) => sum + evaluation.costScore, 0) / recentEvaluations.length;
    const avgCommunication = recentEvaluations.reduce((sum, evaluation) => sum + evaluation.communicationScore, 0) / recentEvaluations.length;
    const avgTechnical = recentEvaluations.reduce((sum, evaluation) => sum + evaluation.technicalScore, 0) / recentEvaluations.length;
    
    return [
      { name: 'Qualidade', value: Math.round(avgQuality) },
      { name: 'Entrega', value: Math.round(avgDelivery) },
      { name: 'Custo', value: Math.round(avgCost) },
      { name: 'Comunicação', value: Math.round(avgCommunication) },
      { name: 'Técnico', value: Math.round(avgTechnical) },
    ];
  }, [supplierEvaluations]);

  // Calcular métricas reais baseadas nas avaliações e auditorias
  const metricsData = useMemo(() => {
    if (!supplierEvaluations || supplierEvaluations.length === 0) {
      return {
        defectRate: 0,
        onTimeDelivery: 0,
        costEfficiency: 0,
        responseTime: 0
      };
    }

    // Calcular taxa de defeitos baseada na qualidade
    const avgQuality = supplierEvaluations.reduce((sum, evaluation) => sum + evaluation.qualityScore, 0) / supplierEvaluations.length;
    const defectRate = Math.max(0, 100 - avgQuality);

    // Calcular entrega no prazo baseada no score de entrega
    const avgDelivery = supplierEvaluations.reduce((sum, evaluation) => sum + evaluation.deliveryScore, 0) / supplierEvaluations.length;
    const onTimeDelivery = avgDelivery;

    // Calcular eficiência de custo baseada no score de custo
    const avgCost = supplierEvaluations.reduce((sum, evaluation) => sum + evaluation.costScore, 0) / supplierEvaluations.length;
    const costEfficiency = avgCost; // Quanto maior o score, melhor a eficiência de custo

    // Calcular tempo de resposta baseado no score de comunicação
    const avgCommunication = supplierEvaluations.reduce((sum, evaluation) => sum + evaluation.communicationScore, 0) / supplierEvaluations.length;
    const responseTime = Math.max(1, Math.round(10 - (avgCommunication / 10))); // 1-10 dias

    return {
      defectRate: Math.round(defectRate),
      onTimeDelivery: Math.round(onTimeDelivery),
      costEfficiency: Math.round(costEfficiency),
      responseTime: responseTime
    };
  }, [supplierEvaluations]);

  // Calcular dados de evolução das métricas
  const evolutionData = useMemo(() => {
    if (!supplierEvaluations || supplierEvaluations.length === 0) {
      return [];
    }

    // Agrupar avaliações por mês (últimos 4 meses)
    const monthlyData = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('pt-BR', { month: 'short' });
      
      // Filtrar avaliações do mês
      const monthEvaluations = supplierEvaluations.filter(evaluation => {
        const evalDate = new Date(evaluation.evaluationDate);
        return evalDate.getMonth() === month.getMonth() && evalDate.getFullYear() === month.getFullYear();
      });

      if (monthEvaluations.length > 0) {
        const avgQuality = monthEvaluations.reduce((sum, evaluation) => sum + evaluation.qualityScore, 0) / monthEvaluations.length;
        const avgDelivery = monthEvaluations.reduce((sum, evaluation) => sum + evaluation.deliveryScore, 0) / monthEvaluations.length;
        const avgCost = monthEvaluations.reduce((sum, evaluation) => sum + evaluation.costScore, 0) / monthEvaluations.length;
        const avgCommunication = monthEvaluations.reduce((sum, evaluation) => sum + evaluation.communicationScore, 0) / monthEvaluations.length;
        
        monthlyData.push({
          month: monthName,
          defectRate: Math.round(100 - avgQuality),
          onTimeDelivery: Math.round(avgDelivery),
          costEfficiency: Math.round(avgCost),
          responseTime: Math.max(1, Math.round(10 - (avgCommunication / 10)))
        });
      } else {
        // Se não há dados do mês, usar dados do mês anterior ou valores padrão
        const lastData: any = monthlyData[monthlyData.length - 1] || { 
          defectRate: 5, 
          onTimeDelivery: 85, 
          costEfficiency: 80, 
          responseTime: 3 
        };
        monthlyData.push({
          month: monthName,
          defectRate: lastData.defectRate,
          onTimeDelivery: lastData.onTimeDelivery,
          costEfficiency: lastData.costEfficiency,
          responseTime: lastData.responseTime
        });
      }
    }

    return monthlyData;
  }, [supplierEvaluations]);

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
        <div className="flex items-center space-x-3">
        <h1 className="text-3xl font-bold">Gestão de Fornecedores</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTutorial(true)}
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            title="Ajuda - Como usar a gestão de fornecedores"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setFilterStatus('all');
              setFilterCategory('all');
              setFilterType('all');
              setSearchTerm('');
            }}
          >
            Limpar Filtros
          </Button>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoadingSuppliers}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingSuppliers ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
                    </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Fornecedor</span>
                    </Button>
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
                        onClick={() => openDetailsModal(supplier)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(supplier)}
                      >
                        <Edit className="h-4 w-4" />
                          </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteDialog(supplier)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                <TabsTrigger value="evaluations">Avaliações</TabsTrigger>
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
                        <p>{selectedSupplierData.nextAudit ? new Date(selectedSupplierData.nextAudit).toLocaleDateString() : 'Não definida'}</p>
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
                  {selectedSupplierData.performance && Object.entries(selectedSupplierData.performance).map(([key, value]) => (
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
                              Number(value) >= 90 ? 'bg-green-500' :
                              Number(value) >= 80 ? 'bg-blue-500' :
                              Number(value) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Number(value)}%` }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="evaluations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Avaliações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {supplierEvaluations.map(evaluation => (
                        <div key={evaluation.id} className="border rounded p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-medium">Avaliação {new Date(evaluation.evaluationDate).toLocaleDateString()}</h3>
                              <p className="text-sm text-gray-600">Tipo: {evaluation.eventType}</p>
                              {evaluation.eventDescription && (
                                <p className="text-sm text-gray-500">{evaluation.eventDescription}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge variant="default">
                                {evaluation.eventType === 'container_receipt' ? 'Recebimento' :
                                 evaluation.eventType === 'audit' ? 'Auditoria' :
                                 evaluation.eventType === 'quality_review' ? 'Revisão de Qualidade' : 'Revisão de Performance'}
                              </Badge>
                              <div className="text-lg font-bold text-blue-600">{evaluation.overallScore.toFixed(1)}%</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Qualidade</div>
                              <div className="text-lg font-bold text-green-600">{evaluation.qualityScore}%</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Entrega</div>
                              <div className="text-lg font-bold text-blue-600">{evaluation.deliveryScore}%</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Custo</div>
                              <div className="text-lg font-bold text-purple-600">{evaluation.costScore}%</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Comunicação</div>
                              <div className="text-lg font-bold text-orange-600">{evaluation.communicationScore}%</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Técnico</div>
                              <div className="text-lg font-bold text-red-600">{evaluation.technicalScore}%</div>
                            </div>
                          </div>

                          {evaluation.observations && (
                            <div className="mt-3 p-3 bg-gray-50 rounded">
                              <Label className="text-sm font-medium">Observações</Label>
                              <p className="text-sm text-gray-600 mt-1">{evaluation.observations}</p>
                            </div>
                          )}
                        </div>
                      ))}
                      {supplierEvaluations.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <p>Nenhuma avaliação encontrada</p>
                          <p className="text-sm">Crie uma nova avaliação para começar</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
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
                                {audit.findings && Array.isArray(audit.findings) && audit.findings.map((finding: string, index: number) => (
                                  <li key={index} className="list-disc list-inside">• {finding}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Recomendações</Label>
                              <ul className="text-sm text-gray-600 mt-1">
                                {audit.recommendations && Array.isArray(audit.recommendations) && audit.recommendations.map((rec: string, index: number) => (
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
                          {metricsData.defectRate}%
                        </div>
                        <div className="text-sm text-gray-600">Taxa de Defeitos</div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-green-600">
                          {metricsData.onTimeDelivery}%
                        </div>
                        <div className="text-sm text-gray-600">Entrega no Prazo</div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-purple-600">
                          {metricsData.costEfficiency}%
                        </div>
                        <div className="text-sm text-gray-600">Eficiência de Custo</div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-orange-600">
                          {metricsData.responseTime} dias
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
                      <LineChart data={evolutionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="defectRate" stroke="#ef4444" name="Taxa de Defeitos (%)" />
                        <Line type="monotone" dataKey="onTimeDelivery" stroke="#10b981" name="Entrega no Prazo (%)" />
                        <Line type="monotone" dataKey="costEfficiency" stroke="#3b82f6" name="Eficiência de Custo (%)" />
                        <Line type="monotone" dataKey="responseTime" stroke="#f97316" name="Tempo de Resposta (dias)" />
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

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowCreateModal(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Criar Novo Fornecedor</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Preencha os campos abaixo para criar um novo fornecedor no sistema.
            </p>
            <SupplierForm
              onSave={handleCreateSupplier}
              onCancel={() => setShowCreateModal(false)}
              isLoading={createSupplier.isPending}
              products={productsData || []}
                />
              </div>
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && editingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
            setShowEditModal(false);
            setEditingSupplier(null);
          }}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Editar Fornecedor</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSupplier(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
                        </div>
            <p className="text-gray-600 mb-4">
              Modifique os campos abaixo para atualizar as informações do fornecedor.
            </p>
            <SupplierForm
              supplier={editingSupplier}
              onSave={handleEditSupplier}
              onCancel={() => {
                setShowEditModal(false);
                setEditingSupplier(null);
              }}
              isLoading={updateSupplier.isPending}
              products={productsData || []}
            />
                    </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetailsModal && editingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
            setShowDetailsModal(false);
            setEditingSupplier(null);
          }}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Detalhes do Fornecedor</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setEditingSupplier(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
                </div>
            <SupplierDetails
              supplier={editingSupplier}
              onClose={() => {
                setShowDetailsModal(false);
                setEditingSupplier(null);
              }}
              onEdit={() => {
                setShowDetailsModal(false);
                setShowEditModal(true);
              }}
            />
              </div>
        </div>
      )}

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
              Tem certeza que deseja excluir o fornecedor "{selectedSupplierForDelete?.name}" ({selectedSupplierForDelete?.code})?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleteSupplier.isPending}
              >
                  Cancelar
                </Button>
              <Button
                onClick={handleDeleteSupplier}
                disabled={deleteSupplier.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteSupplier.isPending ? 'Excluindo...' : 'Excluir'}
                </Button>
              </div>
          </div>
        </div>
      )}



      {/* Modal de Avaliação */}
      {isEvaluationDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsEvaluationDialogOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Nova Avaliação de Fornecedor</h2>
              <button
                onClick={() => setIsEvaluationDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Preencha os critérios de avaliação para o fornecedor selecionado.
            </p>
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

                <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEvaluationDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createEvaluation.isPending}>
                  {createEvaluation.isPending ? 'Criando...' : 'Criar Avaliação'}
                </Button>
              </div>
            </form>
          </Form>
          </div>
        </div>
      )}

      {/* Modal de Auditoria */}
      {isAuditDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsAuditDialogOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Nova Auditoria de Fornecedor</h2>
              <button
                onClick={() => setIsAuditDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Preencha os dados da auditoria para o fornecedor selecionado.
            </p>
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

                <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAuditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createAudit.isPending}>
                  {createAudit.isPending ? 'Criando...' : 'Criar Auditoria'}
                </Button>
              </div>
            </form>
          </Form>
          </div>
        </div>
      )}

      {/* Modal de Tutorial */}
      <SupplierTutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
      />
    </div>
  );
}
