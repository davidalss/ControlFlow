import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Eye,
  Search,
  RefreshCw,
  AlertCircle,
  FileText,
  Filter,
  Download,
  Upload,
  Settings,
  Calendar,
  Users,
  Target,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Grid3X3,
  List,
  MoreVertical,
  Star,
  Bookmark,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useInspectionPlans, type InspectionPlan } from '@/hooks/use-inspection-plans-simple';

export default function InspectionPlansSimplePage() {
  const { toast } = useToast();
  const { plans, loading, error, createPlan, updatePlan, deletePlan, loadPlans } = useInspectionPlans();
  
  // Estados para criação/edição
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InspectionPlan | null>(null);
  
  // Estados para filtros e visualização
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('createdAt');

  // Função para criar plano
  const handleCreatePlan = () => {
    setIsCreating(true);
    setSelectedPlan({
      id: '',
      planCode: '',
      planName: '',
      planType: 'product',
      version: 'Rev. 01',
      status: 'draft',
      productName: '',
      productFamily: '',
      businessUnit: 'N/A',
      linkedProducts: [],
      voltageConfiguration: {},
      inspectionType: 'mixed',
      aqlCritical: 0.065,
      aqlMajor: 1.0,
      aqlMinor: 2.5,
      steps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  // Função para editar plano
  const handleEditPlan = (plan: InspectionPlan) => {
    setIsEditing(true);
    setSelectedPlan(plan);
  };

  // Função para visualizar plano
  const handleViewPlan = (plan: InspectionPlan) => {
    setSelectedPlan(plan);
  };

  // Função para excluir plano
  const handleDeletePlan = async (plan: InspectionPlan) => {
    if (window.confirm(`Tem certeza que deseja excluir o plano "${plan.planName}"?`)) {
      const success = await deletePlan(plan.id);
      if (success) {
      toast({
        title: "Sucesso",
        description: "Plano excluído com sucesso"
      });
      }
    }
  };

  // Função para recarregar
  const handleRetry = () => {
    loadPlans();
  };

  // Filtrar planos
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.planCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Estatísticas
  const stats = {
    total: plans.length,
    active: plans.filter(p => p.status === 'active').length,
    draft: plans.filter(p => p.status === 'draft').length,
    archived: plans.filter(p => p.status === 'archived').length
  };

  // Componente de card do plano
  const PlanCard = ({ plan }: { plan: InspectionPlan }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant={plan.status === 'active' ? 'default' : plan.status === 'draft' ? 'secondary' : 'outline'}
                className="text-xs"
              >
                {plan.status === 'active' ? 'Ativo' : plan.status === 'draft' ? 'Rascunho' : 'Arquivado'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {plan.version}
              </Badge>
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {plan.planName}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {plan.planCode}
            </p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={() => handleViewPlan(plan)}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleEditPlan(plan)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDeletePlan(plan)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Target className="w-4 h-4" />
            <span>{plan.productName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{plan.businessUnit}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{new Date(plan.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <BarChart3 className="w-4 h-4" />
            <span>{plan.steps?.length || 0} etapas</span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">4.8</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm">
                <Bookmark className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Componente de lista do plano
  const PlanListItem = ({ plan }: { plan: InspectionPlan }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{plan.planName}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{plan.planCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{plan.productName}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{plan.businessUnit}</p>
            </div>
            <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
              {plan.status === 'active' ? 'Ativo' : 'Rascunho'}
            </Badge>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => handleViewPlan(plan)}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleEditPlan(plan)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDeletePlan(plan)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Carregando planos de inspeção...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Erro ao carregar planos</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header com estatísticas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Planos de Inspeção</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gerencie e monitore os planos de inspeção de qualidade
            </p>
        </div>
          <Button 
            onClick={handleCreatePlan} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
          <Plus className="w-4 h-4 mr-2" />
          Novo Plano
        </Button>
      </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Ativos</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Rascunhos</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.draft}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Arquivados</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.archived}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filtros e controles */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar planos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="draft">Rascunhos</SelectItem>
                  <SelectItem value="archived">Arquivados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Data</SelectItem>
                  <SelectItem value="planName">Nome</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
                    </div>
                    
            <div className="flex items-center gap-2">
                      <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                onClick={() => setViewMode('grid')}
                      >
                <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
                      </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

      {/* Lista de planos */}
      <div className="space-y-4">
        {filteredPlans.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum plano encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Comece criando seu primeiro plano de inspeção'
                }
              </p>
              <Button onClick={handleCreatePlan} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Plano
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredPlans.map((plan) => (
              viewMode === 'grid' ? (
                <PlanCard key={plan.id} plan={plan} />
              ) : (
                <PlanListItem key={plan.id} plan={plan} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
