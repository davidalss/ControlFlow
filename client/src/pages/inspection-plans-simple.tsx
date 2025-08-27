import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Eye,
  Search,
  RefreshCw,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { useToast } from '@/hooks/use-toast';
import { useInspectionPlans, type InspectionPlan } from '@/hooks/use-inspection-plans-simple';

export default function InspectionPlansSimplePage() {
  const { toast } = useToast();
  const { plans, loading, error, createPlan, updatePlan, deletePlan, loadPlans } = useInspectionPlans();
  
  // Estados para criação/edição
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InspectionPlan | null>(null);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');

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
      samplingMethod: 'Normal',
      inspectionLevel: 'II',
      inspectionSteps: '',
      checklists: '',
      requiredParameters: '',
      questionsByVoltage: {},
      labelsByVoltage: {},
      createdBy: '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  // Função para editar plano
  const handleEditPlan = (plan: InspectionPlan) => {
    setSelectedPlan(plan);
    setIsEditing(true);
  };

  // Função para visualizar plano
  const handleViewPlan = (plan: InspectionPlan) => {
    setSelectedPlan(plan);
  };

  // Função para salvar plano
  const handleSavePlan = async () => {
    if (!selectedPlan?.planName?.trim() || !selectedPlan?.productName?.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome do plano e produto são obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (isEditing && selectedPlan) {
        await updatePlan(selectedPlan.id, selectedPlan);
        toast({
          title: "Sucesso",
          description: "Plano atualizado com sucesso"
        });
      } else {
        await createPlan(selectedPlan);
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

  // Função para recarregar planos
  const handleRetry = async () => {
    try {
      await loadPlans();
      toast({
        title: "Sucesso",
        description: "Planos carregados com sucesso",
      });
    } catch (error) {
      console.error('Erro ao tentar novamente:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar planos novamente",
        variant: "destructive"
      });
    }
  };

  // Filtrar planos
  const filteredPlans = (plans || [])
    .filter(plan => {
      if (!plan) return false;
      
      const planName = plan.planName || plan.name || '';
      const productName = plan.productName || '';
      
      return planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             productName.toLowerCase().includes(searchTerm.toLowerCase());
    });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', className: 'bg-yellow-100 text-yellow-800' },
      active: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inativo', className: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex flex-col h-full inspection-plans-simple-page">
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

      {/* Busca */}
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
        </div>
      </div>

      {/* Lista de Planos */}
      <div className="flex-1 p-6 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Carregando planos...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
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
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum plano encontrado' : 'Nenhum plano criado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece criando seu primeiro plano de inspeção'
              }
            </p>
            {!searchTerm && (
              <Button onClick={handleCreatePlan} className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Plano
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {plan.planName || plan.name || 'Sem nome'}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {plan.productName || 'Produto não especificado'}
                      </p>
                    </div>
                    {getStatusBadge(plan.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Código:</span>
                      <span className="font-medium">{plan.productCode || plan.productId || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Criado em:</span>
                      <span>{formatDate(plan.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Versão:</span>
                      <span>{plan.version || '1.0'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPlan(plan)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Visualizar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPlan(plan)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criação/Edição */}
      {(isCreating || isEditing) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
            setIsCreating(false);
            setIsEditing(false);
            setSelectedPlan(null);
          }}></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full z-10 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-semibold text-black">{isCreating ? 'Criar Novo Plano' : 'Editar Plano'}</h2>
                <p className="text-sm text-gray-600">
                  {isCreating ? 'Preencha as informações para criar um novo plano de inspeção.' : 'Edite as informações do plano de inspeção.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  setSelectedPlan(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4">
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="planName">Nome do Plano *</Label>
              <Input 
                id="planName"
                placeholder="Ex: Plano de Inspeção - Air Fryer"
                value={selectedPlan?.planName || ''}
                onChange={(e) => setSelectedPlan(prev => prev ? {...prev, planName: e.target.value} : null)}
              />
            </div>
            
            <div>
              <Label htmlFor="productName">Nome do Produto *</Label>
              <Input 
                id="productName"
                placeholder="Ex: Air Fryer 5L Digital"
                value={selectedPlan?.productName || ''}
                onChange={(e) => setSelectedPlan(prev => prev ? {...prev, productName: e.target.value} : null)}
              />
            </div>
            
            <div>
              <Label htmlFor="productCode">Código do Produto</Label>
              <Input 
                id="productCode"
                placeholder="Ex: AF-5L-001"
                value={selectedPlan?.productCode || ''}
                onChange={(e) => setSelectedPlan(prev => prev ? {...prev, productCode: e.target.value} : null)}
              />
            </div>
            
            <div>
              <Label htmlFor="version">Versão</Label>
              <Input 
                id="version"
                placeholder="Ex: Rev. 01"
                value={selectedPlan?.version || 'Rev. 01'}
                onChange={(e) => setSelectedPlan(prev => prev ? {...prev, version: e.target.value} : null)}
              />
            </div>
          </div>
          
            </div>
            
            <div className="flex justify-end space-x-3 p-4 border-t">
              <Button variant="outline" onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
                setSelectedPlan(null);
              }}>
                Cancelar
              </Button>
              <Button onClick={() => handleSavePlan()}>
                {isCreating ? 'Criar Plano' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {!!selectedPlan && !isCreating && !isEditing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedPlan(null)}></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full z-10 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-black">Detalhes do Plano</h2>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4">
          
          {selectedPlan && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Nome do Plano</h3>
                <p className="text-gray-600">{selectedPlan.planName || selectedPlan.name}</p>
              </div>
              <div>
                <h3 className="font-medium">Produto</h3>
                <p className="text-gray-600">{selectedPlan.productName}</p>
              </div>
              <div>
                <h3 className="font-medium">Status</h3>
                {getStatusBadge(selectedPlan.status)}
              </div>
              <div>
                <h3 className="font-medium">Criado em</h3>
                <p className="text-gray-600">{formatDate(selectedPlan.createdAt)}</p>
              </div>
            </div>
          )}
          
            </div>
            
            <div className="flex justify-end p-4 border-t">
              <Button variant="outline" onClick={() => setSelectedPlan(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
