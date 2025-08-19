import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save,
  FileText,
  CheckSquare,
  Camera,
  BarChart3,
  Users,
  Shield,
  Calendar,
  Tag,
  Info,
  Target,
  ArrowRight,
  XCircle,
  CheckCircle,
  AlertCircle,
  Eye,
  Type,
  Image,
  List,
  CheckCircle2,
  FileImage,
  AlignLeft,
  Hash
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
import { useProducts } from '@/hooks/use-products';
import { useInspectionPlans, type InspectionPlan, type InspectionStep, type InspectionField, type DefectType, DEFAULT_GRAPHIC_INSPECTION_STEP } from '@/hooks/use-inspection-plans';

// Tipos de pergunta disponíveis
export type QuestionType = 
  | 'true_false' 
  | 'multiple_choice' 
  | 'ok_nok' 
  | 'text' 
  | 'photo' 
  | 'number' 
  | 'scale_1_5' 
  | 'scale_1_10' 
  | 'yes_no' 
  | 'checklist';

interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

interface NewInspectionPlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: Omit<InspectionPlan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export default function NewInspectionPlanForm({
  isOpen,
  onClose,
  onSave
}: NewInspectionPlanFormProps) {
  const { toast } = useToast();
  const { products, isLoading: productsLoading } = useProducts();
  
  // Estados principais
  const [activeTab, setActiveTab] = useState('basic');
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [customProductName, setCustomProductName] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const productInputRef = useRef<HTMLInputElement>(null);
  const [validUntil, setValidUntil] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  
  // Estados para etapas
  const [steps, setSteps] = useState<InspectionStep[]>([DEFAULT_GRAPHIC_INSPECTION_STEP]);
  const [newStepName, setNewStepName] = useState('');
  const [newStepDescription, setNewStepDescription] = useState('');
  
  // Estados para perguntas
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>('ok_nok');
  const [newQuestionDefectType, setNewQuestionDefectType] = useState<DefectType>('MAIOR');
  const [selectedStepForQuestion, setSelectedStepForQuestion] = useState<string>('');
  const [questionOptions, setQuestionOptions] = useState<QuestionOption[]>([]);
  const [newOption, setNewOption] = useState('');
  const [questionRequired, setQuestionRequired] = useState(true);
  const [questionDescription, setQuestionDescription] = useState('');
  
  // Estados para receita
  const [hasRecipe, setHasRecipe] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [recipeDescription, setRecipeDescription] = useState('');
  const [recipeSteps, setRecipeSteps] = useState<string[]>([]);
  const [newRecipeStep, setNewRecipeStep] = useState('');
  
  // Estados para receita numérica
  const [minValue, setMinValue] = useState<string>('');
  const [maxValue, setMaxValue] = useState<string>('');
  const [expectedValue, setExpectedValue] = useState<string>('');
  const [unit, setUnit] = useState<string>('');

  // Configuração dos tipos de pergunta
  const questionTypeConfig = {
    true_false: {
      label: 'Verdadeiro/Falso',
      icon: <CheckCircle2 className="w-4 h-4" />,
      description: 'Pergunta com resposta verdadeiro ou falso',
      hasOptions: false
    },
    multiple_choice: {
      label: 'Múltipla Escolha',
      icon: <List className="w-4 h-4" />,
      description: 'Pergunta com várias opções de resposta',
      hasOptions: true
    },
    ok_nok: {
      label: 'OK/NOK',
      icon: <CheckSquare className="w-4 h-4" />,
      description: 'Pergunta com resposta OK ou NOK',
      hasOptions: false
    },
    text: {
      label: 'Texto',
      icon: <AlignLeft className="w-4 h-4" />,
      description: 'Resposta em texto livre',
      hasOptions: false
    },
    photo: {
      label: 'Foto',
      icon: <Camera className="w-4 h-4" />,
      description: 'Captura de foto como evidência',
      hasOptions: false
    },
    number: {
      label: 'Número',
      icon: <Hash className="w-4 h-4" />,
      description: 'Resposta numérica',
      hasOptions: false
    },
    scale_1_5: {
      label: 'Escala 1-5',
      icon: <BarChart3 className="w-4 h-4" />,
      description: 'Avaliação em escala de 1 a 5',
      hasOptions: false
    },
    scale_1_10: {
      label: 'Escala 1-10',
      icon: <BarChart3 className="w-4 h-4" />,
      description: 'Avaliação em escala de 1 a 10',
      hasOptions: false
    },
    yes_no: {
      label: 'Sim/Não',
      icon: <CheckCircle className="w-4 h-4" />,
      description: 'Pergunta com resposta sim ou não',
      hasOptions: false
    },
    checklist: {
      label: 'Lista de Verificação',
      icon: <List className="w-4 h-4" />,
      description: 'Lista de itens para verificar',
      hasOptions: true
    }
  };

  // Função para adicionar tag
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags(prev => [...prev, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  // Função para filtrar produtos baseado no termo de busca
  const filteredProducts = products.filter(product =>
    product.description.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  // Função para selecionar produto da lista
  const selectProduct = (productId: string) => {
    setSelectedProduct(productId);
    const product = products.find(p => p.id === productId);
    setProductSearchTerm(product?.description || '');
    setCustomProductName('');
    setShowProductSuggestions(false);
    
    // Auto-preenche o nome do plano e descrição
    if (product?.description) {
      setPlanName(`PLANO DE INSPEÇÃO - ${product.description.toUpperCase()}`);
      setDescription('Plano de inspeção feito para orientar os inspetores da melhor forma para verificação dos produtos');
    }
  };

  // Função para usar nome customizado do produto
  const useCustomProductName = () => {
    if (customProductName.trim()) {
      setSelectedProduct('custom');
      setProductSearchTerm(customProductName.trim());
      setShowProductSuggestions(false);
      
      // Auto-preenche o nome do plano e descrição para produto customizado
      setPlanName(`PLANO DE INSPEÇÃO - ${customProductName.trim().toUpperCase()}`);
      setDescription('Plano de inspeção feito para orientar os inspetores da melhor forma para verificação dos produtos');
    }
  };

  // Função para calcular posição do dropdown
  const calculateDropdownPosition = () => {
    if (productInputRef.current) {
      const rect = productInputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  // Função para lidar com mudança no campo de busca de produto
  const handleProductSearchChange = (value: string) => {
    setProductSearchTerm(value);
    setCustomProductName(value);
    setShowProductSuggestions(value.length > 0);
    
    // Calcular posição do dropdown quando necessário
    if (value.length > 0) {
      setTimeout(calculateDropdownPosition, 0);
    }
    
    // Se o valor for limpo, resetar seleção
    if (!value.trim()) {
      setSelectedProduct('');
      setCustomProductName('');
      setShowProductSuggestions(false);
    }
  };

  // Função para remover tag
  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // Função para adicionar etapa
  const addStep = () => {
    if (newStepName.trim()) {
      const newStep: InspectionStep = {
        id: `step-${Date.now()}`,
        name: newStepName.trim(),
        description: newStepDescription.trim(),
        order: steps.length + 1,
        estimatedTime: 15,
        fields: [],
        questions: [],
        defectType: 'MAIOR'
      };
      setSteps(prev => [...prev, newStep]);
      setNewStepName('');
      setNewStepDescription('');
    }
  };

  // Função para remover etapa
  const removeStep = (stepId: string) => {
    if (stepId !== DEFAULT_GRAPHIC_INSPECTION_STEP.id) {
      setSteps(prev => prev.filter(step => step.id !== stepId));
    }
  };

  // Função para adicionar opção
  const addOption = () => {
    if (newOption.trim()) {
      const option: QuestionOption = {
        id: `option-${Date.now()}`,
        text: newOption.trim()
      };
      setQuestionOptions(prev => [...prev, option]);
      setNewOption('');
    }
  };

  // Função para adicionar passo da receita
  const addRecipeStep = () => {
    if (newRecipeStep.trim()) {
      setRecipeSteps(prev => [...prev, newRecipeStep.trim()]);
      setNewRecipeStep('');
    }
  };

  // Função para remover passo da receita
  const removeRecipeStep = (stepIndex: number) => {
    setRecipeSteps(prev => prev.filter((_, index) => index !== stepIndex));
  };

  // Função para remover opção
  const removeOption = (optionId: string) => {
    setQuestionOptions(prev => prev.filter(opt => opt.id !== optionId));
  };

  // Função para abrir diálogo de nova pergunta
  const openQuestionDialog = (stepId: string) => {
    setSelectedStepForQuestion(stepId);
    setShowQuestionDialog(true);
    resetQuestionForm();
  };

  // Função para resetar formulário de pergunta
  const resetQuestionForm = () => {
    setNewQuestion('');
    setNewQuestionType('ok_nok');
    setNewQuestionDefectType('MAIOR');
    setQuestionOptions([]);
    setNewOption('');
    setQuestionRequired(true);
    setQuestionDescription('');
    
    // Resetar receita
    setHasRecipe(false);
    setRecipeName('');
    setRecipeDescription('');
    setRecipeSteps([]);
    setNewRecipeStep('');
    
    // Resetar receita numérica
    setMinValue('');
    setMaxValue('');
    setExpectedValue('');
    setUnit('');
  };

  // Função para adicionar pergunta
  const addQuestion = () => {
    if (!newQuestion.trim() || !selectedStepForQuestion) return;

    // Validação para receita numérica
    if (newQuestionType === 'number' && hasRecipe) {
      if (!minValue.trim() || !maxValue.trim()) {
        toast({
          title: "Erro",
          description: "Para receitas numéricas, os valores mínimo e máximo são obrigatórios",
          variant: "destructive"
        });
        return;
      }
    }

    const question: InspectionField = {
      id: `question-${Date.now()}`,
      name: newQuestion.trim(),
      type: 'question',
      required: questionRequired,
      questionConfig: {
        questionType: newQuestionType,
        defectType: newQuestionDefectType,
        description: questionDescription.trim() || undefined,
        options: questionTypeConfig[newQuestionType].hasOptions ? questionOptions.map(opt => opt.text) : undefined,
        // Adicionar configuração numérica se for receita
        numericConfig: newQuestionType === 'number' && hasRecipe ? {
          minValue: parseFloat(minValue),
          maxValue: parseFloat(maxValue),
          expectedValue: expectedValue ? parseFloat(expectedValue) : undefined,
          unit: unit.trim() || undefined
        } : undefined
      },
      // Adicionar receita se configurada
      recipe: hasRecipe ? {
        name: newQuestionType === 'number' ? `Receita para ${newQuestion.trim()}` : recipeName.trim(),
        description: newQuestionType === 'number' ? 
          `Receita para validação de valores entre ${minValue}${unit ? ` ${unit}` : ''} e ${maxValue}${unit ? ` ${unit}` : ''}` : 
          recipeDescription.trim() || undefined,
        steps: newQuestionType === 'number' ? [] : recipeSteps,
        // Dados específicos para receita numérica
        numericRecipe: newQuestionType === 'number' ? {
          minValue: parseFloat(minValue),
          maxValue: parseFloat(maxValue),
          expectedValue: expectedValue ? parseFloat(expectedValue) : undefined,
          unit: unit.trim() || undefined
        } : undefined
      } : undefined
    };

    // Adicionar pergunta à etapa selecionada
    setSteps(prev => prev.map(step => {
      if (step.id === selectedStepForQuestion) {
        return {
          ...step,
          questions: [...step.questions, question]
        };
      }
      return step;
    }));

    setShowQuestionDialog(false);
    resetQuestionForm();
  };

  // Função para remover pergunta
  const removeQuestion = (stepId: string, questionId: string) => {
    setSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          questions: step.questions.filter(q => q.id !== questionId)
        };
      }
      return step;
    }));
  };

  // Função para salvar plano
  const handleSave = async () => {
    if (!selectedProduct || !planName.trim()) {
      toast({
        title: "Erro",
        description: "Preencha o nome do plano e selecione um produto",
        variant: "destructive"
      });
      return;
    }

    // Validação adicional para produtos customizados
    if (selectedProduct === 'custom' && !customProductName.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome do produto customizado",
        variant: "destructive"
      });
      return;
    }

    // Determinar o nome do produto baseado na seleção
    let productName = '';
    let productId = selectedProduct;
    
    if (selectedProduct === 'custom') {
      productName = customProductName.trim();
      productId = `custom_${Date.now()}`; // ID temporário para produtos customizados
    } else {
      const selectedProductData = products.find(p => p.id === selectedProduct);
      productName = selectedProductData?.description || '';
    }
    
    const planData: Omit<InspectionPlan, 'id' | 'createdAt' | 'updatedAt'> = {
      name: planName,
      productId: productId,
      productName: productName,
      products: [productId],
      revision: 1,
      validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'draft',
      steps,
      createdBy: 'current_user',
      updatedBy: 'current_user',
      tags,
      efficiency: {
        avgInspectionTime: 0,
        rejectionRate: 0,
        topRejectionCauses: []
      },
      accessControl: {
        roles: ['inspector'],
        permissions: {
          view: ['inspector'],
          edit: ['technician'],
          delete: ['engineer'],
          execute: ['inspector', 'assistant'],
          approve: ['technician', 'engineer', 'supervisor']
        }
      },
      aqlConfig: {
        critical: { aql: 0.065, acceptance: 0, rejection: 1 },
        major: { aql: 1.0, acceptance: 3, rejection: 4 },
        minor: { aql: 2.5, acceptance: 7, rejection: 8 }
      }
    };

    try {
      await onSave(planData);
      onClose();
      resetForm();
      toast({
        title: "Sucesso",
        description: "Plano de inspeção criado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar plano de inspeção",
        variant: "destructive"
      });
    }
  };

  // Função para resetar formulário
  const resetForm = () => {
    setActiveTab('basic');
    setPlanName('');
    setDescription('');
    setSelectedProduct('');
    setProductSearchTerm('');
    setCustomProductName('');
    setShowProductSuggestions(false);
    setValidUntil('');
    setTags([]);
    setCurrentTag('');
    setSteps([DEFAULT_GRAPHIC_INSPECTION_STEP]);
    setNewStepName('');
    setNewStepDescription('');
    resetQuestionForm();
  };

  // Função para fechar modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canSubmit = selectedProduct && planName.trim();

  // Recalcular posição do dropdown quando necessário
  useEffect(() => {
    if (showProductSuggestions) {
      calculateDropdownPosition();
    }
  }, [showProductSuggestions, productSearchTerm]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col inspection-plan-form new-inspection-plan-form" aria-describedby="new-inspection-plan-description">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Novo Plano de Inspeção</span>
            </DialogTitle>
            <DialogDescription>
              Crie um novo plano de inspeção de qualidade de forma simples e organizada.
            </DialogDescription>
          </DialogHeader>
          <div id="new-inspection-plan-description" className="sr-only">
            Formulário para criar um novo plano de inspeção de qualidade com etapas e perguntas
          </div>

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-3 flex-shrink-0 mx-6 mb-4 gap-1">
                <TabsTrigger value="basic" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Informações Básicas</TabsTrigger>
                <TabsTrigger value="steps" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Etapas</TabsTrigger>
                <TabsTrigger value="questions" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Perguntas</TabsTrigger>
              </TabsList>

              {/* Aba Informações Básicas */}
              <TabsContent value="basic" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-6 p-4 pb-24">
                    {/* Informações do Plano */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <FileText className="w-5 h-5" />
                          <span>Informações do Plano</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Nome do Plano *</Label>
                            <Input 
                              id="name" 
                              placeholder="Ex: Plano de Inspeção - Air Fryer" 
                              value={planName}
                              onChange={(e) => setPlanName(e.target.value)}
                              tabIndex={1}
                            />
                          </div>
                          <div className="relative product-field z-[1000]">
                            <Label htmlFor="product">Produto *</Label>
                            <div className="relative product-input-container z-[1001]">
                              <Input
                                ref={productInputRef}
                                id="product"
                                placeholder="Digite o nome do produto ou selecione da lista"
                                value={productSearchTerm}
                                onChange={(e) => handleProductSearchChange(e.target.value)}
                                onFocus={() => {
                                  setShowProductSuggestions(productSearchTerm.length > 0);
                                  if (productSearchTerm.length > 0) {
                                    setTimeout(calculateDropdownPosition, 0);
                                  }
                                }}
                                onBlur={() => setTimeout(() => setShowProductSuggestions(false), 300)}
                                className="pr-10 relative z-[1002]"
                                tabIndex={2}
                              />
                              {selectedProduct && selectedProduct !== 'custom' && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-[1003]">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                </div>
                              )}
                              {selectedProduct === 'custom' && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-[1003]">
                                  <Tag className="w-4 h-4 text-blue-500" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description">Descrição</Label>
                          <Textarea 
                            id="description"
                            placeholder="Descreva o objetivo e escopo deste plano de inspeção..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="relative z-[1]"
                            tabIndex={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="validUntil">Válido até</Label>
                            <Input 
                              id="validUntil"
                              type="date"
                              value={validUntil}
                              onChange={(e) => setValidUntil(e.target.value)}
                              tabIndex={4}
                            />
                          </div>
                          <div>
                            <Label htmlFor="tags">Tags</Label>
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Input
                                  id="tags"
                                  placeholder="Digite uma tag e pressione Enter"
                                  value={currentTag}
                                  onChange={(e) => setCurrentTag(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addTag();
                                    }
                                  }}
                                  tabIndex={5}
                                />
                                <Button type="button" onClick={addTag} disabled={!currentTag.trim()} tabIndex={6}>
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                      {tag}
                                      <button
                                        onClick={() => setTags(tags.filter((_, i) => i !== index))}
                                        className="ml-1 hover:text-red-500"
                                        tabIndex={7 + index}
                                        title={`Remover tag "${tag}"`}
                                        aria-label={`Remover tag "${tag}"`}
                                      >
                                        <XCircle className="w-3 h-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Aba Etapas */}
              <TabsContent value="steps" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-6 p-4 pb-24">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <BarChart3 className="w-5 h-5" />
                          <span>Etapas de Inspeção</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-900">Etapa Padrão</span>
                          </div>
                          <p className="text-sm text-blue-700">
                            A etapa "INSPEÇÃO MATERIAL GRÁFICO" é criada automaticamente em todos os novos planos.
                          </p>
                        </div>

                        {/* Lista de Etapas */}
                        <div className="space-y-3">
                          {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-medium">{step.name}</h4>
                                  <p className="text-sm text-gray-600">{step.description}</p>
                                  <p className="text-xs text-gray-500">Perguntas: {step.questions.length}</p>
                                </div>
                              </div>
                              {step.id !== DEFAULT_GRAPHIC_INSPECTION_STEP.id && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeStep(step.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Adicionar Nova Etapa */}
                        <Separator />
                        <div className="space-y-3">
                          <h4 className="font-medium">Adicionar Nova Etapa</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="newStepName">Nome da Etapa</Label>
                              <Input 
                                id="newStepName"
                                placeholder="Ex: Verificação Elétrica"
                                value={newStepName}
                                onChange={(e) => setNewStepName(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="newStepDescription">Descrição</Label>
                              <Input 
                                id="newStepDescription"
                                placeholder="Descrição da etapa"
                                value={newStepDescription}
                                onChange={(e) => setNewStepDescription(e.target.value)}
                              />
                            </div>
                          </div>
                          <Button onClick={addStep} disabled={!newStepName.trim()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Etapa
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Aba Perguntas */}
              <TabsContent value="questions" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-6 p-4 pb-24">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <CheckSquare className="w-5 h-5" />
                          <span>Perguntas por Etapa</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Info className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-900">Sistema de Perguntas</span>
                          </div>
                          <p className="text-sm text-green-700">
                            Adicione perguntas específicas para cada etapa. Cada pergunta pode ter diferentes tipos de resposta e deve ter uma classificação de defeito.
                          </p>
                        </div>

                        {/* Lista de Etapas com Perguntas */}
                        <div className="space-y-6">
                          {steps.map((step, stepIndex) => (
                            <div key={step.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {stepIndex + 1}
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{step.name}</h4>
                                    <p className="text-sm text-gray-600">{step.description}</p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => openQuestionDialog(step.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Adicionar Pergunta
                                </Button>
                              </div>

                              {/* Perguntas da Etapa */}
                              {step.questions.length === 0 ? (
                                <div className="text-center py-4 text-gray-500">
                                  <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p>Nenhuma pergunta adicionada</p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {step.questions.map((question, qIndex) => (
                                    <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                          {qIndex + 1}
                                        </div>
                                        <div>
                                          <h5 className="font-medium text-sm">{question.name}</h5>
                                                                                     <div className="flex items-center space-x-2 mt-1">
                                             <Badge variant="outline" className="text-xs">
                                               {questionTypeConfig[question.questionConfig?.questionType as QuestionType]?.label}
                                             </Badge>
                                             <Badge variant="outline" className="text-xs">
                                               {question.questionConfig?.defectType}
                                             </Badge>
                                             {question.required && (
                                               <Badge className="bg-red-100 text-red-800 text-xs">
                                                 Obrigatória
                                               </Badge>
                                             )}
                                             {question.recipe && (
                                               <Badge className="bg-purple-100 text-purple-800 text-xs">
                                                 📋 Receita
                                               </Badge>
                                             )}
                                           </div>
                                        </div>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeQuestion(step.id, question.id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="border-t pt-4 flex-shrink-0 bg-white sticky bottom-0 z-20 shadow-lg">
            <div className="flex justify-between w-full gap-4">
              <Button variant="outline" onClick={handleClose} tabIndex={100}>
                Cancelar
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600"
                onClick={handleSave}
                disabled={!canSubmit}
                tabIndex={101}
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Plano
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Adicionar Pergunta */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-w-2xl" aria-describedby="add-question-description">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Adicionar Nova Pergunta</span>
            </DialogTitle>
            <DialogDescription>
              Configure a nova pergunta para a etapa selecionada.
            </DialogDescription>
          </DialogHeader>
          <div id="add-question-description" className="sr-only">
            Formulário para adicionar uma nova pergunta ao plano de inspeção
          </div>

          <div className="space-y-4">
            {/* Tipo de Pergunta */}
            <div>
              <Label htmlFor="questionType">Tipo de Pergunta</Label>
              <Select value={newQuestionType} onValueChange={(value: QuestionType) => setNewQuestionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(questionTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        {config.icon}
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600 mt-1">
                {questionTypeConfig[newQuestionType].description}
              </p>
            </div>

            {/* Pergunta */}
            <div>
              <Label htmlFor="questionText">Pergunta *</Label>
              <Input 
                id="questionText"
                placeholder="Digite a pergunta..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="questionDescription">Descrição (opcional)</Label>
              <Textarea 
                id="questionDescription"
                placeholder="Descrição adicional da pergunta..."
                rows={2}
                value={questionDescription}
                onChange={(e) => setQuestionDescription(e.target.value)}
              />
            </div>

            {/* Tipo de Defeito */}
            <div>
              <Label htmlFor="defectType">Tipo de Defeito *</Label>
              <Select value={newQuestionDefectType} onValueChange={(value: DefectType) => setNewQuestionDefectType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MENOR">MENOR</SelectItem>
                  <SelectItem value="MAIOR">MAIOR</SelectItem>
                  <SelectItem value="CRÍTICO">CRÍTICO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Opções (para tipos que precisam) */}
            {questionTypeConfig[newQuestionType].hasOptions && (
              <div>
                <Label>Opções de Resposta</Label>
                <div className="space-y-2">
                  {questionOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Input 
                        value={option.text}
                        onChange={(e) => {
                          setQuestionOptions(prev => prev.map(opt => 
                            opt.id === option.id ? { ...opt, text: e.target.value } : opt
                          ));
                        }}
                        placeholder="Digite a opção..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(option.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Nova opção..."
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addOption()}
                    />
                    <Button size="sm" onClick={addOption} disabled={!newOption.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

                         {/* Obrigatória */}
             <div className="flex items-center space-x-2">
               <Checkbox 
                 id="required" 
                 checked={questionRequired}
                 onCheckedChange={(checked) => setQuestionRequired(checked as boolean)}
               />
               <Label htmlFor="required">Pergunta obrigatória</Label>
             </div>

             {/* Seção de Receita - Apenas para perguntas numéricas */}
             {newQuestionType === 'number' && (
               <>
                 <Separator />
                 <div className="space-y-4">
                   <div className="flex items-center space-x-2">
                     <Checkbox 
                       id="hasRecipe" 
                       checked={hasRecipe}
                       onCheckedChange={(checked) => setHasRecipe(checked as boolean)}
                     />
                     <Label htmlFor="hasRecipe" className="font-medium">Adicionar Receita para esta pergunta</Label>
                   </div>

                   {hasRecipe && (
                     <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                       <div className="flex items-center space-x-2 mb-4">
                         <Hash className="w-5 h-5 text-blue-600" />
                         <h4 className="font-medium text-blue-900">Receita para Pergunta Numérica</h4>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <Label htmlFor="minValue">Valor Mínimo *</Label>
                           <Input 
                             id="minValue"
                             type="number"
                             placeholder="Ex: 114 (10% menos que 127)"
                             value={minValue}
                             onChange={(e) => setMinValue(e.target.value)}
                           />
                           <p className="text-xs text-gray-600 mt-1">
                             Valor mínimo aceitável (ex: 10% abaixo do valor esperado)
                           </p>
                         </div>
                         <div>
                           <Label htmlFor="maxValue">Valor Máximo *</Label>
                           <Input 
                             id="maxValue"
                             type="number"
                             placeholder="Ex: 140 (10% mais que 127)"
                             value={maxValue}
                             onChange={(e) => setMaxValue(e.target.value)}
                           />
                           <p className="text-xs text-gray-600 mt-1">
                             Valor máximo aceitável (ex: 10% acima do valor esperado)
                           </p>
                         </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <Label htmlFor="expectedValue">Valor Esperado</Label>
                           <Input 
                             id="expectedValue"
                             type="number"
                             placeholder="Ex: 127"
                             value={expectedValue}
                             onChange={(e) => setExpectedValue(e.target.value)}
                           />
                           <p className="text-xs text-gray-600 mt-1">
                             Valor ideal (opcional)
                           </p>
                         </div>
                         <div>
                           <Label htmlFor="unit">Unidade</Label>
                           <Input 
                             id="unit"
                             placeholder="Ex: V, A, mm, etc."
                             value={unit}
                             onChange={(e) => setUnit(e.target.value)}
                           />
                           <p className="text-xs text-gray-600 mt-1">
                             Unidade de medida
                           </p>
                         </div>
                       </div>

                       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                         <div className="flex items-start space-x-2">
                           <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                           <div className="text-sm text-yellow-800">
                             <p className="font-medium">Como funciona:</p>
                             <p>Durante a inspeção, se o valor medido estiver fora do intervalo definido (min/max), o sistema automaticamente considerará como defeito do tipo selecionado acima.</p>
                           </div>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               </>
             )}
          </div>

          <DialogFooter className="flex-shrink-0 bg-white border-t pt-4 sticky bottom-0">
            <div className="flex justify-between w-full gap-4">
              <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={addQuestion}
                disabled={
                  !newQuestion.trim() || 
                  (hasRecipe && newQuestionType !== 'number' && !recipeName.trim()) ||
                  (hasRecipe && newQuestionType === 'number' && (!minValue.trim() || !maxValue.trim()))
                }
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Pergunta
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar Pergunta */}
      <Dialog open={showQuestionDialog} onOpenChange={() => setShowQuestionDialog(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col" aria-describedby="add-question-description">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Adicionar Pergunta</span>
            </DialogTitle>
            <DialogDescription id="add-question-description">
              Configure uma nova pergunta para a etapa selecionada
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-6 p-4 pb-24">
                {/* Conteúdo do modal de pergunta aqui */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="questionText">Pergunta *</Label>
                    <Input
                      id="questionText"
                      placeholder="Digite a pergunta..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      tabIndex={1}
                    />
                  </div>

                  <div>
                    <Label htmlFor="questionType">Tipo de Pergunta *</Label>
                    <Select value={newQuestionType} onValueChange={(value: QuestionType) => setNewQuestionType(value)}>
                      <SelectTrigger tabIndex={2}>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(questionTypeConfig).map(([key, type]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center space-x-2">
                              {type.icon}
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="questionDescription">Descrição (opcional)</Label>
                    <Textarea
                      id="questionDescription"
                      placeholder="Descrição adicional da pergunta..."
                      value={questionDescription}
                      onChange={(e) => setQuestionDescription(e.target.value)}
                      rows={2}
                      tabIndex={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="questionRequired"
                      checked={questionRequired}
                      onCheckedChange={(checked) => setQuestionRequired(checked as boolean)}
                      tabIndex={4}
                    />
                    <Label htmlFor="questionRequired">Pergunta obrigatória</Label>
                  </div>

                  <div>
                    <Label htmlFor="defectType">Tipo de Defeito</Label>
                    <Select value={newQuestionDefectType} onValueChange={(value: DefectType) => setNewQuestionDefectType(value)}>
                      <SelectTrigger tabIndex={5}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MENOR">Menor</SelectItem>
                        <SelectItem value="MAIOR">Maior</SelectItem>
                        <SelectItem value="CRÍTICO">Crítico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="flex-shrink-0 bg-white border-t pt-4 sticky bottom-0 z-20">
            <div className="flex justify-between w-full gap-4">
              <Button variant="outline" onClick={() => setShowQuestionDialog(false)} tabIndex={100}>
                Cancelar
              </Button>
              <Button 
                onClick={addQuestion}
                disabled={
                  !newQuestion.trim() || 
                  (hasRecipe && newQuestionType !== 'number' && !recipeName.trim()) ||
                  (hasRecipe && newQuestionType === 'number' && (!minValue.trim() || !maxValue.trim()))
                }
                className="bg-green-600 hover:bg-green-700"
                tabIndex={101}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Pergunta
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Portal para o dropdown de produtos */}
      {showProductSuggestions && typeof window !== 'undefined' && createPortal(
        <div 
          className="product-suggestions-positioned"
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 999999999
          }}
        >
          {/* Produtos da lista */}
          {filteredProducts.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2 px-2">Produtos cadastrados:</div>
              {filteredProducts.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="product-item px-3 py-2 hover:bg-gray-100 cursor-pointer rounded-md text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    selectProduct(product.id);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div className="font-medium">{product.description}</div>
                  <div className="text-xs text-gray-500">Código: {product.code}</div>
                </div>
              ))}
            </div>
          )}
          
          {/* Opção para usar nome customizado */}
          {customProductName.trim() && (
            <div className="border-t border-gray-200 p-2">
              <div className="text-xs font-medium text-gray-500 mb-2 px-2">Usar nome customizado:</div>
              <div
                className="product-item px-3 py-2 hover:bg-blue-50 cursor-pointer rounded-md text-sm border-l-2 border-blue-500 bg-blue-50"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  useCustomProductName();
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="font-medium text-blue-700">
                  "{customProductName.trim()}"
                </div>
                <div className="text-xs text-blue-600">Criar plano para este produto</div>
              </div>
            </div>
          )}
          
          {/* Mensagem quando não há resultados */}
          {filteredProducts.length === 0 && !customProductName.trim() && (
            <div className="p-3 text-center text-gray-500 text-sm">
              Nenhum produto encontrado. Digite para criar um produto customizado.
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}