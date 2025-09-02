import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  SortDesc,
  X,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Save as SaveIcon,
  FileText as FileTextIcon,
  Zap as ZapIcon,
  HelpCircle as HelpCircleIcon,
  Eye as EyeIcon,
  Settings as SettingsIcon,
  Users as UsersIcon,
  Shield as ShieldIcon,
  Calendar as CalendarIcon,
  Tag as TagIcon,
  Info as InfoIcon,
  AlertCircle as AlertCircleIcon,
  Layers as LayersIcon,
  Eye as EyeIcon2,
  Search as SearchIcon,
  Zap as ZapIcon2,
  HelpCircle as HelpCircleIcon2,
  ExternalLink as ExternalLinkIcon,
  ChevronDown as ChevronDownIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Star as StarIcon,
  Target as TargetIcon,
  Award as AwardIcon,
  TrendingUp as TrendingUpIcon,
  Database as DatabaseIcon,
  Grid as GridIcon,
  List as ListIcon,
  MoreHorizontal as MoreHorizontalIcon,
  FileImage as FileImageIcon,
  Square as SquareIcon,
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon,
  RefreshCw as RefreshCwIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Image as ImageIcon,
  Copy as CopyIcon,
  Share2 as Share2Icon,
  History as HistoryIcon,
  Bell as BellIcon,
  Filter as FilterIcon,
  SortAsc as SortAscIcon,
  SortDesc as SortDescIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface NewInspectionPlanFormProps {
  onClose: () => void;
  onSave: (plan: any) => void;
  initialData?: any;
}

interface InspectionStep {
  id: string;
  name: string;
  description: string;
  order: number;
  questions: InspectionQuestion[];
}

interface InspectionQuestion {
  id: string;
  title: string;
  type: 'checkbox' | 'parameter' | 'etiqueta' | 'document' | 'photo';
  required: boolean;
  photoRequired: boolean;
  defectType: 'critical' | 'major' | 'minor';
  parameter?: {
    min?: number;
    max?: number;
    target?: number;
    unit?: string;
  };
  flowLogic?: {
    condition: string;
    action: string;
    nextQuestion?: string;
  };
}

export default function NewInspectionPlanForm({ onClose, onSave, initialData }: NewInspectionPlanFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Estados para formulário sequencial
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(4);
  
  // Estados para dados do plano
  const [planName, setPlanName] = useState(initialData?.planName || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [productId, setProductId] = useState(initialData?.productId || '');
  const [productCode, setProductCode] = useState(initialData?.productCode || '');
  const [productName, setProductName] = useState(initialData?.productName || '');
  const [planType, setPlanType] = useState(initialData?.planType || 'product');
  const [inspectionType, setInspectionType] = useState(initialData?.inspectionType || 'mixed');
  
  // Estados para etapas e perguntas
  const [steps, setSteps] = useState<InspectionStep[]>(initialData?.steps || []);
  const [currentStepData, setCurrentStepData] = useState<InspectionStep | null>(null);
  const [currentQuestionData, setCurrentQuestionData] = useState<InspectionQuestion | null>(null);
  
  // Estados para validação
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Funções de navegação
  const nextStep = () => {
    if (validateCurrentStep()) {
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

  // Validação por passo
  const validateCurrentStep = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    switch (currentStep) {
      case 1: // Informações básicas
        if (!planName.trim()) newErrors.planName = 'Nome do plano é obrigatório';
        if (!productName.trim()) newErrors.productName = 'Nome do produto é obrigatório';
        break;
      
      case 2: // Etapas
        if (steps.length === 0) newErrors.steps = 'Pelo menos uma etapa é obrigatória';
        break;
      
      case 3: // Perguntas
        const hasQuestions = steps.every(step => step.questions.length > 0);
        if (!hasQuestions) newErrors.questions = 'Cada etapa deve ter pelo menos uma pergunta';
        break;
      
      case 4: // Flow Builder
        // Validação do flow será implementada
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Funções para gerenciar etapas
  const addStep = () => {
      const newStep: InspectionStep = {
        id: `step-${Date.now()}`,
      name: `Etapa ${steps.length + 1}`,
      description: '',
        order: steps.length + 1,
      questions: []
      };
      setSteps(prev => [...prev, newStep]);
  };

  const updateStep = (stepId: string, updates: Partial<InspectionStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const removeStep = (stepId: string) => {
      setSteps(prev => prev.filter(step => step.id !== stepId));
  };

  // Funções para gerenciar perguntas
  const addQuestion = (stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    const newQuestion: InspectionQuestion = {
      id: `question-${Date.now()}`,
      title: `Pergunta ${step.questions.length + 1}`,
      type: 'checkbox',
      required: true,
      photoRequired: false,
      defectType: 'minor'
    };

    updateStep(stepId, {
      questions: [...step.questions, newQuestion]
    });
  };

  const updateQuestion = (stepId: string, questionId: string, updates: Partial<InspectionQuestion>) => {
    setSteps(prev => prev.map(step => {
      if (step.id === stepId) {
            return {
              ...step,
              questions: step.questions.map(q => 
            q.id === questionId ? { ...q, ...updates } : q
          )
        };
        }
        return step;
    }));
  };

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
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      const planData = {
        planCode: `PCG${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        planName,
        planType,
        version: 'Rev. 01',
        status: 'draft',
        productId: productId || null,
        productCode,
        productName,
        productFamily: 'Custom',
      businessUnit: 'N/A',
        inspectionType,
        samplingMethod: '100%',
      inspectionLevel: 'II',
        inspectionSteps: JSON.stringify(steps),
        checklists: JSON.stringify(steps.flatMap(step => step.questions)),
        requiredParameters: JSON.stringify([]),
        requiredPhotos: JSON.stringify([]),
        createdBy: user?.id || '550e8400-e29b-41d4-a716-446655440000',
        observations: description,
        specialInstructions: 'Plano criado via formulário sequencial',
      isActive: true,
        aqlCritical: 0,
        aqlMajor: 2.5,
        aqlMinor: 4.0,
        linkedProducts: JSON.stringify([]),
        voltageConfiguration: JSON.stringify({}),
        questionsByVoltage: JSON.stringify({}),
        labelsByVoltage: JSON.stringify({})
      };

      onSave(planData);
      toast({
        title: "Sucesso",
        description: "Plano de inspeção criado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar plano de inspeção",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar passo atual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderSteps();
      case 3:
        return renderQuestions();
      case 4:
        return renderFlowBuilder();
      default:
        return null;
    }
  };

  // Passo 1: Informações básicas
  const renderBasicInfo = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4">
                        <div>
          <Label htmlFor="planName">Nome do Plano *</Label>
                          <Input 
            id="planName"
                            value={planName}
                            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Ex: Inspeção Smartphone Galaxy S25"
            className={errors.planName ? 'border-red-500' : ''}
          />
          {errors.planName && (
            <p className="text-sm text-red-500 mt-1">{errors.planName}</p>
          )}
                      </div>

                      <div>
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea 
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o objetivo e escopo da inspeção"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
            <Label htmlFor="productName">Nome do Produto *</Label>
                          <Input 
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ex: Smartphone Galaxy S25"
              className={errors.productName ? 'border-red-500' : ''}
            />
            {errors.productName && (
              <p className="text-sm text-red-500 mt-1">{errors.productName}</p>
            )}
                        </div>

                        <div>
            <Label htmlFor="productCode">Código do Produto</Label>
            <Input
              id="productCode"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              placeholder="Ex: SM-G998B"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="planType">Tipo de Plano</Label>
            <Select value={planType} onValueChange={setPlanType}>
                            <SelectTrigger>
                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                <SelectItem value="product">Produto</SelectItem>
                <SelectItem value="process">Processo</SelectItem>
                <SelectItem value="service">Serviço</SelectItem>
                            </SelectContent>
                          </Select>
                      </div>

                        <div>
            <Label htmlFor="inspectionType">Tipo de Inspeção</Label>
            <Select value={inspectionType} onValueChange={setInspectionType}>
                            <SelectTrigger>
                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                <SelectItem value="visual">Visual</SelectItem>
                <SelectItem value="functional">Funcional</SelectItem>
                <SelectItem value="mixed">Mista</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                          </div>
                          </div>
    </motion.div>
  );

  // Passo 2: Etapas
  const renderSteps = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Etapas de Inspeção</h3>
        <Button onClick={addStep} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Etapa
                              </Button>
                          </div>

      {errors.steps && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.steps}</p>
                      </div>
      )}

                      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={step.id} className="border-2 border-blue-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Etapa {index + 1}
                  </Badge>
                            <Input
                    value={step.name}
                    onChange={(e) => updateStep(step.id, { name: e.target.value })}
                    placeholder="Nome da etapa"
                    className="font-medium border-none bg-transparent p-0 h-auto text-lg"
                            />
                          </div>
                <div className="flex items-center gap-2">
                              <Button
                    variant="outline"
                                size="sm"
                    onClick={() => setCurrentStepData(step)}
                              >
                    <Edit className="h-4 w-4" />
                              </Button>
                                       <Button
                    variant="outline"
                                         size="sm"
                    onClick={() => removeStep(step.id)}
                                         className="text-red-600 hover:text-red-700"
                                       >
                    <Trash2 className="h-4 w-4" />
                                       </Button>
                                     </div>
                                   </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={step.description}
                onChange={(e) => updateStep(step.id, { description: e.target.value })}
                placeholder="Descreva o que será verificado nesta etapa"
                rows={2}
                className="border-gray-200"
              />
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>{step.questions.length} pergunta(s)</span>
                      </div>
                    </CardContent>
                  </Card>
        ))}

        {steps.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Layers className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma etapa criada ainda</p>
            <p className="text-sm">Clique em "Adicionar Etapa" para começar</p>
                </div>
        )}
        </div>
    </motion.div>
  );

  // Passo 3: Perguntas
  const renderQuestions = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Perguntas por Etapa</h3>
        <p className="text-sm text-gray-600">
          Configure as perguntas de cada etapa e defina o tipo de defeito
        </p>
            </div>

      {errors.questions && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.questions}</p>
        </div>
      )}

      <div className="space-y-6">
        {steps.map((step, stepIndex) => (
          <Card key={step.id} className="border-2 border-green-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Etapa {stepIndex + 1}
                  </Badge>
                  <h4 className="font-semibold text-lg">{step.name}</h4>
               </div>
                <Button
                  onClick={() => addQuestion(step.id)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Pergunta
                </Button>
            </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {step.questions.map((question, qIndex) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            P{qIndex + 1}
                          </Badge>
              <Input
                            value={question.title}
                            onChange={(e) => updateQuestion(step.id, question.id, { title: e.target.value })}
                            placeholder="Digite a pergunta"
                            className="font-medium border-none bg-transparent p-0 h-auto"
              />
            </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
                            <Label className="text-sm text-gray-600">Tipo</Label>
                            <Select
                              value={question.type}
                              onValueChange={(value: any) => updateQuestion(step.id, question.id, { type: value })}
                            >
                              <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                                <SelectItem value="checkbox">Sim/Não</SelectItem>
                                <SelectItem value="parameter">Parâmetro</SelectItem>
                                <SelectItem value="etiqueta">Etiqueta (OCR)</SelectItem>
                                <SelectItem value="document">Documento</SelectItem>
                                <SelectItem value="photo">Foto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                            <Label className="text-sm text-gray-600">Tipo de Defeito</Label>
                            <Select
                              value={question.defectType}
                              onValueChange={(value: any) => updateQuestion(step.id, question.id, { defectType: value })}
                            >
                              <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                                <SelectItem value="critical">Crítico</SelectItem>
                                <SelectItem value="major">Maior</SelectItem>
                                <SelectItem value="minor">Menor</SelectItem>
                  </SelectContent>
                </Select>
            </div>

                          <div className="flex items-center gap-2">
                            <CheckSquare
                              className={`h-4 w-4 cursor-pointer ${
                                question.required ? 'text-blue-600' : 'text-gray-400'
                              }`}
                              onClick={() => updateQuestion(step.id, question.id, { required: !question.required })}
                            />
                            <Label className="text-sm text-gray-600 cursor-pointer">
                              Obrigatória
                            </Label>
                    </div>
                  </div>

                        {question.type === 'parameter' && (
                          <div className="mt-3 grid grid-cols-3 gap-2">
                    <div>
                              <Label className="text-xs text-gray-600">Mínimo</Label>
                      <Input
                        type="number"
                                value={question.parameter?.min || ''}
                                onChange={(e) => updateQuestion(step.id, question.id, {
                                  parameter: { ...question.parameter, min: parseFloat(e.target.value) }
                                })}
                                className="h-8"
                      />
                    </div>
                    <div>
                              <Label className="text-xs text-gray-600">Máximo</Label>
                      <Input
                        type="number"
                                value={question.parameter?.max || ''}
                                onChange={(e) => updateQuestion(step.id, question.id, {
                                  parameter: { ...question.parameter, max: parseFloat(e.target.value) }
                                })}
                                className="h-8"
                      />
                    </div>
                    <div>
                              <Label className="text-xs text-gray-600">Unidade</Label>
                      <Input
                                value={question.parameter?.unit || ''}
                                onChange={(e) => updateQuestion(step.id, question.id, {
                                  parameter: { ...question.parameter, unit: e.target.value }
                                })}
                                className="h-8"
                                placeholder="mm, kg, etc"
                      />
                    </div>
                  </div>
                )}
              </div>

                           <Button
                             variant="outline"
                             size="sm"
                        onClick={() => removeQuestion(step.id, question.id)}
                        className="text-red-600 hover:text-red-700"
                           >
                        <Trash2 className="h-4 w-4" />
                           </Button>
                       </div>
                          </div>
                ))}

                {step.questions.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <CheckSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhuma pergunta criada para esta etapa</p>
                    <p className="text-sm">Clique em "Adicionar Pergunta" para começar</p>
                        </div>
                      )}
                    </div>
            </CardContent>
          </Card>
        ))}
                      </div>
    </motion.div>
  );

  // Passo 4: Flow Builder
  const renderFlowBuilder = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center py-8">
        <Target className="h-16 w-16 mx-auto mb-4 text-purple-500" />
        <h3 className="text-lg font-medium mb-2">Flow Builder - Lógica Condicional</h3>
        <p className="text-gray-600 mb-6">
          Configure a lógica condicional para cada etapa. O sistema aplicará automaticamente
          as regras durante a execução da inspeção.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
          <h4 className="font-medium text-blue-900 mb-2">Como Funciona:</h4>
          <ul className="text-sm text-blue-800 space-y-1 text-left">
            <li>• <strong>Perguntas obrigatórias:</strong> Sempre aparecem na inspeção</li>
            <li>• <strong>Lógica condicional:</strong> Se P1=NÃO, P2 pode ser pulada</li>
            <li>• <strong>Classificação automática:</strong> Defeitos são classificados por tipo</li>
            <li>• <strong>Decisões automáticas:</strong> Sistema decide aprovação/reprovação</li>
          </ul>
                    </div>
                  </div>

              <div className="space-y-4">
        {steps.map((step, stepIndex) => (
          <Card key={step.id} className="border-2 border-purple-100">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  Etapa {stepIndex + 1}
                </Badge>
                <h4 className="font-semibold">{step.name}</h4>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {step.questions.length} pergunta(s)
                </Badge>
                </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {step.questions.map((question, qIndex) => (
                  <div key={question.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      P{qIndex + 1}
                    </Badge>
                    <span className="flex-1 text-sm">{question.title}</span>
                    <Badge variant="outline" className={`${
                      question.defectType === 'critical' ? 'bg-red-50 text-red-700' :
                      question.defectType === 'major' ? 'bg-orange-50 text-orange-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      {question.defectType === 'critical' ? 'Crítico' :
                       question.defectType === 'major' ? 'Maior' : 'Menor'}
                    </Badge>
                    </div>
                ))}
                    </div>
              
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Lógica automática:</strong> Se qualquer pergunta for respondida como "NÃO", 
                  a etapa será marcada como "REPROVADA" e o tipo de defeito será classificado automaticamente.
                </p>
                          </div>
            </CardContent>
          </Card>
        ))}
                        </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Editar' : 'Novo'} Plano de Inspeção
            </h2>
            <p className="text-gray-600 mt-1">
              Crie um plano de inspeção passo a passo
            </p>
                      </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
                    </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Passo {currentStep} de {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% completo
            </span>
                  </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
              </div>
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-4">
            {[1, 2, 3, 4].map((step) => (
              <button
                key={step}
                onClick={() => goToStep(step)}
                className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-all ${
                  step === currentStep
                    ? 'bg-blue-100 text-blue-700'
                    : step < currentStep
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep
                    ? 'bg-blue-600 text-white'
                    : step < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                <span className="text-xs font-medium">
                  {step === 1 ? 'Básico' :
                   step === 2 ? 'Etapas' :
                   step === 3 ? 'Perguntas' : 'Flow'}
                </span>
              </button>
            ))}
            </div>
          </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          {renderCurrentStep()}
        </ScrollArea>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
              </Button>

          <div className="flex items-center gap-3">
            {currentStep === totalSteps ? (
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Salvando...
                   </>
                 ) : (
                   <>
                    <Save className="h-4 w-4" />
                    Criar Plano
                   </>
                 )}
               </Button>
            ) : (
                 <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                Próximo
                <ArrowRight className="h-4 w-4" />
                 </Button>
               )}
             </div>
           </div>
         </div>
    </div>
     );
  }