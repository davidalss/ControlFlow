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
  Hash,
  Download,
  X
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

import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/use-products-supabase';
import { useInspectionPlans, type InspectionPlan, type InspectionStep, type InspectionField, type DefectType, DEFAULT_GRAPHIC_INSPECTION_STEP } from '@/hooks/use-inspection-plans-simple';
import '@/styles/inspection-plan-fixes.css';
import { useAuth } from '../../hooks/use-auth';

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
  | 'checklist'
  | 'etiqueta';

interface QuestionOption {
  id: string;
  text: string;
}

interface NewInspectionPlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: Omit<InspectionPlan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  plan?: InspectionPlan | null;
  preSelectedProduct?: {
    id?: string;
    code?: string;
    name?: string;
  } | null;
}

export default function NewInspectionPlanForm({
  isOpen,
  onClose,
  onSave,
  plan,
  preSelectedProduct
}: NewInspectionPlanFormProps) {
  const { toast } = useToast();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { user } = useAuth();

  // Estados principais - MOVIDOS PARA ANTES DO useEffect
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
  
  // Novos campos adicionados
  const [planStatus, setPlanStatus] = useState('draft');
  const [voltage, setVoltage] = useState('127V');

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

  // Carregar dados do plano quando estiver editando
  useEffect(() => {
    if (plan && isOpen) {
      console.log('🔍 Carregando dados do plano para edição:', plan);
      
      // Carregar dados básicos
      setPlanName(plan.planName || '');
      setDescription(plan.observations || '');
      setPlanStatus(plan.status || 'draft');
      
      // Carregar dados do produto
      if (plan.productId) {
        setSelectedProduct(plan.productId);
        setProductSearchTerm(plan.productName || '');
      }
      
      // Carregar voltagem
      try {
        const voltageConfig = plan.voltageConfiguration ? JSON.parse(plan.voltageConfiguration) : {};
        setVoltage(voltageConfig.voltage || '127V');
      } catch (error) {
        console.error('Erro ao parsear configuração de voltagem:', error);
        setVoltage('127V');
      }
      
      // Carregar etapas
      try {
        const stepsData = plan.inspectionSteps ? JSON.parse(plan.inspectionSteps) : [DEFAULT_GRAPHIC_INSPECTION_STEP];
        setSteps(stepsData);
        console.log('🔍 Etapas carregadas:', stepsData);
      } catch (error) {
        console.error('Erro ao parsear etapas:', error);
        setSteps([DEFAULT_GRAPHIC_INSPECTION_STEP]);
      }
    } else if (!plan && isOpen) {
      // Resetar formulário para criação
      resetForm();
    }
  }, [plan, isOpen]);

  // Aplicar produto pré-selecionado quando disponível
  useEffect(() => {
    if (preSelectedProduct && isOpen && !plan) {
      console.log('🔍 Aplicando produto pré-selecionado:', preSelectedProduct);
      
      if (preSelectedProduct.id) {
        setSelectedProduct(preSelectedProduct.id);
      }
      
      if (preSelectedProduct.name) {
        setProductSearchTerm(preSelectedProduct.name);
        setCustomProductName(preSelectedProduct.name);
      }
      
      // Gerar nome do plano automaticamente
      if (preSelectedProduct.name) {
        setPlanName(`Plano de Inspeção - ${preSelectedProduct.name}`);
      }
    }
  }, [preSelectedProduct, isOpen, plan]);
  
  // Estados para etapas
  const [steps, setSteps] = useState<InspectionStep[]>([DEFAULT_GRAPHIC_INSPECTION_STEP]);
  const [newStepName, setNewStepName] = useState('');
  const [newStepDescription, setNewStepDescription] = useState('');
  
  // Estados para perguntas
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string>('');
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

  // Estados para pergunta ETIQUETA
  const [etiquetaReferenceFile, setEtiquetaReferenceFile] = useState<File | null>(null);
  const [etiquetaApprovalLimit, setEtiquetaApprovalLimit] = useState('0.9');
  const [etiquetaPreviewImage, setEtiquetaPreviewImage] = useState<string | null>(null);
  
  // Estados para modal de visualização de etiqueta
  const [showEtiquetaModal, setShowEtiquetaModal] = useState(false);
  const [etiquetaModalImage, setEtiquetaModalImage] = useState<string | null>(null);
  const [etiquetaModalFileName, setEtiquetaModalFileName] = useState<string>('');

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
    },
    etiqueta: {
      label: 'Etiqueta',
      icon: <Tag className="w-4 h-4" />,
      description: 'Comparação de etiqueta com imagem de referência',
      hasOptions: false
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
  const filteredProducts = (products || []).filter(product =>
    product.description.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  // Debug: Log dos produtos carregados - REMOVIDO PARA REDUZIR SPAM

  // Função para selecionar produto da lista
  const selectProduct = (productId: string) => {
    setSelectedProduct(productId);
    const product = (products || []).find(p => p.id === productId);
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
    setIsEditingQuestion(false);
    setEditingQuestionId('');
    setShowQuestionDialog(true);
    resetQuestionForm();
  };

  // Função para abrir modal de visualização de etiqueta
  const openEtiquetaModal = (file: File) => {
    if (file.type && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setEtiquetaModalImage(url);
      setEtiquetaModalFileName(file.name);
      setShowEtiquetaModal(true);
    } else {
      // Para PDF, mostrar mensagem
      toast({
        title: "Visualização",
        description: "Para visualizar PDFs, faça o download do arquivo",
        variant: "default"
      });
    }
  };

  // Função para fechar modal de etiqueta
  const closeEtiquetaModal = () => {
    setShowEtiquetaModal(false);
    if (etiquetaModalImage) {
      URL.revokeObjectURL(etiquetaModalImage);
      setEtiquetaModalImage(null);
    }
    setEtiquetaModalFileName('');
  };

  // Função para editar pergunta existente
  const editQuestion = (stepId: string, question: InspectionField) => {
    setSelectedStepForQuestion(stepId);
    setIsEditingQuestion(true);
    setEditingQuestionId(question.id);
    setShowQuestionDialog(true);
    
    // Preencher formulário com dados da pergunta
    setNewQuestion(question.name);
    setNewQuestionType(question.questionConfig?.questionType || 'ok_nok');
    setNewQuestionDefectType(question.questionConfig?.defectType || 'MAIOR');
    setQuestionRequired(question.required);
    setQuestionDescription(question.questionConfig?.description || '');
    
    // Preencher opções se existirem
    if (question.questionConfig?.options) {
      setQuestionOptions(question.questionConfig.options.map((opt, index) => ({
        id: `option-${index}`,
        text: opt
      })));
    }
    
    // Preencher configurações específicas
    if (question.questionConfig?.questionType === 'number' && question.questionConfig?.numericConfig) {
      setHasRecipe(true);
      setMinValue(question.questionConfig.numericConfig.minValue?.toString() || '');
      setMaxValue(question.questionConfig.numericConfig.maxValue?.toString() || '');
      setExpectedValue(question.questionConfig.numericConfig.expectedValue?.toString() || '');
      setUnit(question.questionConfig.numericConfig.unit || '');
    }
    
    // Preencher configurações de etiqueta
    if (question.questionConfig?.questionType === 'etiqueta' && question.questionConfig?.etiquetaConfig) {
      setEtiquetaReferenceFile(question.questionConfig.etiquetaConfig.referenceFile as any);
      setEtiquetaApprovalLimit(question.questionConfig.etiquetaConfig.approvalLimit?.toString() || '0.9');
    }
    
    // Preencher receita se existir
    if (question.recipe) {
      setHasRecipe(true);
      setRecipeName(question.recipe.name || '');
      setRecipeDescription(question.recipe.description || '');
      setRecipeSteps(question.recipe.steps || []);
    }
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

    // Resetar configurações de ETIQUETA
    setEtiquetaReferenceFile(null);
    setEtiquetaApprovalLimit('0.9');
    if (etiquetaPreviewImage) {
      URL.revokeObjectURL(etiquetaPreviewImage);
      setEtiquetaPreviewImage(null);
    }
  };

  // Função para adicionar/editar pergunta
  const addQuestion = () => {
    if (!newQuestion.trim() || !selectedStepForQuestion) return;

    console.log('🔍 ' + (isEditingQuestion ? 'Editando' : 'Adicionando') + ' pergunta:', {
      question: newQuestion.trim(),
      stepId: selectedStepForQuestion,
      type: newQuestionType,
      required: questionRequired,
      isEditing: isEditingQuestion
    });

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

    // Validação para pergunta ETIQUETA
    if (newQuestionType === 'etiqueta') {
      if (!etiquetaReferenceFile) {
        toast({
          title: "Erro",
          description: "Para perguntas do tipo ETIQUETA, o arquivo de referência (PDF ou imagem) é obrigatório",
          variant: "destructive"
        });
        return;
      }
    }

    const question: InspectionField = {
      id: isEditingQuestion ? editingQuestionId : `question-${Date.now()}`,
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
        } : undefined,
        // Adicionar configuração específica para ETIQUETA
        etiquetaConfig: newQuestionType === 'etiqueta' ? {
          referenceFile: etiquetaReferenceFile,
          approvalLimit: parseFloat(etiquetaApprovalLimit)
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

    console.log('🔍 Pergunta criada:', question);

    // Adicionar ou atualizar pergunta na etapa selecionada
    setSteps(prev => {
      const newSteps = prev.map(step => {
        if (step.id === selectedStepForQuestion) {
          console.log('🔍 ' + (isEditingQuestion ? 'Atualizando' : 'Adicionando') + ' pergunta à etapa:', step.name);
          
          if (isEditingQuestion) {
            // Atualizar pergunta existente
            return {
              ...step,
              questions: step.questions.map(q => 
                q.id === editingQuestionId ? question : q
              )
            };
          } else {
            // Adicionar nova pergunta
            return {
              ...step,
              questions: [...step.questions, question]
            };
          }
        }
        return step;
      });
      
      console.log('🔍 Etapas atualizadas:', newSteps);
      return newSteps;
    });

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
      productId = `custom_${Date.now()}`; // Temporary ID for custom products
    } else {
      const selectedProductData = (products || []).find(p => p.id === selectedProduct);
      productName = selectedProductData?.description || '';
    }

    // Verificar se já existe um plano para este produto (apenas para produtos da lista)
    if (selectedProduct !== 'custom' && selectedProduct) {
      try {
        const existingPlansResponse = await fetch(`/api/inspection-plans/product/${selectedProduct}`);
        if (existingPlansResponse.ok) {
          const existingPlans = await existingPlansResponse.json();
          if (existingPlans.length > 0) {
            toast({
              title: "Produto já possui plano",
              description: `Já existe um plano de inspeção para o produto "${productName}". Cada produto pode ter apenas um plano.`,
              variant: "destructive"
            });
            return;
          }
        }
      } catch (error) {
        console.error('Erro ao verificar planos existentes:', error);
        // Continuar mesmo se a verificação falhar
      }
    }

    // Preparar steps para o formato correto
    const formattedSteps = steps.map(step => ({
      id: step.id,
      name: step.name,
      description: step.description,
      order: step.order,
      estimatedTime: step.estimatedTime,
      questions: step.questions || [],
      defectType: step.defectType
    }));

    // Preparar checklists baseado nos steps
    const formattedChecklists = steps.flatMap(step => 
      (step.questions || []).map(q => ({
        id: q.id,
        stepId: step.id,
        title: q.name,
        name: q.name,
        description: q.name,
        required: q.required,
        type: q.questionConfig?.questionType || 'ok_nok',
        photoRequired: q.questionConfig?.questionType === 'etiqueta' || false
      }))
    );

    // Preparar parâmetros obrigatórios
    const formattedParameters = steps.flatMap(step =>
      (step.questions || []).filter(q => q.questionConfig?.questionType === 'number' || q.questionConfig?.questionType === 'text')
    );

    console.log('🔍 Etapas formatadas:', formattedSteps);
    console.log('🔍 Checklists formatados:', formattedChecklists);
    console.log('🔍 Parâmetros formatados:', formattedParameters);

    const planData: Omit<InspectionPlan, 'id' | 'createdAt' | 'updatedAt'> = {
      planCode: `PLAN-${Date.now()}`,
      planName: planName.trim(),
      planType: 'product',
      version: '1.0',
      status: planStatus as 'draft' | 'active' | 'inactive',
      productId: productId,
      productCode: selectedProduct === 'custom' ? `CUSTOM-${Date.now()}` : (products || []).find(p => p.id === selectedProduct)?.code || '',
      productName: productName,
      productFamily: selectedProduct === 'custom' ? 'Custom' : 'Default',
      businessUnit: 'N/A',
      linkedProducts: [productId], // Changed from JSON.stringify([productId])
      voltageConfiguration: JSON.stringify({ voltage: voltage }),
      inspectionType: 'mixed',
      aqlCritical: 0.065,
      aqlMajor: 1.0,
      aqlMinor: 2.5,
      samplingMethod: 'standard',
      inspectionLevel: 'II',
      inspectionSteps: JSON.stringify(formattedSteps), // Now correctly formatted
      checklists: JSON.stringify(formattedChecklists), // Now contains actual data
      requiredParameters: JSON.stringify(formattedParameters), // Now contains actual data
      questionsByVoltage: JSON.stringify({}), // Now correctly stringified
      labelsByVoltage: JSON.stringify({}), // Now correctly stringified
      isActive: true,
      createdBy: user?.id || 'd85610ef-6430-4493-9ae2-8db20aa26d4e' // Use actual user ID
    };

    console.log('🔍 Dados do plano sendo enviados:', planData);

    try {
      // Primeiro, salvar o plano de inspeção
      await onSave(planData);
      
      // Nota: As perguntas de etiqueta serão processadas em uma chamada separada
      // já que onSave retorna void e não temos acesso ao ID do plano criado
      
      toast({
        title: "Sucesso",
        description: "Plano de inspeção criado com sucesso!",
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar plano de inspeção. Tente novamente.",
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
    setPlanStatus('draft');
    setVoltage('127V');
  };

  // Função para fechar modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canSubmit = selectedProduct && planName.trim();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full flex flex-col z-10 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <h2 className="text-lg font-semibold text-black">Novo Plano de Inspeção</h2>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="px-4 pb-4 text-gray-600 text-sm flex-shrink-0">
              Crie um novo plano de inspeção de qualidade de forma simples e organizada.
            </p>

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
                          <Label htmlFor="voltage">Voltagem</Label>
                          <Select value={voltage} onValueChange={setVoltage}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a voltagem" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="127V">127V</SelectItem>
                              <SelectItem value="220V">220V</SelectItem>
                              <SelectItem value="12V">12V</SelectItem>
                              <SelectItem value="24V">24V</SelectItem>
                              <SelectItem value="BIVOLT">BIVOLT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="status">Status do Plano</Label>
                          <Select value={planStatus} onValueChange={setPlanStatus}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Rascunho</SelectItem>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="inactive">Inativo</SelectItem>
                            </SelectContent>
                          </Select>
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
                                     <div className="flex items-center space-x-2">
                                       <Button
                                         variant="ghost"
                                         size="sm"
                                         onClick={() => editQuestion(step.id, question)}
                                         className="text-blue-600 hover:text-blue-700"
                                       >
                                         <Edit className="w-4 h-4" />
                                       </Button>
                                       <Button
                                         variant="ghost"
                                         size="sm"
                                         onClick={() => removeQuestion(step.id, question.id)}
                                         className="text-red-600 hover:text-red-700"
                                       >
                                         <Trash2 className="w-4 h-4" />
                                       </Button>
                                     </div>
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

            <div className="flex justify-end space-x-3 p-4 border-t flex-shrink-0">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!canSubmit}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Plano
              </Button>
            </div>
          </div>
        </div>
      )}

             {/* Modal de Nova Pergunta */}
       {showQuestionDialog && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowQuestionDialog(false)}></div>
           <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] z-10 overflow-hidden">
                         <div className="flex items-center justify-between p-4 border-b">
               <div>
                 <h2 className="text-lg font-semibold text-black">
                   {isEditingQuestion ? 'Editar Pergunta' : 'Nova Pergunta'}
                 </h2>
                 <p className="text-sm text-gray-600">
                   {isEditingQuestion 
                     ? 'Edite a pergunta selecionada' 
                     : 'Configure uma nova pergunta para a etapa selecionada'
                   }
                 </p>
               </div>
              <button
                onClick={() => setShowQuestionDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          
                                             <div className="space-y-4 p-4 overflow-y-auto max-h-[60vh]">
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

            {/* Configurações específicas para pergunta ETIQUETA */}
            {newQuestionType === 'etiqueta' && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center space-x-2 mb-3">
                    <Tag className="w-5 h-5 text-blue-600" />
                    <Label className="text-blue-800 font-medium">Configuração de Etiqueta</Label>
                  </div>
                  
                  <div className="space-y-4">
                                         <div>
                       <Label htmlFor="referenceFile">Arquivo de Referência (Etiqueta MÃE) *</Label>
                       <div className="mt-1 flex space-x-2">
                         <div className="flex-1">
                           <Input
                             id="referenceFile"
                             type="file"
                             accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                             onChange={(e) => {
                               const file = e.target.files?.[0];
                               if (file) {
                                 // Validar tipo de arquivo
                                 const allowedTypes = [
                                   'application/pdf',
                                   'image/jpeg',
                                   'image/jpg',
                                   'image/png',
                                   'image/gif',
                                   'image/bmp',
                                   'image/webp'
                                 ];
                                 
                                 if (allowedTypes.includes(file.type)) {
                                   setEtiquetaReferenceFile(file);
                                   
                                                                    // Se for uma imagem, criar preview
                                 if (file.type && file.type.startsWith('image/')) {
                                   const url = URL.createObjectURL(file);
                                   setEtiquetaPreviewImage(url);
                                 } else {
                                   // Se for PDF, limpar preview
                                   setEtiquetaPreviewImage(null);
                                 }
                                 } else {
                                   toast({
                                     title: "Erro",
                                     description: "Formato de arquivo não suportado. Use PDF ou imagens (JPEG, PNG, etc.)",
                                     variant: "destructive"
                                   });
                                 }
                               }
                             }}
                           />
                         </div>
                         {etiquetaReferenceFile && (
                           <Button
                             type="button"
                             variant="outline"
                             size="sm"
                             onClick={() => openEtiquetaModal(etiquetaReferenceFile)}
                             className="flex items-center space-x-1"
                           >
                             <Eye className="w-4 h-4" />
                             <span>Ver</span>
                           </Button>
                         )}
                       </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Selecione o PDF ou imagem da etiqueta correta para comparação
                      </p>
                      
                      {/* Preview da imagem */}
                      {etiquetaPreviewImage && (
                        <div className="mt-4">
                          <Label className="text-sm font-medium">Preview da Imagem:</Label>
                          <div className="mt-2 max-w-xs">
                            <img
                              src={etiquetaPreviewImage}
                              alt="Preview da etiqueta de referência"
                              className="w-full h-auto rounded-md border"
                            />
                          </div>
                        </div>
                      )}
                      
                      {etiquetaReferenceFile && (
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="text-sm text-green-600">
                            ✓ Arquivo selecionado: {etiquetaReferenceFile.name} 
                            ({etiquetaReferenceFile.type && etiquetaReferenceFile.type.startsWith('image/') ? 'Imagem' : 'PDF'})
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="approvalLimit">Limite de Aprovação (%) *</Label>
                      <div className="mt-1">
                        <Select value={etiquetaApprovalLimit} onValueChange={setEtiquetaApprovalLimit}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.7">70% - Baixo</SelectItem>
                            <SelectItem value="0.8">80% - Médio</SelectItem>
                            <SelectItem value="0.9">90% - Alto (Recomendado)</SelectItem>
                            <SelectItem value="0.95">95% - Muito Alto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Percentual mínimo de similaridade para aprovação da etiqueta
                      </p>
                    </div>
                  </div>
                </div>
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

                      <div className="flex justify-end space-x-3 p-4 border-t">
              <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
                Cancelar
              </Button>
                             <Button onClick={addQuestion} disabled={!newQuestion.trim()}>
                 {isEditingQuestion ? (
                   <>
                     <Save className="w-4 h-4 mr-2" />
                     Salvar Alterações
                   </>
                 ) : (
                   <>
                     <Plus className="w-4 h-4 mr-2" />
                     Adicionar Pergunta
                   </>
                 )}
               </Button>
            </div>
          </div>
        </div>
      )}

               {/* Portal para o dropdown de produtos */}
        {showProductSuggestions && typeof document !== 'undefined' && createPortal(
          <div
            style={{
              position: 'absolute',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              zIndex: 999999,
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

       {/* Modal de Visualização de Etiqueta */}
       {showEtiquetaModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="fixed inset-0 bg-black bg-opacity-75" onClick={closeEtiquetaModal}></div>
           <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] z-10 overflow-hidden">
             <div className="flex items-center justify-between p-4 border-b">
               <div>
                 <h2 className="text-lg font-semibold text-black">Visualizar Etiqueta</h2>
                 <p className="text-sm text-gray-600">{etiquetaModalFileName}</p>
               </div>
               <div className="flex items-center space-x-2">
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => {
                     if (etiquetaModalImage) {
                       const link = document.createElement('a');
                       link.href = etiquetaModalImage;
                       link.download = etiquetaModalFileName;
                       link.click();
                     }
                   }}
                 >
                   <Download className="w-4 h-4 mr-1" />
                   Download
                 </Button>
                 <button
                   onClick={closeEtiquetaModal}
                   className="text-gray-500 hover:text-gray-700"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>
             </div>
             
             <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
               {etiquetaModalImage && (
                 <div className="flex justify-center">
                   <img
                     src={etiquetaModalImage}
                     alt="Etiqueta de referência"
                     className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                     style={{ cursor: 'zoom-in' }}
                     onClick={() => {
                       // Implementar zoom se necessário
                       console.log('Zoom na imagem');
                     }}
                   />
                 </div>
               )}
             </div>
           </div>
         </div>
       )}
       </>
     );
  }