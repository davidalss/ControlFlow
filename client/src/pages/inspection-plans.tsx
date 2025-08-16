import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Eye, 
  Edit, 
  Trash2, 
  Camera, 
  FileText, 
  Tag, 
  CheckCircle,
  XCircle, 
  AlertTriangle,
  Clock,
  User,
  Calendar,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Star,
  History,
  Copy,
  Share2,
  Lock,
  Unlock,
  Image,
  FileImage,
  CheckSquare,
  Square,
  ArrowRight,
  ArrowLeft,
  Save,
  RefreshCw,
  Zap,
  Target,
  Shield,
  Award,
  TrendingUp,
  Users,
  Database,
  Layers,
  Grid,
  List,
  MoreHorizontal,
  Info
} from 'lucide-react';
import { useInspectionPlans, type InspectionPlan } from '@/hooks/use-inspection-plans';
import PlanForm from '@/components/inspection-plans/PlanForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface RevisionHistory {
  id: string;
  revision: number;
  changes: string[];
  changedBy: string;
  changedAt: Date;
  reason: string;
}

export default function InspectionPlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<InspectionPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProduct, setFilterProduct] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<RevisionHistory | null>(null);
  
  const { 
    plans, 
    loading, 
    error, 
    createPlan, 
    updatePlan, 
    duplicatePlan, 
    deletePlan, 
    exportPlan, 
    importPlan 
  } = useInspectionPlans();

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = (plan.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (plan.productName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || plan.status === filterStatus;
    const matchesProduct = filterProduct === 'all' || plan.productId === filterProduct;
    
    return matchesSearch && matchesStatus && matchesProduct;
  });

  const handleCreatePlan = () => {
    setIsCreating(true);
  };

  const handleViewPlan = (plan: InspectionPlan) => {
    setSelectedPlan(plan);
    setIsViewing(true);
  };

  const handleEditPlan = (plan: InspectionPlan) => {
    setSelectedPlan(plan);
    setIsEditing(true);
  };

  const handleViewHistory = (plan: InspectionPlan) => {
    setSelectedPlan(plan);
    setShowHistory(true);
  };

  const handleSavePlan = async (planData: Omit<InspectionPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (isEditing && selectedPlan) {
      await updatePlan(selectedPlan.id, planData);
    } else {
      await createPlan(planData);
    }
    setIsCreating(false);
    setIsEditing(false);
    setSelectedPlan(null);
  };

  const handleDuplicatePlan = async (plan: InspectionPlan) => {
    try {
      await duplicatePlan(plan);
    } catch (error) {
      console.error('Erro ao duplicar plano:', error);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm('Tem certeza que deseja excluir este plano?')) {
      try {
        await deletePlan(planId);
      } catch (error) {
        console.error('Erro ao excluir plano:', error);
      }
    }
  };

  const handleExportPlan = (plan: InspectionPlan) => {
    try {
      exportPlan(plan);
    } catch (error) {
      console.error('Erro ao exportar plano:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <AlertTriangle className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      case 'archived': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6 padding-responsive">
      {/* Header */}
      <div className="flex items-center justify-between header-content inspection-plans-header">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3 inspection-plans-title">
            <Settings className="w-8 h-8 text-blue-600" />
            <span>Planos de Inspeção</span>
          </h1>
          <p className="text-gray-600 mt-2 flex items-center space-x-2 inspection-plans-subtitle">
            <Info className="w-4 h-4" />
            <span>Gerencie planos de inspeção para produtos específicos com campos condicionais e histórico completo</span>
          </p>
        </div>
        <div className="flex items-center space-x-3 header-actions inspection-plans-actions">
          <Button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            variant="outline"
            size="sm"
            className="hidden-mobile"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
          <Button onClick={handleCreatePlan} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden-mobile">Novo Plano</span>
            <span className="mobile-only">Novo</span>
          </Button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-6 card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 form-grid filters-container">
              <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                placeholder="Buscar planos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            <Select value={filterProduct} onValueChange={setFilterProduct}>
                <SelectTrigger>
                <SelectValue placeholder="Produto" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">Todos os Produtos</SelectItem>
                <SelectItem value="AF001">Air Fryer</SelectItem>
                <SelectItem value="BL001">Blender</SelectItem>
                <SelectItem value="MC001">Microondas</SelectItem>
                </SelectContent>
              </Select>
            <Button variant="outline" className="flex items-center justify-center filter-button">
              <Filter className="w-4 h-4 mr-2" />
              <span className="hidden-mobile">Mais Filtros</span>
              <span className="mobile-only">Filtros</span>
            </Button>
            </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 card-grid">
        <Card>
          <CardContent className="p-6 stats-card">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center stats-icon">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            <div>
                <p className="text-sm text-gray-600 stats-label">Total de Planos</p>
                <p className="text-2xl font-bold text-gray-900 stats-value">{plans.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
          <CardContent className="p-6 stats-card">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center stats-icon">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 stats-label">Planos Ativos</p>
                <p className="text-2xl font-bold text-gray-900 stats-value">
                  {plans.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 stats-card">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center stats-icon">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 stats-label">Tempo Médio</p>
                <p className="text-2xl font-bold text-gray-900 stats-value">12.5 min</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 stats-card">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center stats-icon">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 stats-label">Taxa de Reprovação</p>
                <p className="text-2xl font-bold text-gray-900 stats-value">2.3%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Planos */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 card-grid">
          {filteredPlans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer plan-card">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between plan-card-header">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2 plan-card-title">
                        {plan.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mb-3 plan-card-badges">
                        <Badge className={getStatusColor(plan.status)}>
                          {getStatusIcon(plan.status)}
                          <span className="ml-1 capitalize">{plan.status}</span>
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Rev. {plan.revision || '1.0'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{plan.productName || 'Produto não especificado'}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{plan.updatedBy || 'N/A'}</span>
                        </div>
                                                 <div className="flex items-center space-x-1">
                           <Calendar className="w-3 h-3" />
                           <span>{plan.updatedAt ? new Date(plan.updatedAt).toLocaleDateString() : 'N/A'}</span>
                         </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="plan-card-actions">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewHistory(plan)}>
                          <History className="w-4 h-4 mr-2" />
                          Histórico
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicatePlan(plan)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportPlan(plan)}>
                          <Download className="w-4 h-4 mr-2" />
                          Exportar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
        </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Etapas:</span>
                      <span className="font-medium">{plan.steps?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tempo Estimado:</span>
                      <span className="font-medium">
                        {plan.steps?.reduce((acc, step) => acc + (step.estimatedTime || 0), 0) || 0} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Validade:</span>
                                             <span className={`font-medium ${
                         plan.validUntil && new Date(plan.validUntil) < new Date() ? 'text-red-600' : 'text-green-600'
                       }`}>
                         {plan.validUntil ? new Date(plan.validUntil).toLocaleDateString() : 'N/A'}
                       </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {plan.tags?.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {plan.tags && plan.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{plan.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Shield className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {plan.accessControl?.roles?.length || 0} perfis
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="plans-table">
              <div className="plans-table-container">
                <Table className="plans-table-desktop">
            <TableHeader>
              <TableRow>
                  <TableHead>Plano</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Status</TableHead>
                  <TableHead>Revisão</TableHead>
                  <TableHead>Última Atualização</TableHead>
                  <TableHead>Validade</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                        <div className="font-medium">{plan.name || 'Nome não especificado'}</div>
                        <div className="text-sm text-gray-500">{plan.steps?.length || 0} etapas</div>
                    </div>
                  </TableCell>
                    <TableCell>{plan.productName || 'Produto não especificado'}</TableCell>
                  <TableCell>
                      <Badge className={getStatusColor(plan.status)}>
                        {getStatusIcon(plan.status)}
                        <span className="ml-1 capitalize">{plan.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Rev. {plan.revision || '1.0'}</Badge>
                    </TableCell>
                    <TableCell>
                                             <div className="text-sm">
                         <div>{plan.updatedBy || 'N/A'}</div>
                         <div className="text-gray-500">{plan.updatedAt ? new Date(plan.updatedAt).toLocaleDateString() : 'N/A'}</div>
                       </div>
                    </TableCell>
                    <TableCell>
                                             <span className={`text-sm ${
                         plan.validUntil && new Date(plan.validUntil) < new Date() ? 'text-red-600' : 'text-green-600'
                       }`}>
                         {plan.validUntil ? new Date(plan.validUntil).toLocaleDateString() : 'N/A'}
                       </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                          onClick={() => handleViewHistory(plan)}
                          >
                          <History className="w-4 h-4" />
                          </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDuplicatePlan(plan)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportPlan(plan)}>
                              <Download className="w-4 h-4 mr-2" />
                              Exportar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeletePlan(plan.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
                </div>
              </div>
        </CardContent>
      </Card>
      )}

      {/* Modal de Histórico */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden modal-responsive history-modal">
          <DialogHeader>
            <DialogTitle>Histórico de Revisões - {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Visualize todas as alterações e revisões do plano de inspeção
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="timeline" className="h-full">
              <TabsList className="grid w-full grid-cols-3 tabs-list">
                <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
                <TabsTrigger value="changes">Alterações</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline" className="h-full">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4 p-4">
                    {/* Timeline de revisões */}
                    <div className="space-y-4">
                      {[3, 2, 1].map((revision) => (
                        <div key={revision} className="flex space-x-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {revision}
                  </div>
                            <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
                  </div>
                          <div className="flex-1 bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">Revisão {revision}</h4>
                              <Badge variant="outline">2024-08-{10 - revision}</Badge>
                  </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Atualizado por João Silva
                            </p>
                            <p className="text-sm">
                              Adicionados novos campos de inspeção para controle de qualidade
                            </p>
                  </div>
                  </div>
                      ))}
                  </div>
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="changes" className="h-full">
                <ScrollArea className="h-[500px]">
                  <div className="p-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Campo</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Antes</TableHead>
                          <TableHead>Depois</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Fotos Obrigatórias</TableCell>
                          <TableCell>Quantidade</TableCell>
                          <TableCell>2</TableCell>
                          <TableCell>4</TableCell>
                          <TableCell>2024-08-10</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Teste de Controles</TableCell>
                          <TableCell>Condicional</TableCell>
                          <TableCell>Não</TableCell>
                          <TableCell>Sim</TableCell>
                          <TableCell>2024-08-10</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="analytics" className="h-full">
                <div className="p-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">12.5 min</div>
                          <div className="text-sm text-gray-600">Tempo Médio</div>
                      </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">97.7%</div>
                          <div className="text-sm text-gray-600">Taxa de Aprovação</div>
                      </div>
                      </CardContent>
                    </Card>
                    </div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Principais Causas de Reprovação</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {['Riscos superficiais', 'Controles com defeito', 'Embalagem danificada'].map((cause, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{cause}</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={80 - index * 20} className="w-20" />
                              <span className="text-sm text-gray-600">{80 - index * 20}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Criação/Edição */}
      <Dialog open={isCreating || isEditing} onOpenChange={() => {
        setIsCreating(false);
        setIsEditing(false);
        setSelectedPlan(null);
      }}>
         <DialogContent className="max-w-6xl modal-responsive">
                     <DialogHeader className="modal-header">
            <DialogTitle>
              {isCreating ? 'Novo Plano de Inspeção' : 'Editar Plano de Inspeção'}
            </DialogTitle>
            <DialogDescription>
              Configure os campos e etapas do plano de inspeção
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 flex flex-col min-h-0">
            <Tabs defaultValue="basic" className="flex flex-col h-full">
                           <TabsList className="grid w-full grid-cols-5 tabs-list">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="steps">Etapas</TabsTrigger>
                <TabsTrigger value="fields">Campos</TabsTrigger>
                <TabsTrigger value="access">Acesso</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
                             <TabsContent value="basic" className="tabs-content">
                 <ScrollArea className="scroll-area">
                  <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                        <Label htmlFor="name">Nome do Plano</Label>
                        <Input id="name" placeholder="Ex: Plano de Inspeção - Air Fryer" />
                </div>
                <div>
                        <Label htmlFor="product">Produto</Label>
                  <Select>
                    <SelectTrigger>
                            <SelectValue placeholder="Selecione o produto" />
                    </SelectTrigger>
                    <SelectContent>
                            <SelectItem value="AF001">Air Fryer Premium</SelectItem>
                            <SelectItem value="BL001">Blender Pro</SelectItem>
                            <SelectItem value="MC001">Microondas Smart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 form-grid-2">
                <div>
                        <Label htmlFor="validity">Data de Validade</Label>
                        <Input id="validity" type="date" />
                </div>
                <div>
                        <Label htmlFor="tags">Tags</Label>
                        <Input id="tags" placeholder="Eletrônicos, Cozinha, Premium" />
                      </div>
                </div>
                <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Descreva o objetivo e escopo do plano de inspeção"
                        rows={4}
                      />
                </div>
              </div>
                </ScrollArea>
            </TabsContent>
                                                           <TabsContent value="steps" className="tabs-content">
                  <ScrollArea className="scroll-area">
                  <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Etapas de Inspeção</h3>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                        Adicionar Etapa
                  </Button>
                </div>
                    <div className="space-y-4">
                      {selectedPlan?.steps.map((step, index) => (
                                                 <Card key={step.id} className="modal-card">
                           <CardHeader className="modal-card-header">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                  {index + 1}
                  </div>
                                <div>
                                  <CardTitle className="text-base">{step.name}</CardTitle>
                                  <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                  </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{step.estimatedTime} min</Badge>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                  </div>
                </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {step.fields.map((field) => (
                                <div key={field.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-medium">{field.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {field.type}
                                    </Badge>
                                    {field.required && (
                                      <Badge variant="destructive" className="text-xs">
                                        Obrigatório
                                      </Badge>
                                    )}
              </div>
                                  <div className="flex items-center space-x-2">
                                    {field.conditional && (
                                      <Badge variant="secondary" className="text-xs">
                                        Condicional
                                      </Badge>
                                    )}
                                    {field.photoConfig && (
                                      <Badge variant="secondary" className="text-xs">
                                        {field.photoConfig.quantity} fotos
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
            </TabsContent>
                                                           <TabsContent value="fields" className="tabs-content">
                  <ScrollArea className="scroll-area">
                  <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Campos Personalizados</h3>
                  <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Campo
                  </Button>
                </div>
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 form-grid-2">
                                             <Card className="modal-card">
                         <CardHeader className="modal-card-header">
                          <CardTitle className="text-base">Tipos de Campo</CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-3 modal-card-content">
                          {[
                            { type: 'text', name: 'Texto', icon: FileText },
                            { type: 'number', name: 'Número', icon: BarChart3 },
                            { type: 'select', name: 'Seleção', icon: ChevronDown },
                            { type: 'checkbox', name: 'Checkbox', icon: CheckSquare },
                            { type: 'photo', name: 'Foto', icon: Camera },
                            { type: 'file', name: 'Arquivo', icon: Upload }
                          ].map((fieldType) => (
                            <div key={fieldType.type} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                              <fieldType.icon className="w-5 h-5 text-gray-500" />
                              <span className="font-medium">{fieldType.name}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                                             <Card className="modal-card">
                         <CardHeader className="modal-card-header">
                          <CardTitle className="text-base">Configurações Avançadas</CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-4 modal-card-content">
                <div className="space-y-2">
                            <Label>Campos Condicionais</Label>
                            <div className="text-sm text-gray-600">
                              Campos que aparecem apenas quando uma etapa anterior é reprovada
                    </div>
                  </div>
                          <div className="space-y-2">
                            <Label>Configuração de Fotos</Label>
                            <div className="text-sm text-gray-600">
                              Quantidade obrigatória, anotações e comparação com padrão
                    </div>
                  </div>
                          <div className="space-y-2">
                            <Label>Controle de Acesso</Label>
                            <div className="text-sm text-gray-600">
                              Permissões por perfil de usuário
                    </div>
                  </div>
                        </CardContent>
                      </Card>
                </div>
              </div>
                </ScrollArea>
            </TabsContent>
                                                           <TabsContent value="access" className="tabs-content">
                  <ScrollArea className="scroll-area">
                  <div className="p-4 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Controle de Acesso</h3>
                                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 form-grid-3">
                        {[
                          { role: 'Inspetor', permissions: ['Visualizar', 'Executar'] },
                          { role: 'Técnico', permissions: ['Visualizar', 'Executar', 'Editar'] },
                          { role: 'Engenheiro', permissions: ['Visualizar', 'Executar', 'Editar', 'Excluir'] }
                        ].map((profile) => (
                                                     <Card key={profile.role} className="modal-card">
                             <CardHeader className="modal-card-header">
                              <CardTitle className="text-base">{profile.role}</CardTitle>
                            </CardHeader>
                            <CardContent className="modal-card-content">
                <div className="space-y-2">
                                {profile.permissions.map((permission) => (
                                  <div key={permission} className="flex items-center space-x-2">
                                    <Checkbox id={`${profile.role}-${permission}`} defaultChecked />
                                    <Label htmlFor={`${profile.role}-${permission}`} className="text-sm">
                                      {permission}
                                    </Label>
                    </div>
                                ))}
                  </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                    </div>
                </ScrollArea>
              </TabsContent>
                                                           <TabsContent value="preview" className="tabs-content">
                  <ScrollArea className="scroll-area">
                  <div className="p-4">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Preview do Plano</h3>
                      <div className="space-y-4">
                        {selectedPlan?.steps.map((step, index) => (
                          <div key={step.id} className="bg-white rounded-lg p-4 border">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {index + 1}
                  </div>
                              <h4 className="font-semibold">{step.name}</h4>
                    </div>
                            <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                            <div className="space-y-2">
                              {step.fields.map((field) => (
                                <div key={field.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span className="text-sm">{field.name}</span>
                                  {field.required && (
                                    <Badge variant="destructive" className="text-xs">
                                      *
                                    </Badge>
                                  )}
                  </div>
                              ))}
                    </div>
                  </div>
                        ))}
                </div>
              </div>
                  </div>
                </ScrollArea>
            </TabsContent>
          </Tabs>
          </div>
                     <DialogFooter className="modal-footer">
            <Button variant="outline" onClick={() => {
              setIsCreating(false);
              setIsEditing(false);
              setSelectedPlan(null);
            }}>
              Cancelar
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Save className="w-4 h-4 mr-2" />
              Salvar Plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Formulário de Criação/Edição */}
      <PlanForm
        plan={isEditing ? selectedPlan : null}
        isOpen={isCreating || isEditing}
        onClose={() => {
          setIsCreating(false);
          setIsEditing(false);
          setSelectedPlan(null);
        }}
        onSave={handleSavePlan}
        isLoading={loading}
      />
    </div>
  );
}