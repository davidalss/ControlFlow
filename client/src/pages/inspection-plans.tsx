import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  SortDesc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useInspectionPlans } from '@/hooks/use-inspection-plans-simple';
import type { InspectionPlan } from '@/hooks/use-inspection-plans-simple';
import NewInspectionPlanForm from '@/components/inspection-plans/NewInspectionPlanForm';
import InspectionPlanTutorial from '@/components/inspection-plans/InspectionPlanTutorial';
import { useAuth } from '@/hooks/use-auth';

export default function InspectionPlansPage() {
  // Hooks básicos - declarados primeiro para evitar TDZ
  const toastHook = useToast();
  const authHook = useAuth();
  const inspectionPlansHook = useInspectionPlans();
  
  // Estados para criação/edição
  const [showRevisionsModal, setShowRevisionsModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InspectionPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Estados para revisões
  const [showRevisions, setShowRevisions] = useState(false);
  const [planRevisions, setPlanRevisions] = useState<any[]>([]);

  // Estados para receitas de perguntas
  const [showRecipeManager, setShowRecipeManager] = useState(false);
  const [selectedPlanForRecipes, setSelectedPlanForRecipes] = useState<InspectionPlan | null>(null);
  
  // Estado para tutorial
  const [showTutorial, setShowTutorial] = useState(false);

  // Função para criar plano
  const handleCreatePlan = () => {
    setIsCreating(true);
    setSelectedPlan(null);
  };

  // Função para visualizar revisões
  const handleViewRevisions = async (plan: InspectionPlan) => {
    try {
      const revisions = await inspectionPlansHook.getPlanRevisions(plan.id);
      setPlanRevisions(revisions);
      setSelectedPlan(plan);
      setShowRevisions(true);
    } catch (error: any) {
      toastHook.toast({
        title: "Erro",
        description: `Falha ao carregar revisões.`,
        variant: "destructive"
      });
    }
  };

  // Função para editar plano
  const handleEditPlan = (plan: InspectionPlan) => {
    setSelectedPlan(plan);
    setIsEditing(true);
  };

  // Função para visualizar plano
  const handleViewPlan = (plan: InspectionPlan) => {
    setSelectedPlan(plan);
    setIsViewing(true);
  };

  // Função para salvar plano (CREATE/UPDATE)
  const handleSavePlan = async (planData: Omit<InspectionPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const isUpdateOperation = isEditing && selectedPlan;
    
    try {
      let result;
      
      if (isUpdateOperation) {
        result = await inspectionPlansHook.updatePlan(selectedPlan!.id, planData);
        toastHook.toast({
          title: "Sucesso",
          description: `Plano atualizado com sucesso`
        });
      } else {
        result = await inspectionPlansHook.createPlan(planData);
        toastHook.toast({
          title: "Sucesso",
          description: "Plano criado com sucesso"
        });
      }
      
      // Fechar modais
      setIsCreating(false);
      setIsEditing(false);
      setSelectedPlan(null);
      
    } catch (error: any) {
      toastHook.toast({
        title: "Erro",
        description: `Erro ao ${isUpdateOperation ? 'atualizar' : 'criar'} plano de inspeção.`,
        variant: "destructive"
      });
    }
  };

  // Função para excluir plano
  const handleDeletePlan = async (planId: string) => {
    try {
      await inspectionPlansHook.deletePlan(planId);
      toastHook.toast({
        title: "Sucesso",
        description: "Plano excluído com sucesso"
      });
    } catch (error: any) {
      toastHook.toast({
        title: "Erro",
        description: `Erro ao excluir plano.`,
        variant: "destructive"
      });
    }
  };

  // Função para duplicar plano
  const handleDuplicatePlan = async (plan: InspectionPlan) => {
    try {
      const duplicatedPlan = await inspectionPlansHook.duplicatePlan(plan.id);
      toastHook.toast({
        title: "Sucesso",
        description: "Plano duplicado com sucesso"
      });
    } catch (error: any) {
      toastHook.toast({
        title: "Erro",
        description: `Erro ao duplicar plano.`,
        variant: "destructive"
      });
    }
  };

  // Função para exportar plano
  const handleExportPlan = async (plan: InspectionPlan) => {
    try {
      await inspectionPlansHook.exportPlan(plan.id);
      toastHook.toast({
        title: "Sucesso",
        description: "Plano exportado com sucesso"
      });
    } catch (error) {
      toastHook.toast({
        title: "Erro",
        description: "Erro ao exportar plano",
        variant: "destructive"
      });
    }
  };

  // Função para recarregar planos
  const handleRetry = async () => {
    try {
      await inspectionPlansHook.loadPlans();
      toastHook.toast({
        title: "Sucesso",
        description: "Planos carregados com sucesso",
      });
    } catch (error: any) {
      toastHook.toast({
        title: "Erro",
        description: `Falha ao carregar planos novamente.`,
        variant: "destructive"
      });
    }
  };

  // Filtrar e ordenar planos - Acessando propriedades diretamente
  const plans = inspectionPlansHook.plans || [];
  const filteredPlans = plans
    .filter(plan => {
      if (!plan) return false;
      
      const planName = plan.planName || plan.name || '';
      const productName = plan.productName || '';
      
      const matchesSearch = planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (plan.status && plan.status === statusFilter);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          const aName = a.planName || a.name || '';
          const bName = b.planName || b.name || '';
          comparison = aName.localeCompare(bName);
          break;
        case 'status':
          const aStatus = a.status || '';
          const bStatus = b.status || '';
          comparison = aStatus.localeCompare(bStatus);
          break;
        case 'createdAt':
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          comparison = aDate - bDate;
          break;
        default:
          const defaultAName = a.planName || a.name || '';
          const defaultBName = b.planName || b.name || '';
          comparison = defaultAName.localeCompare(defaultBName);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', className: 'bg-yellow-100 text-yellow-800' },
      active: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
      expired: { label: 'Expirado', className: 'bg-red-100 text-red-800' },
      archived: { label: 'Arquivado', className: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Planos de Inspeção</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie os planos de inspeção de qualidade</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTutorial(true)}
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            title="Ajuda - Como criar um plano de inspeção"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleCreatePlan} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar planos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="draft">Rascunho</option>
              <option value="active">Ativo</option>
              <option value="expired">Expirado</option>
              <option value="archived">Arquivado</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Nome</option>
              <option value="status">Status</option>
              <option value="createdAt">Data de Criação</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Planos de Inspeção ({filteredPlans.length})</span>
            <div className="flex items-center space-x-2 text-sm">
              <span>Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Nome</option>
                <option value="status">Status</option>
                <option value="createdAt">Data</option>
              </select>
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
          {inspectionPlansHook.loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">Carregando planos...</span>
            </div>
          ) : inspectionPlansHook.error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Erro ao carregar planos
              </h3>
              <p className="text-gray-600 mb-4">
                Ocorreu um erro ao tentar carregar os planos. Tente novamente ou recarregue a página.
              </p>
              <Button onClick={handleRetry} className="bg-red-600 hover:bg-red-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Recarregar Planos
              </Button>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'Nenhum plano encontrado' : 'Nenhum plano criado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Comece criando seu primeiro plano de inspeção'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={handleCreatePlan} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Plano
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                  <TableRow>
                    <TableHead>Nome do Plano</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Perguntas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredPlans.map((plan, index) => {
                      // Calcular total de perguntas de forma segura
                      let totalQuestions = 0;
                      try {
                        if (plan.inspectionSteps) {
                          const steps = JSON.parse(plan.inspectionSteps);
                          totalQuestions = steps.reduce((total: number, step: any) => {
                            return total + (step.questions || []).length;
                          }, 0);
                        }
                      } catch (error) {
                        console.warn('Erro ao parsear inspectionSteps:', error);
                        totalQuestions = 0;
                      }
                      
                      return (
                        <motion.tr
                          key={plan.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{plan.planName || 'Sem nome'}</div>
                              <div className="text-sm text-gray-500">v{plan.version || plan.revision || '1'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{plan.productName || 'Produto não especificado'}</div>
                              <div className="text-sm text-gray-500">{plan.productCode || plan.productId || 'Sem código'}</div>
                            </div>
                          </TableCell>
                          <TableCell>{totalQuestions} perguntas</TableCell>
                          <TableCell>{getStatusBadge(plan.status || 'draft')}</TableCell>
                          <TableCell>{plan.createdAt ? formatDate(new Date(plan.createdAt)) : 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewPlan(plan)}
                                title="Visualizar"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPlan(plan)}
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewRevisions(plan)}
                                title="Histórico de Revisões"
                              >
                                <History className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDuplicatePlan(plan)}
                                title="Duplicar"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExportPlan(plan)}
                                title="Exportar"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulário de Criação/Edição */}
      <NewInspectionPlanForm
        isOpen={isCreating || isEditing}
        onClose={() => {
          setIsCreating(false);
          setIsEditing(false);
          setSelectedPlan(null);
        }}
        onSave={handleSavePlan}
        plan={isEditing ? selectedPlan : undefined}
      />

      {/* Modal de Visualização */}
      {isViewing && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsViewing(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full z-10 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <h2 className="text-lg font-semibold text-black">Visualizar Plano de Inspeção</h2>
              </div>
              <button
                onClick={() => setIsViewing(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <ScrollArea className="max-h-[calc(90vh-80px)] overflow-y-auto">
              <div className="space-y-6 p-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedPlan.planName || selectedPlan.name}</CardTitle>
                    <p className="text-gray-600">{selectedPlan.productName}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(selectedPlan.status)}
                      <Badge variant="outline">v{selectedPlan.version || selectedPlan.revision}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Criado em:</span>
                        <p>{formatDate(selectedPlan.createdAt)}</p>
                      </div>
                      {selectedPlan.validUntil && (
                        <div>
                          <span className="font-medium">Válido até:</span>
                          <p>{formatDate(selectedPlan.validUntil)}</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Código do Plano:</span>
                        <p>{selectedPlan.planCode}</p>
                      </div>
                      <div>
                        <span className="font-medium">Código do Produto:</span>
                        <p>{selectedPlan.productCode}</p>
                      </div>
                    </div>

                    {(selectedPlan.tags || []).length > 0 && (
                      <div>
                        <span className="font-medium text-sm">Tags:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(selectedPlan.tags || []).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Etapas de Inspeção</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(() => {
                        try {
                          const steps = selectedPlan.inspectionSteps ? JSON.parse(selectedPlan.inspectionSteps) : [];
                          return steps.length > 0 ? (
                            steps.map((step, index) => (
                              <div key={step.id} className="border rounded-lg p-4">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium">{step.name}</h4>
                                    <p className="text-sm text-gray-600">{step.description}</p>
                                  </div>
                                  <Badge variant="outline">{step.estimatedTime} min</Badge>
                                </div>
                                
                                {/* Perguntas da etapa */}
                                {step.questions && step.questions.length > 0 && (
                                  <div className="ml-11">
                                    <h5 className="font-medium text-sm mb-2">Perguntas:</h5>
                                    <div className="space-y-2">
                                      {step.questions.map((question, qIndex) => (
                                        <div key={question.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                          <span className="text-sm font-medium">{qIndex + 1}.</span>
                                          <div className="flex-1">
                                            <p className="text-sm">{question.name}</p>
                                            {question.questionConfig?.description && (
                                              <p className="text-xs text-gray-500">{question.questionConfig.description}</p>
                                            )}
                                          </div>
                                          <Badge variant="outline" className="text-xs">
                                            {question.questionConfig?.questionType || 'ok_nok'}
                                          </Badge>
                                          {question.required && (
                                            <Badge variant="destructive" className="text-xs">Obrigatória</Badge>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-center py-4">Nenhuma etapa configurada</p>
                          );
                        } catch (error) {
                          console.error('Erro ao parsear etapas:', error);
                          return <p className="text-red-500 text-center py-4">Erro ao carregar etapas</p>;
                        }
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Checklist */}
                <Card>
                  <CardHeader>
                    <CardTitle>Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      try {
                        const checklists = selectedPlan.checklists ? JSON.parse(selectedPlan.checklists) : [];
                        return checklists.length > 0 ? (
                          <div className="space-y-4">
                            {checklists.map((checklist, index) => (
                              <div key={index} className="border rounded-lg p-3">
                                <h4 className="font-medium mb-2">{checklist.title}</h4>
                                <div className="space-y-1">
                                  {checklist.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex items-center space-x-2 text-sm">
                                      <span className="text-gray-500">•</span>
                                      <span>{item.description}</span>
                                      <Badge variant="outline" className="text-xs">{item.type}</Badge>
                                      {item.required && (
                                        <Badge variant="destructive" className="text-xs">Obrigatória</Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">Nenhum checklist configurado</p>
                        );
                      } catch (error) {
                        console.error('Erro ao parsear checklist:', error);
                        return <p className="text-red-500 text-center py-4">Erro ao carregar checklist</p>;
                      }
                    })()}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Modal de Revisões */}
      {showRevisions && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowRevisions(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full z-10 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5" />
                <h2 className="text-lg font-semibold text-black">Histórico de Revisões</h2>
              </div>
              <button
                onClick={() => setShowRevisions(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="px-4 pb-4 text-gray-600 text-sm flex-shrink-0">
              {selectedPlan && `Plano: ${selectedPlan.planName || selectedPlan.name} (v${selectedPlan.version || selectedPlan.revision})`}
            </p>
            
            <ScrollArea className="max-h-[calc(90vh-120px)] overflow-y-auto">
              <div className="space-y-4 p-4">
                {(planRevisions || []).length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Nenhuma revisão encontrada</p>
                  </div>
                ) : (
                  (planRevisions || []).map((revision) => (
                    <Card key={revision.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">v{revision.revision}</Badge>
                            <Badge variant={revision.action === 'created' ? 'default' : 'secondary'}>
                              {revision.action === 'created' ? 'Criado' : 
                               revision.action === 'updated' ? 'Atualizado' : 'Arquivado'}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(revision.changedAt)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="font-medium">Alterado por:</span>
                            <span>{revision.changedBy}</span>
                          </div>
                          {revision.changes && revision.changes.message && (
                            <div className="text-sm text-gray-600">
                              {revision.changes.message}
                            </div>
                          )}
                          {revision.changes && revision.changes.changes && (
                            <div className="text-sm">
                              <span className="font-medium">Alterações:</span>
                              <ul className="list-disc list-inside mt-1 text-gray-600">
                                {Object.entries(revision.changes.changes).map(([key, value]) => (
                                  <li key={key}>
                                    <span className="font-medium">{key}:</span> {String(value)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Tutorial Modal */}
      <InspectionPlanTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
}
