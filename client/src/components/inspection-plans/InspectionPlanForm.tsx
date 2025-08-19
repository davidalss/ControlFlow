import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  LinkedProduct, 
  VoltageConfiguration, 
  InspectionQuestion,
  LabelConfiguration 
} from "@/hooks/use-inspection-plans";
import ProductSelector from "./ProductSelector";
import VoltageConfigurationPanel from "./VoltageConfigurationPanel";
import VoltageQuestionManager from "./VoltageQuestionManager";
import InspectionPlanTutorial from "./InspectionPlanTutorial";

interface InspectionPlanFormProps {
  plan?: any;
  onSave?: (plan: any) => void;
  onCancel?: () => void;
}

export default function InspectionPlanForm({ plan, onSave, onCancel }: InspectionPlanFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    planCode: plan?.planCode || `PCG${Date.now().toString().slice(-6)}`,
    planName: plan?.planName || '',
    planType: plan?.planType || 'product',
    version: plan?.version || 'Rev. 01',
    businessUnit: plan?.businessUnit || 'N/A',
    inspectionType: plan?.inspectionType || 'mixed',
    samplingMethod: plan?.samplingMethod || 'NBR 5426',
    inspectionLevel: plan?.inspectionLevel || 'II',
    aqlCritical: plan?.aqlCritical || 0,
    aqlMajor: plan?.aqlMajor || 2.5,
    aqlMinor: plan?.aqlMinor || 4.0,
    observations: plan?.observations || '',
    specialInstructions: plan?.specialInstructions || ''
  });
  
  // Estado dos produtos e configuração
  const [selectedProducts, setSelectedProducts] = useState<LinkedProduct[]>(
    plan?.linkedProducts || []
  );
  
  const [voltageConfig, setVoltageConfig] = useState<VoltageConfiguration>({
    hasSingleVoltage: true,
    voltageType: 'BIVOLT',
    supports127V: true,
    supports220V: true,
    questionsByVoltage: {
      '127V': plan?.questionsByVoltage?.['127V'] || [],
      '220V': plan?.questionsByVoltage?.['220V'] || [],
      'both': plan?.questionsByVoltage?.['both'] || []
    },
    labelsByVoltage: {
      '127V': plan?.labelsByVoltage?.['127V'] || [],
      '220V': plan?.labelsByVoltage?.['220V'] || []
    }
  });
  
  // Atualizar configuração quando produtos mudarem
  useEffect(() => {
    const uniqueVoltages = [...new Set(selectedProducts.map(p => p.voltage))];
    
    if (selectedProducts.length === 0) {
      setVoltageConfig(prev => ({
        ...prev,
        hasSingleVoltage: true,
        voltageType: 'BIVOLT',
        supports127V: true,
        supports220V: true
      }));
    } else if (selectedProducts.length === 1) {
      const voltage = selectedProducts[0].voltage;
      setVoltageConfig(prev => ({
        ...prev,
        hasSingleVoltage: true,
        voltageType: voltage,
        supports127V: voltage === '127V' || voltage === 'BIVOLT',
        supports220V: voltage === '220V' || voltage === 'BIVOLT'
      }));
    } else if (selectedProducts.length === 2) {
      const voltages = selectedProducts.map(p => p.voltage);
      setVoltageConfig(prev => ({
        ...prev,
        hasSingleVoltage: false,
        voltageType: 'DUAL',
        supports127V: voltages.includes('127V'),
        supports220V: voltages.includes('220V')
      }));
    } else {
      setVoltageConfig(prev => ({
        ...prev,
        hasSingleVoltage: false,
        voltageType: 'MULTIPLE',
        supports127V: uniqueVoltages.includes('127V'),
        supports220V: uniqueVoltages.includes('220V')
      }));
    }
  }, [selectedProducts]);
  
  // Gerar nome automático do plano
  useEffect(() => {
    if (selectedProducts.length > 0 && !formData.planName) {
      const baseProduct = selectedProducts[0];
      const voltages = selectedProducts.map(p => p.voltage).filter(v => v !== 'BIVOLT');
      
      let planName = `PLANO DE INSPEÇÃO - ${baseProduct.productName}`;
      if (voltages.length > 0) {
        planName += ` (${voltages.join(' / ')})`;
      }
      
      setFormData(prev => ({ ...prev, planName }));
    }
  }, [selectedProducts, formData.planName]);
  
  const handleSave = async () => {
    if (!formData.planName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do plano.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedProducts.length === 0) {
      toast({
        title: "Produtos obrigatórios",
        description: "Por favor, selecione pelo menos um produto.",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar se há perguntas cadastradas
    const totalQuestions = 
      voltageConfig.questionsByVoltage.both.length +
      voltageConfig.questionsByVoltage['127V'].length +
      voltageConfig.questionsByVoltage['220V'].length;
    
    if (totalQuestions === 0) {
      toast({
        title: "Perguntas obrigatórias",
        description: "Por favor, cadastre pelo menos uma pergunta de inspeção.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const planData = {
        ...formData,
        linkedProducts: selectedProducts,
        voltageConfiguration: voltageConfig,
        questionsByVoltage: voltageConfig.questionsByVoltage,
        labelsByVoltage: voltageConfig.labelsByVoltage,
        status: 'draft',
        isActive: true
      };
      
      if (plan?.id) {
        // Atualizar plano existente
        const response = await apiRequest('PUT', `/api/inspection-plans/${plan.id}`, planData);
        if (response.ok) {
          toast({
            title: "Plano atualizado",
            description: "Plano de inspeção foi atualizado com sucesso.",
          });
          onSave?.(planData);
        }
      } else {
        // Criar novo plano
        const response = await apiRequest('POST', '/api/inspection-plans', planData);
        if (response.ok) {
          const newPlan = await response.json();
          toast({
            title: "Plano criado",
            description: "Plano de inspeção foi criado com sucesso.",
          });
          onSave?.(newPlan);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o plano de inspeção.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{plan?.id ? 'Editar Plano de Inspeção' : 'Novo Plano de Inspeção'}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTutorial(true)}
              className="text-blue-500 hover:text-blue-700"
              title="Ajuda - Como criar um plano de inspeção"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Código do Plano:</Label>
              <Input
                value={formData.planCode}
                onChange={(e) => setFormData(prev => ({ ...prev, planCode: e.target.value }))}
                placeholder="Ex: PCG02.049"
              />
            </div>
            <div className="space-y-2">
              <Label>Versão:</Label>
              <Input
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                placeholder="Ex: Rev. 01"
              />
            </div>
            <div className="space-y-2">
              <Label>Nome do Plano:</Label>
              <Input
                value={formData.planName}
                onChange={(e) => setFormData(prev => ({ ...prev, planName: e.target.value }))}
                placeholder="Nome do plano de inspeção"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Plano:</Label>
              <Select
                value={formData.planType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, planType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Produto</SelectItem>
                  <SelectItem value="parts">Peças</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Seleção de Produtos */}
      <ProductSelector
        selectedProducts={selectedProducts}
        onProductsChange={setSelectedProducts}
      />
      
      {/* Configuração de Voltagens */}
      <VoltageConfigurationPanel
        selectedProducts={selectedProducts}
        voltageConfig={voltageConfig}
      />
      
      {/* Configurações AQL */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações AQL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Método de Amostragem:</Label>
              <Select
                value={formData.samplingMethod}
                onValueChange={(value) => setFormData(prev => ({ ...prev, samplingMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NBR 5426">NBR 5426</SelectItem>
                  <SelectItem value="100%">100%</SelectItem>
                  <SelectItem value="Personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nível de Inspeção:</Label>
              <Select
                value={formData.inspectionLevel}
                onValueChange={(value) => setFormData(prev => ({ ...prev, inspectionLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">I</SelectItem>
                  <SelectItem value="II">II</SelectItem>
                  <SelectItem value="III">III</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>AQL Crítico:</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.aqlCritical}
                onChange={(e) => setFormData(prev => ({ ...prev, aqlCritical: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>AQL Maior:</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.aqlMajor}
                onChange={(e) => setFormData(prev => ({ ...prev, aqlMajor: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>AQL Menor:</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.aqlMinor}
                onChange={(e) => setFormData(prev => ({ ...prev, aqlMinor: Number(e.target.value) }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Perguntas por Voltagem */}
      <VoltageQuestionManager
        voltageConfig={voltageConfig}
        onQuestionsChange={(questions) => setVoltageConfig(prev => ({
          ...prev,
          questionsByVoltage: questions
        }))}
      />
      
      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle>Observações e Instruções Especiais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Observações:</Label>
              <Textarea
                value={formData.observations}
                onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                placeholder="Observações gerais sobre o plano..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Instruções Especiais:</Label>
              <Textarea
                value={formData.specialInstructions}
                onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                placeholder="Instruções especiais para os inspetores..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Produtos:</div>
              <div className="text-gray-600">{selectedProducts.length} produto(s)</div>
            </div>
            <div>
              <div className="font-medium">Voltagens:</div>
              <div className="text-gray-600">
                {[...new Set(selectedProducts.map(p => p.voltage))].join(', ')}
              </div>
            </div>
            <div>
              <div className="font-medium">Perguntas:</div>
              <div className="text-gray-600">
                {voltageConfig.questionsByVoltage.both.length + 
                 voltageConfig.questionsByVoltage['127V'].length + 
                 voltageConfig.questionsByVoltage['220V'].length} pergunta(s)
              </div>
            </div>
            <div>
              <div className="font-medium">Etiquetas:</div>
              <div className="text-gray-600">
                {voltageConfig.labelsByVoltage['127V'].length + 
                 voltageConfig.labelsByVoltage['220V'].length} etiqueta(s)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Ações */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Salvando...' : (plan?.id ? 'Atualizar' : 'Criar')} Plano
        </Button>
      </div>
      
      {/* Tutorial Modal */}
      <InspectionPlanTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
}
