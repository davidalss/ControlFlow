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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useInspectionPlans, type InspectionPlan } from '@/hooks/use-inspection-plans';
import NewInspectionPlanForm from '@/components/inspection-plans/NewInspectionPlanForm';

export default function InspectionPlansPage() {
  const { toast } = useToast();
  const { plans, loading, createPlan, updatePlan, getPlanRevisions, duplicatePlan, deletePlan, exportPlan, importPlan } = useInspectionPlans();
  
  // Estados para criação/edição
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InspectionPlan | null>(null);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Estados para revisões
  const [showRevisions, setShowRevisions] = useState(false);
  const [planRevisions, setPlanRevisions] = useState<any[]>([]);

  // Função para criar plano
  const handleCreatePlan = () => {
    setIsCreating(true);
    setSelectedPlan(null);
  };

  // Função para visualizar revisões
  const handleViewRevisions = async (plan: InspectionPlan) => {
    try {
      const revisions = await getPlanRevisions(plan.id);
      setPlanRevisions(revisions);
      setSelectedPlan(plan);
      setShowRevisions(true);
    } catch (error) {
      console.error('Erro ao carregar revisões:', error);
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

  // Função para salvar plano
  const handleSavePlan = async (planData: Omit<InspectionPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (isEditing && selectedPlan) {
        const updatedPlan = await updatePlan(selectedPlan.id, planData);
        toast({
          title: "Sucesso",
          description: `Plano atualizado com sucesso (Revisão ${updatedPlan.revision})`
        });
      } else {
        await createPlan(planData);
        toast({
          title: "Sucesso",
          description: "Plano criado com sucesso"
        });
      }
      
      setIsCreating(false);
      setIsEditing(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar plano de inspeção",
        variant: "destructive"
      });
    }
  };

  // Função para excluir plano
  const handleDeletePlan = async (planId: string) => {
    try {
      await deletePlan(planId);
      toast({
        title: "Sucesso",
        description: "Plano excluído com sucesso"
      });
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir plano",
        variant: "destructive"
      });
    }
  };

     // Função para duplicar plano
   const handleDuplicatePlan = async (plan: InspectionPlan) => {
     try {
       // Preparar dados para duplicação
       const planToDuplicate = {
         ...plan,
         name: `${plan.planName || plan.name || 'Plano'} (Cópia)`,
         planName: `${plan.planName || plan.name || 'Plano'} (Cópia)`,
         status: 'draft' as const,
         revision: 1,
         version: 'Rev. 01'
       };
       
       await duplicatePlan(planToDuplicate);
       toast({
         title: "Sucesso",
         description: "Plano duplicado com sucesso"
       });
     } catch (error) {
       console.error('Erro ao duplicar plano:', error);
       toast({
         title: "Erro",
         description: "Erro ao duplicar plano",
         variant: "destructive"
       });
     }
   };

  // Função para exportar plano
  const handleExportPlan = async (plan: InspectionPlan) => {
    try {
      await exportPlan(plan);
      toast({
        title: "Sucesso",
        description: "Plano exportado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao exportar plano:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar plano",
        variant: "destructive"
      });
    }
  };

  // Filtrar e ordenar planos
  const filteredPlans = plans
    .filter(plan => {
      // Usar planName ou name, dependendo do que estiver disponível
      const planName = plan.planName || plan.name || '';
      const productName = plan.productName || '';
      
      const matchesSearch = planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          // Usar planName ou name, dependendo do que estiver disponível
          const aName = a.planName || a.name || '';
          const bName = b.planName || b.name || '';
          comparison = aName.localeCompare(bName);
          break;
        case 'status':
          // Garantir que status não seja undefined
          const aStatus = a.status || '';
          const bStatus = b.status || '';
          comparison = aStatus.localeCompare(bStatus);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-white">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planos de Inspeção</h1>
          <p className="text-gray-600">Gerencie os planos de inspeção de qualidade</p>
        </div>
        <Button onClick={handleCreatePlan} className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {/* Filtros e Busca */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar planos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="expired">Expirado</SelectItem>
              <SelectItem value="archived">Arquivado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="createdAt">Data de Criação</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </Button>
        </div>
      </div>

             {/* Tabela de Planos */}
       <div className="flex-1 p-6 overflow-auto">
         {loading ? (
           <div className="flex items-center justify-center py-12">
             <RefreshCw className="w-6 h-6 animate-spin mr-2" />
             <span>Carregando planos...</span>
           </div>
         ) : filteredPlans.length === 0 ? (
           <div className="text-center py-12">
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
           <div className="bg-white rounded-lg shadow overflow-hidden">
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Nome do Plano
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Produto
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Perguntas
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Status
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Criado em
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Ações
                     </th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {filteredPlans.map((plan) => {
                     // Calcular total de perguntas
                     const totalQuestions = (plan.steps || []).reduce((total, step) => {
                       return total + (step.questions || []).length;
                     }, 0);
                     
                     return (
                       <tr key={plan.id} className="hover:bg-gray-50">
                         <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex items-center">
                             <div>
                               <div className="text-sm font-medium text-gray-900">
                                 {plan.planName || plan.name || 'Sem nome'}
                               </div>
                               <div className="text-sm text-gray-500">
                                 v{plan.version || plan.revision || '1'}
                               </div>
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm text-gray-900">
                             {plan.productName || 'Produto não especificado'}
                           </div>
                           <div className="text-sm text-gray-500">
                             {plan.productCode || plan.productId || 'Sem código'}
                           </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm text-gray-900 font-medium">
                             {totalQuestions}
                           </div>
                           <div className="text-sm text-gray-500">
                             {(plan.steps || []).length} etapas
                           </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           {getStatusBadge(plan.status)}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                           {formatDate(plan.createdAt)}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                           <div className="flex items-center space-x-2">
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleViewPlan(plan)}
                               title="Visualizar"
                               className="h-8 w-8 p-0"
                             >
                               <Eye className="w-4 h-4" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleEditPlan(plan)}
                               title="Editar"
                               className="h-8 w-8 p-0"
                             >
                               <Edit className="w-4 h-4" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleDuplicatePlan(plan)}
                               title="Duplicar"
                               className="h-8 w-8 p-0"
                             >
                               <Copy className="w-4 h-4" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleExportPlan(plan)}
                               title="Exportar"
                               className="h-8 w-8 p-0"
                             >
                               <Download className="w-4 h-4" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleDeletePlan(plan.id)}
                               className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                               title="Excluir"
                             >
                               <Trash2 className="w-4 h-4" />
                             </Button>
                           </div>
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
           </div>
         )}
       </div>

      {/* Formulário de Criação/Edição */}
      <NewInspectionPlanForm
        isOpen={isCreating || isEditing}
        onClose={() => {
          setIsCreating(false);
          setIsEditing(false);
          setSelectedPlan(null);
        }}
        onSave={handleSavePlan}
      />

      {/* Modal de Visualização */}
      <Dialog open={isViewing} onOpenChange={() => setIsViewing(false)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Visualizar Plano de Inspeção</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPlan && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 p-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedPlan.name}</CardTitle>
                    <p className="text-gray-600">{selectedPlan.productName}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(selectedPlan.status)}
                      <Badge variant="outline">v{selectedPlan.revision}</Badge>
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
                      {(selectedPlan.steps || []).map((step, index) => (
                        <div key={step.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{step.name}</h4>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>
                          <Badge variant="outline">{step.estimatedTime} min</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Revisões */}
      <Dialog open={showRevisions} onOpenChange={() => setShowRevisions(false)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <History className="w-5 h-5" />
              <span>Histórico de Revisões</span>
            </DialogTitle>
            <DialogDescription>
              {selectedPlan && `Plano: ${selectedPlan.name} (v${selectedPlan.revision})`}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
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
        </DialogContent>
      </Dialog>
    </div>
  );
}