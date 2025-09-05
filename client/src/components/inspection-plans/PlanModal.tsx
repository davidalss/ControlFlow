import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Save, ChevronRight, ChevronLeft, CheckCircle, Circle, Package, FileText, Settings, Play, Plus, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/use-products-supabase';
import { InspectionPlan } from '@/hooks/use-inspection-plans-simple';
import { supabase } from '@/lib/supabaseClient';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: InspectionPlan | null;
  mode: 'create' | 'edit' | 'view';
  onSave: (planData: Partial<InspectionPlan>) => Promise<void>;
}

interface InspectionStep {
  id: string;
  name: string;
  description: string;
  order: number;
}

interface InspectionQuestion {
  id: string;
  stepId: string;
  type: 'text' | 'multiple_choice' | 'ocr' | 'recipe' | 'checkbox';
  question: string;
  options?: string[];
  required: boolean;
  order: number;
  // Configurações de validação por tipo
  validation?: {
    // Para tipo 'recipe' (valores numéricos)
    minValue?: number;
    maxValue?: number;
    tolerance?: number;
    unit?: string;
    // Para tipo 'ocr' (comparação de etiqueta)
    minSimilarity?: number;
    requiredFields?: string[];
    // Para tipo 'text' (validação de texto)
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    requiredWords?: string[];
    // Para tipo 'multiple_choice' e 'checkbox'
    correctAnswer?: string | string[];
    // Para todos os tipos
    expectedResult?: any;
  };
  // Configurações de workflow
  workflow?: {
    onSuccess: WorkflowAction[];
    onFailure: WorkflowAction[];
    criticality: 'low' | 'medium' | 'high' | 'critical';
  };
}

interface WorkflowAction {
  type: 'continue' | 'stop' | 'block' | 'rnc' | 'notify' | 'rework' | 'attention' | 'discard';
  parameters?: {
    rncCode?: string;
    notifyUsers?: string[];
    blockReason?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    message?: string;
  };
}

export default function PlanModal({ isOpen, onClose, plan, mode, onSave }: PlanModalProps) {
  const { toast } = useToast();
  const { data: products = [], isLoading: productsLoading, error: productsError } = useProducts();
  
  // Debug: Log dos produtos carregados
  useEffect(() => {
    console.log('🔍 ===== DEBUG PRODUTOS NO MODAL =====');
    console.log('📦 Produtos carregados no modal:', products);
    console.log('📦 Quantidade de produtos:', products.length);
    console.log('⏳ Loading produtos:', productsLoading);
    console.log('❌ Erro produtos:', productsError);
    
    if (products.length > 0) {
      console.log('📋 Primeiros 3 produtos:');
      products.slice(0, 3).forEach((product, index) => {
        console.log(`  ${index + 1}. Código: ${product.code}, Nome: ${product.description}, Categoria: ${product.category}`);
      });
    }
    
    console.log('🔍 ===== FIM DEBUG PRODUTOS =====');
  }, [products, productsLoading, productsError]);

  // Estados para navegação entre etapas
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(4);
  
  // Estados para dados do plano
  const [formData, setFormData] = useState<Partial<InspectionPlan>>({
    planCode: '',
    planName: '',
    planType: 'product',
    version: 'Rev. 01',
    status: 'draft',
    productName: '',
    productFamily: '',
    businessUnit: 'N/A',
    inspectionType: 'mixed',
    aqlCritical: 0.065,
    aqlMajor: 1.0,
    aqlMinor: 2.5,
    samplingMethod: 'Normal',
    inspectionLevel: 'II',
    createdBy: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  // Estados para etapas e perguntas
  const [inspectionSteps, setInspectionSteps] = useState<InspectionStep[]>([]);
  const [inspectionQuestions, setInspectionQuestions] = useState<InspectionQuestion[]>([]);
  
  // Estados para validação
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Debug: Log das mudanças no formData
  useEffect(() => {
    console.log('📝 ===== FORM DATA ATUALIZADO =====');
    console.log('📝 FormData atual:', formData);
    console.log('📝 Nome do produto:', formData.productName);
    console.log('📝 Nome do plano:', formData.planName);
    console.log('📝 Família:', formData.productFamily);
    console.log('📝 ===== FIM FORM DATA =====');
  }, [formData]);

  useEffect(() => {
    const initializeFormData = async () => {
      if (plan && mode !== 'create') {
        setFormData(plan);
      } else if (mode === 'create') {
        // Gerar código do plano automaticamente
        const planCode = await generatePlanCode();
        
        setFormData({
          planCode: planCode, // Código gerado automaticamente
          planName: '',
          planType: 'product',
          version: generateVersion(false), // Versão automática
          status: 'draft',
          productName: '',
          productFamily: '',
          businessUnit: 'N/A',
          inspectionType: 'mixed',
          aqlCritical: 0.065,
          aqlMajor: 1.0,
          aqlMinor: 2.5,
          samplingMethod: 'Normal',
          inspectionLevel: 'II',
          createdBy: '',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setCurrentStep(1);
        setInspectionSteps([]);
        setInspectionQuestions([]);
      } else if (mode === 'edit' && plan) {
        // Atualizar versão ao editar
        setFormData(prev => ({
          ...prev,
          version: generateVersion(true)
        }));
      }
    };

    initializeFormData();
  }, [plan, mode]);

  // Função para buscar produto por código
  const handleProductCodeChange = (code: string) => {
    setProductSearch(code);
    
    // Só fazer busca se tiver pelo menos 2 caracteres
    if (code.length < 2) {
      setHasSearched(false);
      console.log('⏳ Aguardando mais caracteres para buscar...');
      return;
    }
    
    setHasSearched(true);
    
    console.log('🔍 ===== INICIANDO BUSCA DE PRODUTO =====');
    console.log('🔍 Código digitado:', code);
    console.log('📦 Total de produtos disponíveis:', products.length);
    console.log('📦 Lista de produtos:', products.map(p => ({ 
      code: p.code, 
      name: p.description,
      category: p.category 
    })));
    
    // Busca exata primeiro
    let product = products.find(p => p.code?.toLowerCase() === code.toLowerCase());
    console.log('🎯 Busca exata resultou em:', product ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
    
    // Se não encontrar, busca parcial
    if (!product) {
      product = products.find(p => p.code?.toLowerCase().includes(code.toLowerCase()));
      console.log('🔍 Busca parcial resultou em:', product ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
    }
    
    if (product) {
      const planName = `PLANO DE INSPEÇÃO - ${product.description}`;
      
      console.log('✅ ===== PRODUTO ENCONTRADO =====');
      console.log('✅ Produto:', product);
      console.log('✅ Nome do Plano gerado:', planName);
      
      setFormData(prev => {
        const newFormData = {
          ...prev,
          productName: product.description, // Nome do produto
          planName: planName, // Nome do plano automático
          productFamily: product.category || '', // Família/categoria
          businessUnit: product.business_unit || 'N/A' // Unidade de negócio
        };
        
        console.log('🔄 ===== ATUALIZANDO FORM DATA =====');
        console.log('🔄 FormData anterior:', prev);
        console.log('🔄 FormData novo:', newFormData);
        
        return newFormData;
      });
      
      console.log('📝 ===== DADOS PREENCHIDOS =====');
      console.log('📝 Nome do Produto:', product.description);
      console.log('📝 Nome do Plano:', planName);
      console.log('📝 Família:', product.category);
      console.log('📝 Unidade de Negócio:', product.business_unit);
      
      // Mostrar toast de sucesso
      toast({
        title: "✅ Produto encontrado!",
        description: `Produto "${product.description}" carregado com sucesso`,
        duration: 3000,
      });
    } else {
      console.log('❌ ===== PRODUTO NÃO ENCONTRADO =====');
      console.log('❌ Código buscado:', code);
      console.log('❌ Produtos disponíveis:', products.map(p => p.code));
      
      // Limpar campos se não encontrar
      setFormData(prev => ({
        ...prev,
        productName: '',
        planName: '',
        productFamily: '',
        businessUnit: 'N/A'
      }));
      
      // Mostrar toast de aviso
      toast({
        title: "❌ Produto não encontrado",
        description: `Nenhum produto encontrado com o código "${code}"`,
        variant: "destructive",
        duration: 3000,
      });
    }
    
    console.log('🔍 ===== FIM DA BUSCA =====');
  };

  // Função para gerar código do plano automaticamente
  const generatePlanCode = async () => {
    try {
      console.log('🔢 ===== GERANDO CÓDIGO DO PLANO =====');
      
      // Gerar código único baseado em timestamp (sem consultar Supabase)
      console.log('🔢 Gerando código único baseado em timestamp');
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 100);
      const nextNumber = (timestamp % 1000) + randomSuffix;
      const newCode = `PI03.${String(nextNumber).padStart(3, '0')}`;
      
      console.log('✅ Novo código gerado:', newCode);
      console.log('🔢 ===== FIM GERAÇÃO CÓDIGO =====');
      return newCode;
    } catch (error) {
      console.error('❌ Erro ao gerar código do plano:', error);
      return 'PI03.001'; // Fallback em caso de erro
    }
  };

  // Função para gerar versão automática
  const generateVersion = (isEdit: boolean = false) => {
    if (isEdit && plan) {
      // Se está editando, incrementar versão
      const currentVersion = plan.version || 'Rev. 01';
      const versionNumber = parseInt(currentVersion.split(' ')[1]) || 1;
      return `Rev. ${String(versionNumber + 1).padStart(2, '0')}`;
    }
    return 'Rev. 01'; // Primeira versão
  };

  // Validação por etapa
  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    switch (step) {
      case 1:
        if (!formData.planName?.trim()) newErrors.planName = 'Nome do plano é obrigatório';
        if (!formData.productName?.trim()) newErrors.productName = 'Nome do produto é obrigatório';
        if (!formData.planCode?.trim()) newErrors.planCode = 'Código do plano é obrigatório';
        break;
      case 2:
        if (inspectionSteps.length === 0) newErrors.steps = 'Pelo menos uma etapa é obrigatória';
        break;
      case 3:
        if (inspectionQuestions.length === 0) newErrors.questions = 'Pelo menos uma pergunta é obrigatória';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navegação entre etapas
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  // Funções para gerenciar etapas
  const addInspectionStep = () => {
    const newStep: InspectionStep = {
      id: `step-${Date.now()}`,
      name: '',
      description: '',
      order: inspectionSteps.length + 1
    };
    setInspectionSteps(prev => [...prev, newStep]);
  };

  const updateInspectionStep = (id: string, field: keyof InspectionStep, value: string) => {
    setInspectionSteps(prev => prev.map(step => 
      step.id === id ? { ...step, [field]: value } : step
    ));
  };

  const removeInspectionStep = (id: string) => {
    setInspectionSteps(prev => prev.filter(step => step.id !== id));
    setInspectionQuestions(prev => prev.filter(q => q.stepId !== id));
  };

  // Funções para gerenciar perguntas
  const addInspectionQuestion = (stepId: string) => {
    const newQuestion: InspectionQuestion = {
      id: `question-${Date.now()}`,
      stepId,
      type: 'text',
      question: '',
      required: true,
      order: inspectionQuestions.filter(q => q.stepId === stepId).length + 1
    };
    setInspectionQuestions(prev => [...prev, newQuestion]);
  };

  const updateInspectionQuestion = (id: string, field: keyof InspectionQuestion, value: any) => {
    setInspectionQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const removeInspectionQuestion = (id: string) => {
    setInspectionQuestions(prev => prev.filter(q => q.id !== id));
  };

  // Funções para gerenciar validação e workflow
  const updateQuestionValidation = (questionId: string, validation: any) => {
    setInspectionQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, validation: { ...q.validation, ...validation } } : q
    ));
  };

  const updateQuestionWorkflow = (questionId: string, workflow: any) => {
    setInspectionQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, workflow: { ...q.workflow, ...workflow } } : q
    ));
  };

  const addWorkflowAction = (questionId: string, type: 'onSuccess' | 'onFailure', action: WorkflowAction) => {
    setInspectionQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const currentWorkflow = q.workflow || { onSuccess: [], onFailure: [], criticality: 'medium' };
        return {
          ...q,
          workflow: {
            ...currentWorkflow,
            [type]: [...(currentWorkflow[type] || []), action]
          }
        };
      }
      return q;
    }));
  };

  const removeWorkflowAction = (questionId: string, type: 'onSuccess' | 'onFailure', actionIndex: number) => {
    setInspectionQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const currentWorkflow = q.workflow || { onSuccess: [], onFailure: [], criticality: 'medium' };
        return {
          ...q,
          workflow: {
            ...currentWorkflow,
            [type]: (currentWorkflow[type] || []).filter((_, index) => index !== actionIndex)
          }
        };
      }
      return q;
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);
    try {
      const planData = {
        ...formData,
        inspectionSteps: inspectionSteps,
        inspectionQuestions: inspectionQuestions
      };
      await onSave(planData);
      toast({
        title: "Sucesso",
        description: mode === 'create' ? "Plano criado com sucesso!" : "Plano atualizado com sucesso!"
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar plano",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';

  // Componente para indicador de etapas
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
              step <= currentStep 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}
            onClick={() => !isReadOnly && goToStep(step)}
          >
            {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
          </div>
          {step < 4 && (
            <div className={`w-12 h-1 mx-2 ${
              step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  // Renderizar conteúdo da etapa atual
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Etapa 1: Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productCode">Código do Produto *</Label>
                  <Input
                    id="productCode"
                    value={productSearch}
                    onChange={(e) => handleProductCodeChange(e.target.value)}
                    placeholder="Digite o código do produto..."
                    disabled={isReadOnly}
                  />
                  {productsLoading && (
                    <p className="text-xs text-blue-500 mt-1">🔄 Carregando produtos...</p>
                  )}
                  {!productsLoading && products.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ {products.length} produtos disponíveis para busca
                    </p>
                  )}
                  {!productsLoading && products.length === 0 && !productsError && (
                    <p className="text-xs text-orange-500 mt-1">
                      ⚠️ Nenhum produto cadastrado no sistema
                    </p>
                  )}
                  {!productsLoading && productsError && (
                    <p className="text-xs text-red-500 mt-1">
                      ❌ Erro ao carregar produtos: {productsError.message}
                    </p>
                  )}
                  {errors.productName && (
                    <p className="text-sm text-red-500 mt-1">{errors.productName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="productName">Nome do Produto *</Label>
                  <Input
                    id="productName"
                    value={formData.productName || ''}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    placeholder="Nome do produto (preenchido automaticamente)"
                    disabled={isReadOnly || !!formData.productName}
                    className={formData.productName ? "bg-gray-100 dark:bg-gray-700" : ""}
                  />
                  {formData.productName && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Preenchido automaticamente pelo código do produto
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="planName">Nome do Plano *</Label>
                  <Input
                    id="planName"
                    value={formData.planName || ''}
                    onChange={(e) => handleInputChange('planName', e.target.value)}
                    placeholder="PLANO DE INSPEÇÃO - [NOME DO PRODUTO]"
                    disabled={isReadOnly || !!formData.planName}
                    className={formData.planName ? "bg-gray-100 dark:bg-gray-700" : ""}
                  />
                  {formData.planName && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Gerado automaticamente: "PLANO DE INSPEÇÃO - [NOME DO PRODUTO]"
                    </p>
                  )}
                  {errors.planName && (
                    <p className="text-sm text-red-500 mt-1">{errors.planName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="planCode">Código do Plano *</Label>
                  <Input
                    id="planCode"
                    value={formData.planCode || ''}
                    placeholder="PI03.001 (gerado automaticamente)"
                    disabled={true}
                    className="bg-gray-100 dark:bg-gray-700"
                  />
                  {formData.planCode && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Código gerado automaticamente: {formData.planCode}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    🔢 Formato: PI03.001, PI03.002, PI03.003...
                  </p>
                  {errors.planCode && (
                    <p className="text-sm text-red-500 mt-1">{errors.planCode}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="productFamily">Família do Produto</Label>
                  <Select 
                    value={formData.productFamily || ''} 
                    onValueChange={(value) => handleInputChange('productFamily', value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800">
                      <SelectValue placeholder="Selecione a família do produto" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      {Array.from(new Set(products.map(p => p.category).filter(Boolean))).map((category) => (
                        <SelectItem 
                          key={category} 
                          value={category}
                          className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {category}
                        </SelectItem>
                      ))}
                      {products.length === 0 && (
                        <SelectItem value="loading" disabled>
                          {productsLoading ? 'Carregando categorias...' : 'Nenhuma categoria disponível'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {products.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      📂 {Array.from(new Set(products.map(p => p.category).filter(Boolean))).length} famílias disponíveis
                    </p>
                  )}
                  {formData.productFamily && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Família selecionada automaticamente
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="businessUnit">Unidade de Negócio</Label>
                  <Select 
                    value={formData.businessUnit || 'N/A'} 
                    onValueChange={(value) => handleInputChange('businessUnit', value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <SelectItem value="DIY" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">DIY</SelectItem>
                      <SelectItem value="TECH" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">TECH</SelectItem>
                      <SelectItem value="KITCHEN_BEAUTY" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">KITCHEN_BEAUTY</SelectItem>
                      <SelectItem value="MOTOR_COMFORT" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">MOTOR_COMFORT</SelectItem>
                      <SelectItem value="N/A" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="version">Versão</Label>
                  <Input
                    id="version"
                    value={formData.version || ''}
                    placeholder="Versão automática"
                    disabled={true}
                    className="bg-gray-100 dark:bg-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Versão gerada automaticamente (Rev. 01, Rev. 02, etc.)
                  </p>
                </div>
                <div>
                  <Label htmlFor="inspectionType">Tipo de Inspeção</Label>
                  <Select 
                    value={formData.inspectionType || 'mixed'} 
                    onValueChange={(value) => handleInputChange('inspectionType', value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <SelectItem value="functional" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">Funcional</SelectItem>
                      <SelectItem value="graphic" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">Gráfico</SelectItem>
                      <SelectItem value="dimensional" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">Dimensional</SelectItem>
                      <SelectItem value="electrical" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">Elétrico</SelectItem>
                      <SelectItem value="packaging" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">Embalagem</SelectItem>
                      <SelectItem value="mixed" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">Misto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Etapa 2: Etapas de Inspeção
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.steps && (
                <p className="text-sm text-red-500">{errors.steps}</p>
              )}
              
              {inspectionSteps.map((step, index) => (
                <Card key={step.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Etapa {step.order}</h4>
                      {!isReadOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInspectionStep(step.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome da Etapa *</Label>
                        <Input
                          value={step.name}
                          onChange={(e) => updateInspectionStep(step.id, 'name', e.target.value)}
                          placeholder="Ex: Inspeção Visual"
                          disabled={isReadOnly}
                        />
                      </div>
                      <div>
                        <Label>Descrição *</Label>
                        <Textarea
                          value={step.description}
                          onChange={(e) => updateInspectionStep(step.id, 'description', e.target.value)}
                          placeholder="Descreva o que será inspecionado nesta etapa..."
                          rows={2}
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {!isReadOnly && (
                <Button onClick={addInspectionStep} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Etapa
                </Button>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Etapa 3: Perguntas de Inspeção
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.questions && (
                <p className="text-sm text-red-500">{errors.questions}</p>
              )}
              
              {inspectionSteps.map((step) => (
                <Card key={step.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <CardTitle className="text-base">{step.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {inspectionQuestions
                      .filter(q => q.stepId === step.id)
                      .map((question) => (
                        <Card key={question.id} className="bg-gray-50">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">Pergunta {question.order}</Badge>
                              {!isReadOnly && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeInspectionQuestion(question.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                            <div className="space-y-3">
                              <div>
                                <Label>Tipo de Pergunta</Label>
                                <Select
                                  value={question.type}
                                  onValueChange={(value) => updateInspectionQuestion(question.id, 'type', value)}
                                  disabled={isReadOnly}
                                >
                                  <SelectTrigger className="bg-white dark:bg-gray-800">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <SelectItem value="text" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">Texto</SelectItem>
                                    <SelectItem value="multiple_choice" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">Múltipla Escolha</SelectItem>
                                    <SelectItem value="checkbox" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">Checkbox</SelectItem>
                                    <SelectItem value="ocr" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">OCR - Comparação de Etiqueta</SelectItem>
                                    <SelectItem value="recipe" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">Receita</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Pergunta *</Label>
                                <Input
                                  value={question.question}
                                  onChange={(e) => updateInspectionQuestion(question.id, 'question', e.target.value)}
                                  placeholder="Digite a pergunta..."
                                  disabled={isReadOnly}
                                />
                              </div>
                              {question.type === 'multiple_choice' && (
                                <div>
                                  <Label>Opções (separadas por vírgula)</Label>
                                  <Input
                                    value={question.options?.join(', ') || ''}
                                    onChange={(e) => updateInspectionQuestion(question.id, 'options', e.target.value.split(', '))}
                                    placeholder="Opção 1, Opção 2, Opção 3"
                                    disabled={isReadOnly}
                                  />
                                </div>
                              )}

                              {/* Configurações de Validação */}
                              <div className="border-t pt-3 mt-3">
                                <Label className="text-sm font-medium">Configurações de Validação</Label>
                                
                                {question.type === 'recipe' && (
                                  <div className="grid grid-cols-2 gap-3 mt-2">
                                    <div>
                                      <Label className="text-xs">Valor Mínimo</Label>
                                      <Input
                                        type="number"
                                        value={question.validation?.minValue || ''}
                                        onChange={(e) => updateQuestionValidation(question.id, { minValue: parseFloat(e.target.value) })}
                                        placeholder="Ex: 1"
                                        disabled={isReadOnly}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Valor Máximo</Label>
                                      <Input
                                        type="number"
                                        value={question.validation?.maxValue || ''}
                                        onChange={(e) => updateQuestionValidation(question.id, { maxValue: parseFloat(e.target.value) })}
                                        placeholder="Ex: 2"
                                        disabled={isReadOnly}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Tolerância (%)</Label>
                                      <Input
                                        type="number"
                                        value={question.validation?.tolerance || ''}
                                        onChange={(e) => updateQuestionValidation(question.id, { tolerance: parseFloat(e.target.value) })}
                                        placeholder="Ex: 5"
                                        disabled={isReadOnly}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Unidade</Label>
                                      <Input
                                        value={question.validation?.unit || ''}
                                        onChange={(e) => updateQuestionValidation(question.id, { unit: e.target.value })}
                                        placeholder="Ex: V, A, mm"
                                        disabled={isReadOnly}
                                      />
                                    </div>
                                  </div>
                                )}

                                {question.type === 'ocr' && (
                                  <div className="grid grid-cols-2 gap-3 mt-2">
                                    <div>
                                      <Label className="text-xs">Similaridade Mínima (%)</Label>
                                      <Input
                                        type="number"
                                        value={question.validation?.minSimilarity || ''}
                                        onChange={(e) => updateQuestionValidation(question.id, { minSimilarity: parseFloat(e.target.value) })}
                                        placeholder="Ex: 80"
                                        disabled={isReadOnly}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Campos Obrigatórios</Label>
                                      <Input
                                        value={question.validation?.requiredFields?.join(', ') || ''}
                                        onChange={(e) => updateQuestionValidation(question.id, { requiredFields: e.target.value.split(', ') })}
                                        placeholder="Código, Nome, Data"
                                        disabled={isReadOnly}
                                      />
                                    </div>
                                  </div>
                                )}

                                {question.type === 'text' && (
                                  <div className="grid grid-cols-2 gap-3 mt-2">
                                    <div>
                                      <Label className="text-xs">Tamanho Mínimo</Label>
                                      <Input
                                        type="number"
                                        value={question.validation?.minLength || ''}
                                        onChange={(e) => updateQuestionValidation(question.id, { minLength: parseInt(e.target.value) })}
                                        placeholder="Ex: 10"
                                        disabled={isReadOnly}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Tamanho Máximo</Label>
                                      <Input
                                        type="number"
                                        value={question.validation?.maxLength || ''}
                                        onChange={(e) => updateQuestionValidation(question.id, { maxLength: parseInt(e.target.value) })}
                                        placeholder="Ex: 100"
                                        disabled={isReadOnly}
                                      />
                                    </div>
                                    <div className="col-span-2">
                                      <Label className="text-xs">Palavras Obrigatórias</Label>
                                      <Input
                                        value={question.validation?.requiredWords?.join(', ') || ''}
                                        onChange={(e) => updateQuestionValidation(question.id, { requiredWords: e.target.value.split(', ') })}
                                        placeholder="Palavra1, Palavra2, Palavra3"
                                        disabled={isReadOnly}
                                      />
                                    </div>
                                  </div>
                                )}

                                {(question.type === 'multiple_choice' || question.type === 'checkbox') && (
                                  <div className="mt-2">
                                    <Label className="text-xs">Resposta Correta</Label>
                                    <Input
                                      value={Array.isArray(question.validation?.correctAnswer) 
                                        ? question.validation.correctAnswer.join(', ') 
                                        : question.validation?.correctAnswer || ''}
                                      onChange={(e) => updateQuestionValidation(question.id, { correctAnswer: e.target.value.split(', ') })}
                                      placeholder="Resposta correta ou Resposta1, Resposta2"
                                      disabled={isReadOnly}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Configurações de Workflow */}
                              <div className="border-t pt-3 mt-3">
                                <Label className="text-sm font-medium">Configurações de Workflow</Label>
                                
                                <div className="mt-2">
                                  <Label className="text-xs">Criticidade</Label>
                                  <Select
                                    value={question.workflow?.criticality || 'medium'}
                                    onValueChange={(value) => updateQuestionWorkflow(question.id, { criticality: value })}
                                    disabled={isReadOnly}
                                  >
                                    <SelectTrigger className="bg-white dark:bg-gray-800">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                      <SelectItem value="low" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">Baixa</SelectItem>
                                      <SelectItem value="medium" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">Média</SelectItem>
                                      <SelectItem value="high" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">Alta</SelectItem>
                                      <SelectItem value="critical" className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">Crítica</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Ações em Caso de Sucesso */}
                                <div className="mt-3">
                                  <Label className="text-xs">Ações em Caso de Sucesso (Conforme)</Label>
                                  <div className="space-y-2 mt-1">
                                    {(question.workflow?.onSuccess || []).map((action, index) => (
                                      <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                                        <Badge variant="outline" className="text-green-600">
                                          {action.type === 'continue' && 'Continuar'}
                                          {action.type === 'notify' && 'Notificar'}
                                          {action.type === 'attention' && 'Atenção'}
                                        </Badge>
                                        {action.parameters?.message && (
                                          <span className="text-xs text-gray-600">{action.parameters.message}</span>
                                        )}
                                        {!isReadOnly && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeWorkflowAction(question.id, 'onSuccess', index)}
                                          >
                                            <Trash2 className="w-3 h-3 text-red-500" />
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                    {!isReadOnly && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addWorkflowAction(question.id, 'onSuccess', { type: 'continue' })}
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Adicionar Ação
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                {/* Ações em Caso de Falha */}
                                <div className="mt-3">
                                  <Label className="text-xs">Ações em Caso de Falha (Não Conforme)</Label>
                                  <div className="space-y-2 mt-1">
                                    {(question.workflow?.onFailure || []).map((action, index) => (
                                      <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                                        <Badge variant="outline" className="text-red-600">
                                          {action.type === 'stop' && 'Parar'}
                                          {action.type === 'block' && 'Bloquear'}
                                          {action.type === 'rnc' && 'Criar RNC'}
                                          {action.type === 'notify' && 'Notificar'}
                                          {action.type === 'rework' && 'Retrabalho'}
                                          {action.type === 'attention' && 'Atenção'}
                                          {action.type === 'discard' && 'Descarte'}
                                        </Badge>
                                        {action.parameters?.rncCode && (
                                          <span className="text-xs text-gray-600">Código: {action.parameters.rncCode}</span>
                                        )}
                                        {action.parameters?.blockReason && (
                                          <span className="text-xs text-gray-600">Motivo: {action.parameters.blockReason}</span>
                                        )}
                                        {!isReadOnly && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeWorkflowAction(question.id, 'onFailure', index)}
                                          >
                                            <Trash2 className="w-3 h-3 text-red-500" />
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                    {!isReadOnly && (
                                      <div className="flex gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => addWorkflowAction(question.id, 'onFailure', { 
                                            type: 'rnc', 
                                            parameters: { rncCode: `RNC-${Date.now()}` } 
                                          })}
                                        >
                                          <Plus className="w-3 h-3 mr-1" />
                                          RNC
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => addWorkflowAction(question.id, 'onFailure', { 
                                            type: 'block', 
                                            parameters: { blockReason: 'Não conformidade detectada' } 
                                          })}
                                        >
                                          <Plus className="w-3 h-3 mr-1" />
                                          Bloquear
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => addWorkflowAction(question.id, 'onFailure', { 
                                            type: 'notify', 
                                            parameters: { message: 'Notificar supervisor' } 
                                          })}
                                        >
                                          <Plus className="w-3 h-3 mr-1" />
                                          Notificar
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    
                    {!isReadOnly && (
                      <Button 
                        onClick={() => addInspectionQuestion(step.id)} 
                        variant="outline" 
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Pergunta
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Etapa 4: Workflow e Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resumo do Plano */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Resumo do Plano</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>Nome:</strong> {formData.planName}</p>
                    <p><strong>Produto:</strong> {formData.productName}</p>
                    <p><strong>Etapas:</strong> {inspectionSteps.length}</p>
                    <p><strong>Perguntas:</strong> {inspectionQuestions.length}</p>
                    <p><strong>Tipo:</strong> {formData.inspectionType}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Fluxo de Inspeção</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {inspectionSteps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">
                          {index + 1}
                        </div>
                        <span>{step.name}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Preview do Workflow */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Preview do Workflow de Validação</h3>
                <div className="space-y-4">
                  {inspectionSteps.map((step) => (
                    <Card key={step.id} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="text-base">{step.name}</CardTitle>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {inspectionQuestions
                          .filter(q => q.stepId === step.id)
                          .map((question) => (
                            <div key={question.id} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-sm">{question.question}</h4>
                                <div className="flex gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {question.type === 'recipe' && 'Receita'}
                                    {question.type === 'ocr' && 'OCR'}
                                    {question.type === 'text' && 'Texto'}
                                    {question.type === 'multiple_choice' && 'Múltipla Escolha'}
                                    {question.type === 'checkbox' && 'Checkbox'}
                                  </Badge>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      question.workflow?.criticality === 'critical' ? 'text-red-600 bg-red-50' :
                                      question.workflow?.criticality === 'high' ? 'text-orange-600 bg-orange-50' :
                                      question.workflow?.criticality === 'medium' ? 'text-yellow-600 bg-yellow-50' :
                                      'text-green-600 bg-green-50'
                                    }`}
                                  >
                                    {question.workflow?.criticality === 'critical' && 'Crítica'}
                                    {question.workflow?.criticality === 'high' && 'Alta'}
                                    {question.workflow?.criticality === 'medium' && 'Média'}
                                    {question.workflow?.criticality === 'low' && 'Baixa'}
                                  </Badge>
                                </div>
                              </div>
                              
                              {/* Configurações de Validação */}
                              <div className="text-xs text-gray-600 mb-2">
                                {question.type === 'recipe' && question.validation && (
                                  <div>
                                    <strong>Validação:</strong> Min: {question.validation.minValue || 'N/A'}, 
                                    Max: {question.validation.maxValue || 'N/A'}
                                    {question.validation.unit && ` (${question.validation.unit})`}
                                    {question.validation.tolerance && `, Tolerância: ±${question.validation.tolerance}%`}
                                  </div>
                                )}
                                {question.type === 'ocr' && question.validation && (
                                  <div>
                                    <strong>Validação:</strong> Similaridade mínima: {question.validation.minSimilarity || 'N/A'}%
                                    {question.validation.requiredFields && `, Campos: ${question.validation.requiredFields.join(', ')}`}
                                  </div>
                                )}
                                {question.type === 'text' && question.validation && (
                                  <div>
                                    <strong>Validação:</strong> 
                                    {question.validation.minLength && ` Min: ${question.validation.minLength} chars`}
                                    {question.validation.maxLength && `, Max: ${question.validation.maxLength} chars`}
                                    {question.validation.requiredWords && `, Palavras: ${question.validation.requiredWords.join(', ')}`}
                                  </div>
                                )}
                                {(question.type === 'multiple_choice' || question.type === 'checkbox') && question.validation && (
                                  <div>
                                    <strong>Validação:</strong> Resposta correta: {Array.isArray(question.validation.correctAnswer) 
                                      ? question.validation.correctAnswer.join(', ') 
                                      : question.validation.correctAnswer || 'N/A'}
                                  </div>
                                )}
                              </div>

                              {/* Ações do Workflow */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Ações de Sucesso */}
                                <div>
                                  <Label className="text-xs text-green-600 font-medium">✅ Se Conforme:</Label>
                                  <div className="space-y-1 mt-1">
                                    {(question.workflow?.onSuccess || []).map((action, index) => (
                                      <div key={index} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                                        {action.type === 'continue' && '→ Continuar inspeção'}
                                        {action.type === 'notify' && '→ Notificar'}
                                        {action.type === 'attention' && '→ Marcar atenção'}
                                      </div>
                                    ))}
                                    {(!question.workflow?.onSuccess || question.workflow.onSuccess.length === 0) && (
                                      <div className="text-xs text-gray-500 italic">Nenhuma ação configurada</div>
                                    )}
                                  </div>
                                </div>

                                {/* Ações de Falha */}
                                <div>
                                  <Label className="text-xs text-red-600 font-medium">❌ Se Não Conforme:</Label>
                                  <div className="space-y-1 mt-1">
                                    {(question.workflow?.onFailure || []).map((action, index) => (
                                      <div key={index} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                                        {action.type === 'stop' && '→ Parar inspeção'}
                                        {action.type === 'block' && '→ Bloquear produto'}
                                        {action.type === 'rnc' && `→ Criar RNC ${action.parameters?.rncCode || ''}`}
                                        {action.type === 'notify' && '→ Notificar supervisor'}
                                        {action.type === 'rework' && '→ Marcar retrabalho'}
                                        {action.type === 'attention' && '→ Marcar atenção'}
                                        {action.type === 'discard' && '→ Marcar descarte'}
                                      </div>
                                    ))}
                                    {(!question.workflow?.onFailure || question.workflow.onFailure.length === 0) && (
                                      <div className="text-xs text-gray-500 italic">Nenhuma ação configurada</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Simulação de Workflow */}
              <div className="text-center py-6 bg-blue-50 rounded-lg">
                <Play className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Simulação do Workflow</h3>
                <p className="text-gray-600 mb-4">
                  Teste o fluxo de validação com dados de exemplo
                </p>
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      console.log('👁️ Visualizando como usuário...');
                      toast({
                        title: "👁️ Visualização como Usuário",
                        description: "Esta funcionalidade será implementada em breve. Por enquanto, você pode visualizar o plano criado na lista de planos.",
                        duration: 5000
                      });
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver como Usuário
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto" style={{ margin: 'auto' }}>
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {mode === 'create' ? 'Novo Plano de Inspeção' : 
               mode === 'edit' ? 'Editar Plano de Inspeção' : 
               'Visualizar Plano de Inspeção'}
            </h2>
            {plan && (
              <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                {plan.status === 'active' ? 'Ativo' : plan.status === 'draft' ? 'Rascunho' : 'Inativo'}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          <StepIndicator />
          {renderStepContent()}
        </div>

        <div className="flex items-center justify-between p-6 border-t">
          <div className="flex items-center gap-3">
            {currentStep > 1 && !isReadOnly && (
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              {isReadOnly ? 'Fechar' : 'Cancelar'}
            </Button>
            
            {!isReadOnly && (
              <>
                {currentStep < totalSteps ? (
                  <Button onClick={nextStep}>
                    Prosseguir
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSave} disabled={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Salvando...' : 'Salvar Plano'}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}