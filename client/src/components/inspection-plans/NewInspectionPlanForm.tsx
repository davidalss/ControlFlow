import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { useInspectionPlans, type InspectionPlan, type InspectionStep, type InspectionField, type DefectType, DEFAULT_GRAPHIC_INSPECTION_STEP } from '@/hooks/use-inspection-plans-simple';
import '@/styles/inspection-plan-fixes.css';

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

  // Função para calcular posição do dropdown
  const updateDropdownPosition = useCallback(() => {
    if (productInputRef.current) {
      const rect = productInputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, []);

  // Recalcular posição do dropdown quando a janela for redimensionada
  useEffect(() => {
    const handleResize = () => {
      if (showProductSuggestions) {
        updateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showProductSuggestions, updateDropdownPosition]);
  
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
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [expectedValue, setExpectedValue] = useState('');
  const [unit, setUnit] = useState('');

  // Configuração dos tipos de pergunta
  const questionTypeConfig = {
    true_false: {
      label: 'Verdadeiro/Falso',
      icon: <CheckSquare className="w-4 h-4" />,
      description: 'Pergunta com resposta verdadeiro ou falso',
      hasOptions: false
    },
    multiple_choice: {
      label: 'Múltipla Escolha',
      icon: <List className="w-4 h-4" />,
      description: 'Pergunta com múltiplas opções de resposta',
      hasOptions: true
    },
    ok_nok: {
      label: 'OK/NOK',
      icon: <CheckCircle className="w-4 h-4" />,
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

  // Função para lidar com focus no input
  const handleInputFocus = () => {
    if (productSearchTerm.length > 0) {
      setShowProductSuggestions(true);
      setTimeout(updateDropdownPosition, 0);
    }
  };

  // Função para lidar com blur no input
  const handleInputBlur = () => {
    setTimeout(() => setShowProductSuggestions(false), 300);
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

  // Função para lidar com mudança no campo de busca de produto
  const handleProductSearchChange = (value: string) => {
    setProductSearchTerm(value);
    setCustomProductName(value);
    setShowProductSuggestions(value.length > 0);
    
    // Atualizar posição do dropdown
    if (value.length > 0) {
      setTimeout(updateDropdownPosition, 0);
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col relative">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Novo Plano de Inspeção</span>
          </DialogTitle>
          <DialogDescription>
            Crie um novo plano de inspeção de qualidade de forma simples e organizada.
          </DialogDescription>
        </DialogHeader>

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
                          />
                        </div>
                        <div className="relative product-suggestions-container">
                          <Label htmlFor="product">Produto *</Label>
                          <div className="relative">
                            <Input
                              ref={productInputRef}
                              id="product"
                              placeholder="Digite o nome do produto ou selecione da lista"
                              value={productSearchTerm}
                              onChange={(e) => handleProductSearchChange(e.target.value)}
                              onFocus={handleInputFocus}
                              onBlur={handleInputBlur}
                              className="pr-10"
                            />
                            {selectedProduct && selectedProduct !== 'custom' && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </div>
                            )}
                            {selectedProduct === 'custom' && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Tag className="w-4 h-4 text-blue-500" />
                              </div>
                            )}
                          </div>
                          
                          {/* Dropdown de produtos será renderizado via portal */}
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
                          />
                        </div>
                        <div>
                          <Label>Tags</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                                <span>{tag}</span>
                                <button
                                  onClick={() => removeTag(tag)}
                                  className="ml-1 hover:text-red-500"
                                >
                                  <XCircle className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex space-x-2 mt-2">
                            <Input
                              placeholder="Adicionar tag"
                              value={currentTag}
                              onChange={(e) => setCurrentTag(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addTag()}
                            />
                            <Button onClick={addTag} size="sm">
                              <Plus className="w-4 h-4" />
                            </Button>
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
                        <Target className="w-5 h-5" />
                        <span>Etapas de Inspeção</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Lista de etapas */}
                      <div className="space-y-3">
                        {steps.map((step, index) => (
                          <div key={step.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{step.name}</h4>
                              <p className="text-sm text-gray-600">{step.description}</p>
                            </div>
                            <Badge variant="outline">{step.estimatedTime} min</Badge>
                            {step.id !== DEFAULT_GRAPHIC_INSPECTION_STEP.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStep(step.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Adicionar nova etapa */}
                      <Separator />
                      <div className="space-y-4">
                        <h4 className="font-medium">Adicionar Nova Etapa</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="newStepName">Nome da Etapa *</Label>
                            <Input
                              id="newStepName"
                              placeholder="Ex: Inspeção Visual"
                              value={newStepName}
                              onChange={(e) => setNewStepName(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="newStepDescription">Descrição</Label>
                            <Input
                              id="newStepDescription"
                              placeholder="Descreva o que será verificado nesta etapa"
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
                        <span>Perguntas de Inspeção</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Lista de etapas com perguntas */}
                      <div className="space-y-6">
                        {steps.map((step) => (
                          <div key={step.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium">{step.name}</h4>
                              <Button
                                onClick={() => openQuestionDialog(step.id)}
                                size="sm"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Pergunta
                              </Button>
                            </div>
                            
                            {step.questions.length === 0 ? (
                              <p className="text-gray-500 text-sm">Nenhuma pergunta adicionada</p>
                            ) : (
                              <div className="space-y-2">
                                {step.questions.map((question) => (
                                  <div key={question.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div>
                                      <p className="font-medium">{question.name}</p>
                                      <p className="text-sm text-gray-600">
                                        Tipo: {questionTypeConfig[question.questionConfig?.questionType || 'ok_nok'].label}
                                      </p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeQuestion(step.id, question.id)}
                                      className="text-red-600 hover:text-red-700"
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

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!canSubmit}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Plano
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Modal de Nova Pergunta */}
      <Dialog open={showQuestionDialog} onOpenChange={() => setShowQuestionDialog(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Pergunta</DialogTitle>
            <DialogDescription>
              Configure uma nova pergunta para a etapa selecionada
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="questionText">Pergunta *</Label>
              <Input
                id="questionText"
                placeholder="Digite a pergunta..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="questionDescription">Descrição (opcional)</Label>
              <Textarea
                id="questionDescription"
                placeholder="Descrição adicional da pergunta..."
                value={questionDescription}
                onChange={(e) => setQuestionDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div>
                <Label htmlFor="defectType">Tipo de Defeito</Label>
                <Select value={newQuestionDefectType} onValueChange={(value: DefectType) => setNewQuestionDefectType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRITICO">Crítico</SelectItem>
                    <SelectItem value="MAIOR">Maior</SelectItem>
                    <SelectItem value="MENOR">Menor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Opções para perguntas de múltipla escolha */}
            {questionTypeConfig[newQuestionType].hasOptions && (
              <div>
                <Label>Opções de Resposta</Label>
                <div className="space-y-2">
                  {questionOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Input
                        value={option.text}
                        onChange={(e) => {
                          setQuestionOptions(prev => 
                            prev.map(opt => 
                              opt.id === option.id ? { ...opt, text: e.target.value } : opt
                            )
                          );
                        }}
                        placeholder="Digite uma opção..."
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(option.id)}
                        className="text-red-600 hover:text-red-700"
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
                    <Button onClick={addOption} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Configurações de receita numérica */}
            {newQuestionType === 'number' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={hasRecipe}
                    onCheckedChange={setHasRecipe}
                  />
                  <Label>Configurar receita numérica</Label>
                </div>
                
                {hasRecipe && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minValue">Valor Mínimo *</Label>
                      <Input
                        id="minValue"
                        type="number"
                        placeholder="0"
                        value={minValue}
                        onChange={(e) => setMinValue(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxValue">Valor Máximo *</Label>
                      <Input
                        id="maxValue"
                        type="number"
                        placeholder="100"
                        value={maxValue}
                        onChange={(e) => setMaxValue(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expectedValue">Valor Esperado (opcional)</Label>
                      <Input
                        id="expectedValue"
                        type="number"
                        placeholder="50"
                        value={expectedValue}
                        onChange={(e) => setExpectedValue(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unidade (opcional)</Label>
                      <Input
                        id="unit"
                        placeholder="mm, kg, etc."
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Configurações de receita para outros tipos */}
            {newQuestionType !== 'number' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={hasRecipe}
                    onCheckedChange={setHasRecipe}
                  />
                  <Label>Adicionar receita de procedimento</Label>
                </div>
                
                {hasRecipe && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="recipeName">Nome da Receita</Label>
                      <Input
                        id="recipeName"
                        placeholder="Nome da receita..."
                        value={recipeName}
                        onChange={(e) => setRecipeName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="recipeDescription">Descrição da Receita</Label>
                      <Textarea
                        id="recipeDescription"
                        placeholder="Descreva o procedimento..."
                        value={recipeDescription}
                        onChange={(e) => setRecipeDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Passos da Receita</Label>
                      <div className="space-y-2">
                        {recipeSteps.map((step, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{index + 1}.</span>
                            <Input
                              value={step}
                              onChange={(e) => {
                                setRecipeSteps(prev => 
                                  prev.map((s, i) => i === index ? e.target.value : s)
                                );
                              }}
                              placeholder="Digite o passo..."
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRecipeStep(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Novo passo..."
                            value={newRecipeStep}
                            onChange={(e) => setNewRecipeStep(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addRecipeStep()}
                          />
                          <Button onClick={addRecipeStep} size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="questionRequired"
                checked={questionRequired}
                onCheckedChange={(checked) => setQuestionRequired(checked as boolean)}
              />
              <Label htmlFor="questionRequired">Pergunta obrigatória</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={addQuestion} disabled={!newQuestion.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Pergunta
            </Button>
          </DialogFooter>
                 </DialogContent>
       </Dialog>

       {/* Portal para o dropdown de produtos */}
       {showProductSuggestions && typeof document !== 'undefined' && createPortal(
         <div
           style={{
             position: 'absolute',
             top: `${dropdownPosition.top}px`,
             left: `${dropdownPosition.left}px`,
             width: `${dropdownPosition.width}px`,
             zIndex: 99999,
           }}
           className="bg-white border border-gray-200 rounded-md shadow-xl max-h-60 overflow-y-auto"
         >
           {filteredProducts.length > 0 ? (
             <>
               {filteredProducts.map((product) => (
                 <div
                   key={product.id}
                   className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                   onClick={() => selectProduct(product.id)}
                 >
                   <div className="font-medium">{product.description}</div>
                   <div className="text-sm text-gray-500">Código: {product.code}</div>
                 </div>
               ))}
               {productSearchTerm.trim() && (
                 <div
                   className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-t border-gray-200 bg-blue-50"
                   onClick={useCustomProductName}
                 >
                   <div className="font-medium text-blue-600">
                     Usar "{productSearchTerm}" como produto customizado
                   </div>
                   <div className="text-sm text-blue-500">Criar produto personalizado</div>
                 </div>
               )}
             </>
           ) : (
             <div className="px-3 py-2 text-gray-500">
               Nenhum produto encontrado
             </div>
           )}
         </div>,
         document.body
       )}
     </Dialog>
   );
 }