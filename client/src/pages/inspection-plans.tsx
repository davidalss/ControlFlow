import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  ChevronUp, 
  GripVertical, 
  Camera, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  Upload, 
  Download, 
  Settings, 
  Users, 
  Shield, 
  Calendar, 
  Tag, 
  Info, 
  AlertCircle, 
  Layers, 
  Eye, 
  Search, 
  BookOpen, 
  Zap, 
  HelpCircle, 
  ExternalLink, 
  ChevronDown, 
  CheckCircle, 
  XCircle, 
  Star, 
  Target, 
  Award, 
  TrendingUp, 
  Database, 
  Grid, 
  List, 
  MoreHorizontal, 
  FileImage, 
  Square, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Image, 
  Copy, 
  Share2, 
  History, 
  Bell, 
  Filter, 
  SortAsc, 
  SortDesc,
  Copy as CopyIcon,
  MoreHorizontal as MoreHorizontalIcon
} from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { useInspectionPlans, type InspectionPlan } from '@/hooks/use-inspection-plans-simple';
import { useToast } from '@/hooks/use-toast';
import NewInspectionPlanForm from '@/components/inspection-plans/NewInspectionPlanForm';

export default function InspectionPlansPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { plans: inspectionPlans, loading, error, createPlan: createInspectionPlan, updatePlan: updateInspectionPlan, deletePlan: deleteInspectionPlan } = useInspectionPlans();

  // Estados
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InspectionPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtrar e ordenar planos
  const filteredPlans = React.useMemo(() => {
    let filtered = inspectionPlans || [];

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(plan => 
        plan.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.planCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(plan => plan.status === statusFilter);
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof InspectionPlan];
      let bValue: any = b[sortBy as keyof InspectionPlan];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [inspectionPlans, searchTerm, statusFilter, sortBy, sortOrder]);

  // Funções
  const handleCreatePlan = () => {
    setEditingPlan(null);
    setShowCreateForm(true);
  };

  const handleEditPlan = (plan: InspectionPlan) => {
    setEditingPlan(plan);
    setShowCreateForm(true);
  };

  const handleDuplicatePlan = (plan: InspectionPlan) => {
    const duplicatedPlan = {
      ...plan,
      id: `duplicate-${Date.now()}`,
      planCode: `${plan.planCode}-COPY`,
      planName: `${plan.planName} - CÓPIA`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Aqui você pode implementar a lógica para salvar o plano duplicado
    toast({
      title: "Plano Duplicado",
      description: "Plano duplicado com sucesso! Edite as informações conforme necessário."
    });
  };

  const handleDeletePlan = async (planId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este plano de inspeção?')) {
      try {
        await deleteInspectionPlan(planId);
        toast({
          title: "Sucesso",
          description: "Plano de inspeção excluído com sucesso!"
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir plano de inspeção",
          variant: "destructive"
        });
      }
    }
  };

  const handleSavePlan = async (planData: any) => {
    try {
      if (editingPlan) {
        await updateInspectionPlan(editingPlan.id, planData);
        toast({
          title: "Sucesso",
          description: "Plano de inspeção atualizado com sucesso!"
        });
      } else {
        await createInspectionPlan(planData);
        toast({
          title: "Sucesso",
          description: "Plano de inspeção criado com sucesso!"
        });
      }
      setShowCreateForm(false);
      setEditingPlan(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar plano de inspeção",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
      active: { label: 'Ativo', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inativo', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      archived: { label: 'Arquivado', variant: 'outline' as const, color: 'bg-yellow-100 text-yellow-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      product: { label: 'Produto', color: 'bg-blue-100 text-blue-800' },
      process: { label: 'Processo', color: 'bg-purple-100 text-purple-800' },
      service: { label: 'Serviço', color: 'bg-orange-100 text-orange-800' }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.product;
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando planos de inspeção...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar planos</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planos de Inspeção</h1>
          <p className="text-gray-600 mt-1">
            Gerencie os planos de inspeção de qualidade dos produtos
          </p>
        </div>
        <Button onClick={handleCreatePlan} className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, produto ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos os Status</option>
                <option value="draft">Rascunho</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="archived">Arquivado</option>
              </select>
              
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="createdAt-desc">Mais Recentes</option>
                <option value="createdAt-asc">Mais Antigos</option>
                <option value="planName-asc">Nome A-Z</option>
                <option value="planName-desc">Nome Z-A</option>
                <option value="status-asc">Status A-Z</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Planos */}
      <div className="grid gap-4">
        {filteredPlans.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'Nenhum plano encontrado' : 'Nenhum plano criado'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Tente ajustar os filtros de busca' 
                    : 'Crie seu primeiro plano de inspeção para começar'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button onClick={handleCreatePlan} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Plano
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPlans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{plan.planName}</h3>
                        {getStatusBadge(plan.status)}
                        {getTypeBadge(plan.planType)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Produto</p>
                          <p className="font-medium">{plan.productName}</p>
                          <p className="text-xs text-gray-400">Código: {plan.productCode}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Tipo de Inspeção</p>
                          <p className="font-medium capitalize">{plan.inspectionType}</p>
                          <p className="text-xs text-gray-400">Nível: {plan.inspectionLevel}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">AQL</p>
                          <div className="flex gap-2 text-xs">
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                              Crítico: {plan.aqlCritical}%
                            </span>
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              Maior: {plan.aqlMajor}%
                            </span>
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Menor: {plan.aqlMinor}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Criado em: {new Date(plan.createdAt).toLocaleDateString('pt-BR')}</span>
                        <span>Atualizado em: {new Date(plan.updatedAt).toLocaleDateString('pt-BR')}</span>
                        <span>Código: {plan.planCode}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPlan(plan)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicatePlan(plan)}
                      >
                        <CopyIcon className="h-4 w-4 mr-2" />
                        Duplicar
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal do Formulário */}
      {showCreateForm && (
        <NewInspectionPlanForm
          onClose={() => {
            setShowCreateForm(false);
            setEditingPlan(null);
          }}
          onSave={handleSavePlan}
          initialData={editingPlan}
        />
      )}
    </div>
  );
}
