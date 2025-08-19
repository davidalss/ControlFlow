import React, { useState, useEffect } from 'react';
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
  };

  // Função para usar nome customizado do produto
  const useCustomProductName = () => {
    if (customProductName.trim()) {
      setSelectedProduct('custom');
      setProductSearchTerm(customProductName.trim());
      setShowProductSuggestions(false);
    }
  };

  // Função para lidar com mudança no campo de busca de produto
  const handleProductSearchChange = (value: string) => {
    setProductSearchTerm(value);
    setCustomProductName(value);
    setShowProductSuggestions(value.length > 0);
    
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
  };

  // Função para adicionar pergunta
  const addQuestion = () => {
    if (!newQuestion.trim() || !selectedStepForQuestion) return;

    const question: InspectionField = {
      id: `question-${Date.now()}`,
      name: newQuestion.trim(),
      type: 'question',
      required: questionRequired,
             questionConfig: {
         questionType: newQuestionType,
         defectType: newQuestionDefectType,
         description: questionDescription.trim() || undefined,
         options: questionTypeConfig[newQuestionType].hasOptions ? questionOptions.map(opt => opt.text) : undefined
       }
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
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col inspection-plan-form">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Novo Plano de Inspeção</span>
            </DialogTitle>
            <DialogDescription>
              Crie um novo plano de inspeção de qualidade de forma simples e organizada.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                <TabsTrigger value="steps">Etapas</TabsTrigger>
                <TabsTrigger value="questions">Perguntas</TabsTrigger>
              </TabsList>

              {/* Aba Informações Básicas */}
              <TabsContent value="basic" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pb-4">
                  <div className="space-y-6 p-4">
                    {/* Informações do Plano */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <FileText className="w-5 h-5" />
                          <span>Informações do Plano</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Nome do Plano *</Label>
                            <Input 
                              id="name" 
                              placeholder="Ex: Plano de Inspeção - Air Fryer" 
                              value={planName}
                              onChange={(e) => setPlanName(e.target.value)}
                            />
                          </div>
                          <div className="relative product-field">
                            <Label htmlFor="product">Produto *</Label>
                            <div className="relative product-input-container">
                              <Input
                                id="product"
                                placeholder="Digite o nome do produto ou selecione da lista"
                                value={productSearchTerm}
                                onChange={(e) => handleProductSearchChange(e.target.value)}
                                onFocus={() => setShowProductSuggestions(productSearchTerm.length > 0)}
                                onBlur={() => setTimeout(() => setShowProductSuggestions(false), 300)}
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
                            
                            {/* Sugestões de produtos */}
                            {showProductSuggestions && (
                              <div className="product-suggestions">
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
                                  <div className="p-3 text-sm text-gray-500 text-center">
                                    Nenhum produto encontrado. Digite o nome do produto desejado.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="description">Descrição</Label>
                          <Textarea 
                            id="description" 
                            placeholder="Descreva o objetivo e escopo do plano de inspeção"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="validity">Data de Validade</Label>
                            <Input 
                              id="validity" 
                              type="date" 
                              value={validUntil}
                              onChange={(e) => setValidUntil(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="tags">Tags</Label>
                            <div className="space-y-2">
                              <div className="flex space-x-2">
                                <Input 
                                  id="tags" 
                                  placeholder="Adicionar tag" 
                                  value={currentTag}
                                  onChange={(e) => setCurrentTag(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                />
                                <Button size="sm" onClick={addTag}>
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                                    {tag} <XCircle className="w-3 h-3 ml-1" />
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Informações sobre Defeitos */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Target className="w-5 h-5" />
                          <span>Classificação de Defeitos</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <Info className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-900">Como funciona a classificação de defeitos</span>
                          </div>
                          <div className="space-y-2 text-sm text-blue-700">
                            <p>• <strong>MENOR:</strong> Defeitos que não afetam a funcionalidade (ex: pequenos riscos na embalagem)</p>
                            <p>• <strong>MAIOR:</strong> Defeitos que podem afetar a funcionalidade (ex: etiqueta incorreta)</p>
                            <p>• <strong>CRÍTICO:</strong> Defeitos que comprometem a segurança ou funcionalidade (ex: produto danificado)</p>
                            <p className="mt-3 font-medium">Durante a inspeção, o sistema calculará automaticamente os limites de aceitação baseados no tamanho do lote e nível de inspeção selecionados.</p>
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
                  <div className="space-y-6 p-4">
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
                  <div className="space-y-6 p-4">
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

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600"
              onClick={handleSave}
              disabled={!canSubmit}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Adicionar Pergunta */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Adicionar Nova Pergunta</span>
            </DialogTitle>
            <DialogDescription>
              Configure a nova pergunta para a etapa selecionada.
            </DialogDescription>
          </DialogHeader>

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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={addQuestion}
              disabled={!newQuestion.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Pergunta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}