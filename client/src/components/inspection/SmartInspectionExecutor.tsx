import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play,
  Pause,
  SkipForward,
  SkipBack,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
  FileText,
  Image,
  Video,
  HelpCircle,
  Info,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Save,
  Send,
  Bell,
  Shield,
  Target,
  Clock,
  BarChart3,
  Eye,
  EyeOff,
  Download,
  Upload,
  Share2,
  MoreHorizontal,
  Settings,
  User,
  Calendar,
  Tag,
  Star,
  BookOpen,
  Zap,
  Brain,
  Sparkles
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
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { FlowNode, FlowPlan } from '../inspection-plans/FlowBuilder';

// Tipos para execução de inspeção
export interface InspectionStep {
  id: string;
  node: FlowNode;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'nc';
  answer?: any;
  photos?: string[];
  notes?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
}

export interface InspectionExecution {
  id: string;
  planId: string;
  plan: FlowPlan;
  productId: string;
  productName: string;
  inspectorId: string;
  inspectorName: string;
  status: 'draft' | 'in_progress' | 'completed' | 'nc_pending' | 'approved' | 'rejected';
  currentStepIndex: number;
  steps: InspectionStep[];
  startTime: string;
  endTime?: string;
  totalDuration?: number;
  ncCount: number;
  observations?: string;
  finalDecision?: 'approved' | 'rejected' | 'conditional';
}

interface SmartInspectionExecutorProps {
  inspection: InspectionExecution;
  onStepComplete: (stepId: string, answer: any, photos?: string[], notes?: string) => void;
  onInspectionComplete: (inspection: InspectionExecution) => void;
  onNCRegistered: (stepId: string, details: any) => void;
  onClose: () => void;
}

export default function SmartInspectionExecutor({
  inspection,
  onStepComplete,
  onInspectionComplete,
  onNCRegistered,
  onClose
}: SmartInspectionExecutorProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<InspectionStep | null>(null);
  const [stepAnswer, setStepAnswer] = useState<any>(null);
  const [stepPhotos, setStepPhotos] = useState<string[]>([]);
  const [stepNotes, setStepNotes] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showNCModal, setShowNCModal] = useState(false);
  const [ncDetails, setNCDetails] = useState<any>({});
  const [isPaused, setIsPaused] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Inicializar execução
  useEffect(() => {
    if (inspection.steps.length > 0) {
      const nextStep = inspection.steps.find(step => step.status === 'pending');
      if (nextStep) {
        setCurrentStep(nextStep);
        setStepAnswer(null);
        setStepPhotos([]);
        setStepNotes('');
      }
    }
  }, [inspection]);

  // Calcular progresso
  const progress = inspection.steps.length > 0 
    ? (inspection.steps.filter(step => step.status === 'completed').length / inspection.steps.length) * 100
    : 0;

  // Obter próximo passo
  const getNextStep = useCallback((currentStepId: string, answer: any): InspectionStep | null => {
    const currentStepIndex = inspection.steps.findIndex(step => step.id === currentStepId);
    if (currentStepIndex === -1) return null;

    const currentNode = inspection.steps[currentStepIndex].node;
    
    // Verificar lógica condicional
    if (currentNode.data.conditionalLogic && currentNode.data.conditionalLogic.length > 0) {
      const matchingCondition = currentNode.data.conditionalLogic.find(condition => {
        try {
          // Avaliar condição baseada na resposta
          return eval(condition.condition.replace('answer', JSON.stringify(answer)));
        } catch {
          return false;
        }
      });

      if (matchingCondition) {
        // Encontrar próximo passo baseado na condição
        const nextStepId = matchingCondition.nextStepId;
        return inspection.steps.find(step => step.id === nextStepId) || null;
      }
    }

    // Se não há lógica condicional, seguir sequência
    const nextIndex = currentStepIndex + 1;
    return nextIndex < inspection.steps.length ? inspection.steps[nextIndex] : null;
  }, [inspection]);

  // Completar passo atual
  const completeCurrentStep = useCallback(async () => {
    if (!currentStep || !stepAnswer) return;

    try {
      // Verificar se é uma não conformidade
      const isNC = checkIfNC(currentStep, stepAnswer);
      
      if (isNC) {
        // Abrir modal de NC
        setNCDetails({
          stepId: currentStep.id,
          stepTitle: currentStep.node.title,
          answer: stepAnswer,
          type: currentStep.node.data.defectType || 'MAIOR'
        });
        setShowNCModal(true);
        return;
      }

      // Completar passo normalmente
      await onStepComplete(currentStep.id, stepAnswer, stepPhotos, stepNotes);
      
      // Encontrar próximo passo
      const nextStep = getNextStep(currentStep.id, stepAnswer);
      
      if (nextStep) {
        setCurrentStep(nextStep);
        setStepAnswer(null);
        setStepPhotos([]);
        setStepNotes('');
        
        toast({
          title: "Passo concluído",
          description: "Próximo passo carregado"
        });
      } else {
        // Inspeção concluída
        setShowSummary(true);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao completar passo",
        variant: "destructive"
      });
    }
  }, [currentStep, stepAnswer, stepPhotos, stepNotes, onStepComplete, getNextStep, toast]);

  // Verificar se é uma não conformidade
  const checkIfNC = useCallback((step: InspectionStep, answer: any): boolean => {
    const node = step.node;
    
    // Verificar tipo de pergunta
    if (node.data.questionType === 'yes_no' && answer === 'NÃO') {
      return true;
    }
    
    if (node.data.questionType === 'multiple_choice') {
      // Verificar se a resposta está nas opções válidas
      const validOptions = node.data.options || [];
      if (validOptions.length > 0 && !validOptions.includes(answer)) {
        return true;
      }
    }
    
    if (node.data.questionType === 'number') {
      // Verificar se está dentro do range esperado
      const numericConfig = node.data.numericConfig;
      if (numericConfig) {
        const value = parseFloat(answer);
        if (numericConfig.minValue !== undefined && value < numericConfig.minValue) return true;
        if (numericConfig.maxValue !== undefined && value > numericConfig.maxValue) return true;
        if (numericConfig.expectedValue !== undefined && value !== numericConfig.expectedValue) return true;
      }
    }
    
    return false;
  }, []);

  // Registrar NC
  const handleNCRegistration = useCallback(async () => {
    try {
      await onNCRegistered(ncDetails.stepId, ncDetails);
      
      // Marcar passo como NC
      await onStepComplete(ncDetails.stepId, ncDetails.answer, stepPhotos, stepNotes);
      
      setShowNCModal(false);
      setNCDetails({});
      
      // Encontrar próximo passo (pode ser um fluxo de NC)
      const nextStep = getNextStep(ncDetails.stepId, ncDetails.answer);
      if (nextStep) {
        setCurrentStep(nextStep);
        setStepAnswer(null);
        setStepPhotos([]);
        setStepNotes('');
      } else {
        setShowSummary(true);
      }
      
      toast({
        title: "NC registrada",
        description: "Não conformidade registrada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao registrar NC",
        variant: "destructive"
      });
    }
  }, [ncDetails, onNCRegistered, onStepComplete, getNextStep, stepPhotos, stepNotes, toast]);

  // Renderizar passo atual
  const renderCurrentStep = () => {
    if (!currentStep) return null;

    const node = currentStep.node;
    const stepNumber = inspection.steps.findIndex(step => step.id === currentStep.id) + 1;

    return (
      <motion.div
        key={currentStep.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        {/* Header do Passo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600">{stepNumber}</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold">{node.title}</h3>
              <p className="text-gray-600">{node.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {node.data.defectType || 'MAIOR'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mídia de Ajuda */}
        {showHelp && node.data.mediaHelp && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {node.data.mediaHelp.type === 'image' && <Image className="w-5 h-5 text-blue-600 mt-1" />}
                {node.data.mediaHelp.type === 'video' && <Video className="w-5 h-5 text-blue-600 mt-1" />}
                {node.data.mediaHelp.type === 'document' && <FileText className="w-5 h-5 text-blue-600 mt-1" />}
                <div>
                  <h4 className="font-medium text-blue-900">Ajuda Visual</h4>
                  <p className="text-sm text-blue-700">{node.data.mediaHelp.description}</p>
                  {node.data.mediaHelp.url && (
                    <Button variant="outline" size="sm" className="mt-2">
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Variáveis Dinâmicas */}
        {node.data.dynamicVariables && node.data.dynamicVariables.length > 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-green-900 mb-2">Informações do Produto</h4>
              <div className="grid grid-cols-2 gap-2">
                {node.data.dynamicVariables.map((variable, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{variable}:</span>
                    <span className="ml-2 text-green-700">
                      {variable.includes('Tensão') ? '127V/220V' : 
                       variable.includes('Código') ? 'AF-001' : 
                       variable.includes('Nome') ? 'Air Fryer 5L' : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interface de Resposta */}
        <div className="space-y-4">
          <h4 className="font-medium">Sua Resposta:</h4>
          
          {/* Tipo Sim/Não */}
          {node.data.questionType === 'yes_no' && (
            <div className="flex gap-4">
              <Button
                variant={stepAnswer === 'SIM' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setStepAnswer('SIM')}
                className="flex-1 h-16"
              >
                <CheckCircle className="w-6 h-6 mr-2" />
                SIM
              </Button>
              <Button
                variant={stepAnswer === 'NÃO' ? 'destructive' : 'outline'}
                size="lg"
                onClick={() => setStepAnswer('NÃO')}
                className="flex-1 h-16"
              >
                <XCircle className="w-6 h-6 mr-2" />
                NÃO
              </Button>
            </div>
          )}

          {/* Tipo Múltipla Escolha */}
          {node.data.questionType === 'multiple_choice' && node.data.options && (
            <div className="grid grid-cols-2 gap-3">
              {node.data.options.map((option, index) => (
                <Button
                  key={index}
                  variant={stepAnswer === option ? 'default' : 'outline'}
                  onClick={() => setStepAnswer(option)}
                  className="h-12"
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {/* Tipo Texto */}
          {node.data.questionType === 'text' && (
            <Textarea
              placeholder="Digite sua resposta..."
              value={stepAnswer || ''}
              onChange={(e) => setStepAnswer(e.target.value)}
              rows={3}
            />
          )}

          {/* Tipo Número */}
          {node.data.questionType === 'number' && (
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Digite o valor..."
                value={stepAnswer || ''}
                onChange={(e) => setStepAnswer(e.target.value)}
                className="max-w-xs"
              />
              {node.data.numericConfig && (
                <div className="text-sm text-gray-600">
                  {node.data.numericConfig.minValue !== undefined && (
                    <span>Mín: {node.data.numericConfig.minValue}</span>
                  )}
                  {node.data.numericConfig.maxValue !== undefined && (
                    <span className="ml-4">Máx: {node.data.numericConfig.maxValue}</span>
                  )}
                  {node.data.numericConfig.expectedValue !== undefined && (
                    <span className="ml-4">Esperado: {node.data.numericConfig.expectedValue}</span>
                  )}
                  {node.data.numericConfig.unit && (
                    <span className="ml-4">Unidade: {node.data.numericConfig.unit}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tipo Foto */}
          {node.data.questionType === 'photo' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Clique para tirar uma foto</p>
                <Button variant="outline" onClick={() => {
                  // Simular captura de foto
                  const mockPhoto = `/photos/step_${currentStep.id}_${Date.now()}.jpg`;
                  setStepPhotos(prev => [...prev, mockPhoto]);
                }}>
                  <Camera className="w-4 h-4 mr-2" />
                  Capturar Foto
                </Button>
              </div>
              
              {stepPhotos.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Fotos capturadas:</h5>
                  <div className="grid grid-cols-3 gap-2">
                    {stepPhotos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 w-6 h-6 p-0"
                          onClick={() => setStepPhotos(prev => prev.filter((_, i) => i !== index))}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notas Adicionais */}
          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações, comentários ou detalhes adicionais..."
              value={stepNotes}
              onChange={(e) => setStepNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Continuar' : 'Pausar'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Pular passo (marcar como skipped)
                onStepComplete(currentStep.id, 'skipped', [], 'Passo pulado pelo inspetor');
                const nextStep = getNextStep(currentStep.id, 'skipped');
                if (nextStep) {
                  setCurrentStep(nextStep);
                  setStepAnswer(null);
                  setStepPhotos([]);
                  setStepNotes('');
                }
              }}
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Pular
            </Button>
          </div>
          
          <Button
            onClick={completeCurrentStep}
            disabled={!stepAnswer || isPaused}
            className="px-8"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Próximo Passo
          </Button>
        </div>
      </motion.div>
    );
  };

  // Renderizar resumo da inspeção
  const renderSummary = () => {
    const completedSteps = inspection.steps.filter(step => step.status === 'completed');
    const ncSteps = inspection.steps.filter(step => step.status === 'nc');
    const skippedSteps = inspection.steps.filter(step => step.status === 'skipped');

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-green-900">Inspeção Concluída!</h2>
          <p className="text-gray-600">Todos os passos foram executados com sucesso</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{completedSteps.length}</div>
              <div className="text-sm text-gray-600">Passos Concluídos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{ncSteps.length}</div>
              <div className="text-sm text-gray-600">Não Conformidades</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{skippedSteps.length}</div>
              <div className="text-sm text-gray-600">Passos Pulados</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Observações Finais</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Adicione observações gerais sobre a inspeção..."
              value={inspection.observations || ''}
              onChange={(e) => {
                // Atualizar observações da inspeção
              }}
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setShowSummary(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Passos
          </Button>
          <Button onClick={() => onInspectionComplete(inspection)}>
            <Save className="w-4 h-4 mr-2" />
            Finalizar Inspeção
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <Target className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold">Execução de Inspeção</h2>
              <p className="text-sm text-gray-600">{inspection.productName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={inspection.status === 'in_progress' ? 'default' : 'secondary'}>
              {inspection.status === 'in_progress' ? 'Em Andamento' : 'Pausada'}
            </Badge>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso da Inspeção</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Passo {inspection.currentStepIndex + 1} de {inspection.steps.length}</span>
            <span>Tempo: {inspection.totalDuration || 0}min</span>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-6">
            {showSummary ? renderSummary() : renderCurrentStep()}
          </ScrollArea>
        </div>

        {/* Modal de NC */}
        <AnimatePresence>
          {showNCModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl"
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-semibold">Não Conformidade Detectada</h3>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowNCModal(false)}>
                    Fechar
                  </Button>
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2">{ncDetails.stepTitle}</h4>
                    <p className="text-red-700">
                      Uma não conformidade foi detectada neste passo. 
                      Por favor, registre os detalhes para tratamento adequado.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="ncDescription">Descrição da NC *</Label>
                    <Textarea
                      id="ncDescription"
                      placeholder="Descreva detalhadamente a não conformidade encontrada..."
                      value={ncDetails.description || ''}
                      onChange={(e) => setNCDetails(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ncSeverity">Severidade</Label>
                      <Select 
                        value={ncDetails.severity || 'MAIOR'} 
                        onValueChange={(value) => setNCDetails(prev => ({ ...prev, severity: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MENOR">Menor</SelectItem>
                          <SelectItem value="MAIOR">Maior</SelectItem>
                          <SelectItem value="CRÍTICO">Crítico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="ncCategory">Categoria</Label>
                      <Select 
                        value={ncDetails.category || 'qualidade'} 
                        onValueChange={(value) => setNCDetails(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="qualidade">Qualidade</SelectItem>
                          <SelectItem value="seguranca">Segurança</SelectItem>
                          <SelectItem value="funcional">Funcional</SelectItem>
                          <SelectItem value="visual">Visual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ncAction">Ação Corretiva Sugerida</Label>
                    <Textarea
                      id="ncAction"
                      placeholder="Sugira uma ação corretiva para resolver esta NC..."
                      value={ncDetails.correctiveAction || ''}
                      onChange={(e) => setNCDetails(prev => ({ ...prev, correctiveAction: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="border-t p-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNCModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleNCRegistration} disabled={!ncDetails.description}>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Registrar NC
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
