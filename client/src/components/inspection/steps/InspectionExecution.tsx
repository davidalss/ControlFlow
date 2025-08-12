import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Camera, CheckCircle, AlertTriangle, Clock, HelpCircle, FileText, Eye, ChevronLeft, ChevronRight, Zap, Ruler, Tag, Shield, Settings } from "lucide-react";

interface InspectionExecutionProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function InspectionExecution({ data, onUpdate, onNext, onPrev }: InspectionExecutionProps) {
  const { toast } = useToast();
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [inspectionResults, setInspectionResults] = useState(data.results || {});
  const [defects, setDefects] = useState(data.defects || []);
  const [photos, setPhotos] = useState(data.photos || []);
  const [showPlanSidebar, setShowPlanSidebar] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [helpContent, setHelpContent] = useState<any>(null);

  // Plano de inspeção melhorado com etapas mais lógicas e explicativas
  const inspectionPlan = {
    id: 'plan-001',
    version: '1.0',
    steps: [
      {
        id: 'step-1',
        name: 'Materiais Gráficos',
        type: 'non-functional',
        icon: FileText,
        description: 'Verificação de materiais gráficos e impressão',
        helpContent: {
          title: 'Materiais Gráficos',
          description: 'Verificação da qualidade visual e impressão do produto',
          instructions: [
            'Verifique se a impressão está nítida e legível',
            'Confirme se as cores estão conforme padrão estabelecido',
            'Verifique se todos os textos estão completos e sem erros',
            'Confirme se as imagens estão bem definidas'
          ],
          examples: [
            'Impressão borrada ou com falhas',
            'Cores fora do padrão da marca',
            'Textos cortados ou ilegíveis',
            'Imagens pixeladas ou distorcidas'
          ],
          tips: 'Use boa iluminação para verificar detalhes finos. Compare com um produto padrão se disponível.'
        },
        items: [
          { id: 'item-1', description: 'Qualidade da impressão', required: true },
          { id: 'item-2', description: 'Cores conforme padrão', required: true },
          { id: 'item-3', description: 'Textos legíveis', required: true },
          { id: 'item-4', description: 'Imagens bem definidas', required: true }
        ],
        sampleSize: Math.ceil(data.sampleSize * 0.3)
      },
      {
        id: 'step-2',
        name: 'Medições',
        type: 'non-functional',
        icon: Ruler,
        description: 'Verificação de dimensões e medidas',
        helpContent: {
          title: 'Medições',
          description: 'Verificação das dimensões físicas do produto',
          instructions: [
            'Meça as dimensões principais do produto',
            'Verifique o peso conforme especificação',
            'Confirme se as medidas estão dentro da tolerância',
            'Registre os valores obtidos'
          ],
          examples: [
            'Dimensões fora da especificação',
            'Peso diferente do declarado',
            'Tolerâncias excedidas',
            'Medidas inconsistentes'
          ],
          tips: 'Use instrumentos calibrados. Meça em superfície plana. Faça múltiplas medições para confirmar.'
        },
        items: [
          { id: 'item-4', description: 'Dimensões conforme especificação', required: true },
          { id: 'item-5', description: 'Peso do produto', required: true },
          { id: 'item-6', description: 'Tolerâncias respeitadas', required: true }
        ],
        sampleSize: Math.ceil(data.sampleSize * 0.3)
      },
      {
        id: 'step-3',
        name: 'Parâmetros Elétricos',
        type: 'functional',
        icon: Zap,
        description: 'Teste de parâmetros elétricos',
        helpContent: {
          title: 'Parâmetros Elétricos',
          description: 'Verificação dos parâmetros elétricos do produto',
          instructions: [
            'Conecte o produto à fonte de alimentação adequada',
            'Meça a tensão de operação',
            'Verifique a corrente de consumo',
            'Confirme a potência nominal',
            'Teste a funcionalidade básica'
          ],
          examples: [
            'Tensão fora da faixa especificada',
            'Consumo de corrente excessivo',
            'Potência diferente da nominal',
            'Produto não liga ou funciona incorretamente'
          ],
          tips: 'Use multímetro calibrado. Verifique a tensão da rede. Teste em condições normais de uso.'
        },
        items: [
          { id: 'item-7', description: 'Tensão de operação', required: true, parameter: { min: 110, max: 127, unit: 'V' } },
          { id: 'item-8', description: 'Corrente de consumo', required: true, parameter: { min: 0.5, max: 2.0, unit: 'A' } },
          { id: 'item-9', description: 'Potência nominal', required: true, parameter: { min: 50, max: 200, unit: 'W' } },
          { id: 'item-10', description: 'Funcionalidade básica', required: true }
        ],
        sampleSize: data.sampleSize
      },
      {
        id: 'step-4',
        name: 'Etiquetas',
        type: 'non-functional',
        icon: Tag,
        description: 'Conferência de etiquetas obrigatórias',
        helpContent: {
          title: 'Etiquetas',
          description: 'Verificação das etiquetas obrigatórias do produto',
          instructions: [
            'Verifique se todas as etiquetas obrigatórias estão presentes',
            'Confirme se os códigos estão legíveis',
            'Verifique se as informações estão corretas',
            'Confirme se as etiquetas estão bem fixadas'
          ],
          examples: [
            'Etiqueta EAN ausente ou ilegível',
            'Código DUN incorreto',
            'Selo ANATEL ausente ou danificado',
            'Etiquetas mal fixadas ou descolando'
          ],
          tips: 'Compare com a documentação técnica. Use lupa se necessário. Verifique se não há etiquetas duplicadas.'
        },
        items: [
          { id: 'item-11', description: 'EAN', required: true, label: { type: 'EAN', file: 'label-ean.pdf' } },
          { id: 'item-12', description: 'DUN', required: true, label: { type: 'DUN', file: 'label-dun.pdf' } },
          { id: 'item-13', description: 'Selo ANATEL', required: true, label: { type: 'ANATEL', file: 'label-anatel.pdf' } },
          { id: 'item-14', description: 'Fixação das etiquetas', required: true }
        ],
        sampleSize: Math.ceil(data.sampleSize * 0.3)
      },
      {
        id: 'step-5',
        name: 'Integridade',
        type: 'non-functional',
        icon: Shield,
        description: 'Verificação de integridade física',
        helpContent: {
          title: 'Integridade',
          description: 'Verificação da integridade física do produto e embalagem',
          instructions: [
            'Verifique se a embalagem está intacta',
            'Confirme se o produto não apresenta danos',
            'Verifique se todos os componentes estão presentes',
            'Teste a resistência mecânica básica'
          ],
          examples: [
            'Embalagem danificada ou aberta',
            'Produto com amassados ou riscos',
            'Componentes ausentes',
            'Falhas de montagem'
          ],
          tips: 'Inspecione em boa iluminação. Verifique todos os ângulos. Teste a funcionalidade se aplicável.'
        },
        items: [
          { id: 'item-15', description: 'Embalagem intacta', required: true },
          { id: 'item-16', description: 'Produto sem danos', required: true },
          { id: 'item-17', description: 'Componentes completos', required: true },
          { id: 'item-18', description: 'Montagem correta', required: true }
        ],
        sampleSize: Math.ceil(data.sampleSize * 0.3)
      }
    ]
  };

  const currentStep = inspectionPlan.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / inspectionPlan.steps.length) * 100;
  const completedSteps = inspectionPlan.steps.filter((_, index) => index < currentStepIndex).length;

  const handleItemCheck = (itemId: string, checked: boolean) => {
    const newResults = { ...inspectionResults };
    if (!newResults[currentStep.id]) {
      newResults[currentStep.id] = {};
    }
    newResults[currentStep.id][itemId] = checked;
    setInspectionResults(newResults);
    onUpdate({ results: newResults });
  };

  const handleParameterInput = (itemId: string, value: string, parameter: any) => {
    const newResults = { ...inspectionResults };
    if (!newResults[currentStep.id]) {
      newResults[currentStep.id] = {};
    }
    newResults[currentStep.id][itemId] = {
      value: parseFloat(value),
      unit: parameter.unit,
      withinRange: parseFloat(value) >= parameter.min && parseFloat(value) <= parameter.max
    };
    setInspectionResults(newResults);
    onUpdate({ results: newResults });
  };

  const handlePhotoCapture = () => {
    // Simular captura de foto
    const newPhoto = {
      id: Date.now(),
      url: `/uploads/photo-${Date.now()}.jpg`,
      description: `Foto da etapa: ${currentStep.name}`,
      stepId: currentStep.id,
      timestamp: new Date().toISOString()
    };
    const newPhotos = [...photos, newPhoto];
    setPhotos(newPhotos);
    onUpdate({ photos: newPhotos });
    
    toast({
      title: "Foto capturada",
      description: "Foto registrada para esta etapa",
    });
  };

  const handleNextStep = () => {
    if (currentStepIndex < inspectionPlan.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onNext();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else {
      onPrev();
    }
  };

  const showHelp = (step: any) => {
    setHelpContent(step.helpContent);
    setShowHelpDialog(true);
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'pending';
  };

  const getStepIcon = (step: any) => {
    const IconComponent = step.icon;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header com Progresso */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Execução da Inspeção</h2>
        <p className="text-gray-600 mt-2">Inspeção por etapas com controle AQL em tempo real</p>
      </div>

      {/* Progresso Visual */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Etapa {currentStepIndex + 1} de {inspectionPlan.steps.length}
              </Badge>
              <span className="text-sm text-gray-600">
                {completedSteps} concluídas, {inspectionPlan.steps.length - completedSteps - 1} restantes
              </span>
            </div>
            <div className="text-sm font-medium text-gray-700">
              {Math.round(progress)}% completo
            </div>
          </div>
          
          <Progress value={progress} className="h-3" />
          
          {/* Checklist Visual */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            {inspectionPlan.steps.map((step, index) => {
              const status = getStepStatus(index);
              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg border-2 text-center cursor-pointer transition-all ${
                    status === 'completed'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : status === 'current'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                  onClick={() => setCurrentStepIndex(index)}
                >
                  <div className="flex items-center justify-center mb-1">
                    {status === 'completed' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      getStepIcon(step)
                    )}
                  </div>
                  <div className="text-xs font-medium truncate">{step.name}</div>
                  <div className="text-xs opacity-75">{index + 1}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Etapa Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStepIcon(currentStep)}
              <div>
                <div className="text-xl font-bold">{currentStep.name}</div>
                <div className="text-sm text-gray-600">{currentStep.description}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {currentStep.type === 'functional' ? '100%' : '30%'} da amostra
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => showHelp(currentStep)}
                className="text-blue-600 hover:text-blue-700"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Ajuda
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Itens da Etapa */}
          <div className="space-y-4">
            {currentStep.items.map((item) => {
              const isChecked = inspectionResults[currentStep.id]?.[item.id];
              const isRequired = item.required;
              
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isRequired
                      ? 'border-orange-200 bg-orange-50'
                      : 'border-gray-200 bg-gray-50'
                  } ${isChecked ? 'border-green-300 bg-green-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={item.id}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleItemCheck(item.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={item.id}
                        className={`text-sm font-medium cursor-pointer ${
                          isRequired ? 'text-orange-700' : 'text-gray-700'
                        }`}
                      >
                        {item.description}
                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      
                      {item.parameter && (
                        <div className="mt-2 p-2 bg-white rounded border">
                          <div className="text-xs text-gray-600 mb-1">Faixa aceitável:</div>
                          <div className="text-sm font-medium">
                            {item.parameter.min} - {item.parameter.max} {item.parameter.unit}
                          </div>
                          <Input
                            type="number"
                            placeholder={`Digite o valor em ${item.parameter.unit}`}
                            className="mt-2"
                            onChange={(e) => handleParameterInput(item.id, e.target.value, item.parameter)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controles da Etapa */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePhotoCapture}
              >
                <Camera className="w-4 h-4 mr-1" />
                Capturar Foto
              </Button>
              <span className="text-sm text-gray-500">
                {photos.filter(p => p.stepId === currentStep.id).length} fotos
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              
              <Button
                onClick={handleNextStep}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {currentStepIndex === inspectionPlan.steps.length - 1 ? (
                  <>
                    Concluir Inspeção
                    <CheckCircle className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Próxima Etapa
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar do Plano (opcional) */}
      <Button
        variant="outline"
        onClick={() => setShowPlanSidebar(!showPlanSidebar)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Eye className="w-4 h-4 mr-1" />
        Ver Plano
      </Button>

      {/* Dialog de Ajuda */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              {helpContent?.title}
            </DialogTitle>
            <DialogDescription>
              {helpContent?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Instruções:</h4>
              <ul className="space-y-1">
                {helpContent?.instructions.map((instruction: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-600 font-medium">{index + 1}.</span>
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Exemplos de Defeitos:</h4>
              <ul className="space-y-1">
                {helpContent?.examples.map((example: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-red-600">
                    <span className="text-red-500">•</span>
                    {example}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">💡 Dica:</h4>
              <p className="text-sm text-blue-700">{helpContent?.tips}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
