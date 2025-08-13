import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { 
  Camera, 
  CheckCircle, 
  XCircle, 
  Image, 
  MessageSquare, 
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Save,
  FileText,
  Zap
} from 'lucide-react';

interface InspectionItem {
  id: string;
  name: string;
  type: 'checkbox' | 'parameter';
  status?: 'OK' | 'NOK';
  value?: string;
  unit?: string;
  withinRange?: boolean;
  observation?: string;
  timestamp?: Date;
  photoRequired?: boolean;
  photos?: string[];
}

interface InspectionStep {
  id: string;
  name: string;
  items: InspectionItem[];
  photoRequired?: boolean;
  photoPercentage?: number;
  minPhotos?: number;
  helpContent?: string;
}

interface InspectionExecutionData {
  currentStep: number;
  currentSample: number;
  totalSamples: number;
  steps: InspectionStep[];
  samples: {
    [sampleId: number]: {
      [stepId: string]: {
        [itemId: string]: {
          status?: 'OK' | 'NOK';
          value?: string;
          unit?: string;
          withinRange?: boolean;
          observation?: string;
          timestamp?: Date;
          photos?: string[];
        }
      }
    }
  };
  isActive: boolean;
  startTime?: Date;
  endTime?: Date;
}

interface InspectionExecutionProps {
  data: InspectionExecutionData;
  onUpdate: (data: InspectionExecutionData) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function InspectionExecution({ data, onUpdate, onNext, onPrev }: InspectionExecutionProps) {
  const [currentStep, setCurrentStep] = useState(data.currentStep || 0);
  const [currentSample, setCurrentSample] = useState(data.currentSample || 1);
  const [isActive, setIsActive] = useState(data.isActive || false);
  const [samples, setSamples] = useState(data.samples || {});
  const [startTime, setStartTime] = useState(data.startTime);

  // Plano de inspeção reorganizado conforme solicitado
  const inspectionPlan: InspectionStep[] = [
    {
      id: 'graphic-materials',
      name: 'Materiais Gráficos',
      photoRequired: true,
      photoPercentage: 20,
      minPhotos: 1,
      helpContent: 'Inspeção visual de embalagens, manuais, etiquetas e materiais impressos. Fotos obrigatórias em 20% das amostras.',
      items: [
        { id: 'packaging', name: 'Embalagem Principal', type: 'checkbox', photoRequired: true },
        { id: 'manual', name: 'Manual de Instruções', type: 'checkbox', photoRequired: true },
        { id: 'labels', name: 'Etiquetas de Identificação', type: 'checkbox', photoRequired: true },
        { id: 'warnings', name: 'Avisos de Segurança', type: 'checkbox', photoRequired: true },
        { id: 'graphics', name: 'Qualidade Gráfica', type: 'checkbox', photoRequired: true },
        { id: 'colors', name: 'Fidelidade de Cores', type: 'checkbox', photoRequired: true },
        { id: 'text', name: 'Legibilidade do Texto', type: 'checkbox', photoRequired: true }
      ]
    },
    {
      id: 'labels',
      name: 'Etiquetas',
      items: [
        { id: 'label-completeness', name: 'Completude das Informações', type: 'checkbox' },
        { id: 'label-adherence', name: 'Aderência da Etiqueta', type: 'checkbox' },
        { id: 'label-position', name: 'Posicionamento Correto', type: 'checkbox' },
        { id: 'label-durability', name: 'Durabilidade da Impressão', type: 'checkbox' }
      ]
    },
    {
      id: 'integrity',
      name: 'Integridade',
      items: [
        { id: 'physical-damage', name: 'Danos Físicos', type: 'checkbox' },
        { id: 'missing-parts', name: 'Peças Ausentes', type: 'checkbox' },
        { id: 'assembly', name: 'Montagem Correta', type: 'checkbox' },
        { id: 'finish', name: 'Acabamento', type: 'checkbox' }
      ]
    },
    {
      id: 'measurements',
      name: 'Medições',
      items: [
        { id: 'dimensions', name: 'Dimensões', type: 'parameter', unit: 'mm' },
        { id: 'weight', name: 'Peso', type: 'parameter', unit: 'g' },
        { id: 'volume', name: 'Volume', type: 'parameter', unit: 'L' }
      ]
    },
    {
      id: 'electrical',
      name: 'Parâmetros Elétricos',
      items: [
        { id: 'voltage', name: 'Tensão', type: 'parameter', unit: 'V' },
        { id: 'current', name: 'Corrente', type: 'parameter', unit: 'A' },
        { id: 'power', name: 'Potência', type: 'parameter', unit: 'W' },
        { id: 'frequency', name: 'Frequência', type: 'parameter', unit: 'Hz' }
      ]
    }
  ];

  const [steps] = useState(inspectionPlan);

  // Calcular fotos necessárias para materiais gráficos
  const calculateRequiredPhotos = useCallback((sampleSize: number, percentage: number = 20, minPhotos: number = 1) => {
    const calculatedPhotos = Math.ceil((sampleSize * percentage) / 100);
    return Math.max(calculatedPhotos, minPhotos);
  }, []);

  const requiredPhotos = calculateRequiredPhotos(data.totalSamples, 20, 1);
  const currentPhotos = Object.values(samples).reduce((total, sampleData) => {
    return total + Object.values(sampleData).reduce((stepTotal, stepData) => {
      return stepTotal + Object.values(stepData).reduce((itemTotal, itemData) => {
        return itemTotal + (itemData.photos?.length || 0);
      }, 0);
    }, 0);
  }, 0);

  // Verificar se a amostra atual está completa
  const isCurrentSampleComplete = useCallback(() => {
    const currentSampleData = samples[currentSample];
    if (!currentSampleData) return false;

    const currentStepData = currentSampleData[steps[currentStep].id];
    if (!currentStepData) return false;

    // Verificar se todos os itens da etapa atual foram inspecionados
    const stepItems = steps[currentStep].items;
    const inspectedItems = Object.keys(currentStepData);
    
    return stepItems.every(item => inspectedItems.includes(item.id));
  }, [samples, currentSample, currentStep, steps]);

  // Verificar se todas as amostras foram inspecionadas
  const areAllSamplesComplete = useCallback(() => {
    for (let sample = 1; sample <= data.totalSamples; sample++) {
      const sampleData = samples[sample];
      if (!sampleData) return false;

      for (const step of steps) {
        const stepData = sampleData[step.id];
        if (!stepData) return false;

        const stepItems = step.items;
        const inspectedItems = Object.keys(stepData);
        
        if (!stepItems.every(item => inspectedItems.includes(item.id))) {
          return false;
        }
      }
    }
    return true;
  }, [samples, data.totalSamples, steps]);

  // Verificar se fotos obrigatórias foram tiradas
  const areRequiredPhotosTaken = useCallback(() => {
    if (currentStep === 0) { // Materiais Gráficos
      return currentPhotos >= requiredPhotos;
    }
    return true;
  }, [currentStep, currentPhotos, requiredPhotos]);

  // Iniciar inspeção
  const handleStartInspection = () => {
    setIsActive(true);
    setStartTime(new Date());
    onUpdate({
      ...data,
      isActive: true,
      startTime: new Date()
    });
  };

  // Pausar inspeção
  const handlePauseInspection = () => {
    setIsActive(false);
    onUpdate({
      ...data,
      isActive: false
    });
  };

  // Reiniciar inspeção
  const handleResetInspection = () => {
    setSamples({});
    setCurrentStep(0);
    setCurrentSample(1);
    setIsActive(false);
    setStartTime(undefined);
    onUpdate({
      ...data,
      samples: {},
      currentStep: 0,
      currentSample: 1,
      isActive: false,
      startTime: undefined
    });
  };

  // Marcar item como OK/NOK
  const handleItemCheck = (itemId: string, status: 'OK' | 'NOK') => {
    const newSamples = { ...samples };
    
    if (!newSamples[currentSample]) {
      newSamples[currentSample] = {};
    }
    
    if (!newSamples[currentSample][steps[currentStep].id]) {
      newSamples[currentSample][steps[currentStep].id] = {};
    }
    
    newSamples[currentSample][steps[currentStep].id][itemId] = {
      status,
      timestamp: new Date()
    };
    
    setSamples(newSamples);
    onUpdate({
      ...data,
      samples: newSamples
    });
  };

  // Inserir valor de parâmetro
  const handleParameterInput = (itemId: string, value: string, unit: string, withinRange: boolean) => {
    const newSamples = { ...samples };
    
    if (!newSamples[currentSample]) {
      newSamples[currentSample] = {};
    }
    
    if (!newSamples[currentSample][steps[currentStep].id]) {
      newSamples[currentSample][steps[currentStep].id] = {};
    }
    
    newSamples[currentSample][steps[currentStep].id][itemId] = {
      value,
      unit,
      withinRange,
      timestamp: new Date()
    };
    
    setSamples(newSamples);
    onUpdate({
      ...data,
      samples: newSamples
    });
  };

  // Adicionar observação
  const handleObservationChange = (itemId: string, observation: string) => {
    const newSamples = { ...samples };
    
    if (!newSamples[currentSample]) {
      newSamples[currentSample] = {};
    }
    
    if (!newSamples[currentSample][steps[currentStep].id]) {
      newSamples[currentSample][steps[currentStep].id] = {};
    }
    
    if (!newSamples[currentSample][steps[currentStep].id][itemId]) {
      newSamples[currentSample][steps[currentStep].id][itemId] = {};
    }
    
    newSamples[currentSample][steps[currentStep].id][itemId].observation = observation;
    
    setSamples(newSamples);
    onUpdate({
      ...data,
      samples: newSamples
    });
  };

  // Adicionar foto
  const handleAddPhoto = (itemId: string) => {
    // Simular adição de foto (em implementação real, seria upload de arquivo)
    const newSamples = { ...samples };
    
    if (!newSamples[currentSample]) {
      newSamples[currentSample] = {};
    }
    
    if (!newSamples[currentSample][steps[currentStep].id]) {
      newSamples[currentSample][steps[currentStep].id] = {};
    }
    
    if (!newSamples[currentSample][steps[currentStep].id][itemId]) {
      newSamples[currentSample][steps[currentStep].id][itemId] = {};
    }
    
    if (!newSamples[currentSample][steps[currentStep].id][itemId].photos) {
      newSamples[currentSample][steps[currentStep].id][itemId].photos = [];
    }
    
    newSamples[currentSample][steps[currentStep].id][itemId].photos!.push(`foto_${Date.now()}.jpg`);
    
    setSamples(newSamples);
    onUpdate({
      ...data,
      samples: newSamples
    });
  };

  // Próxima etapa
  const handleNextStep = () => {
    if (!isCurrentSampleComplete()) {
      alert('Complete todos os itens da etapa atual antes de prosseguir.');
      return;
    }

    if (currentStep === 0 && !areRequiredPhotosTaken()) {
      alert(`É obrigatório tirar pelo menos ${requiredPhotos} fotos para materiais gráficos.`);
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      onUpdate({
        ...data,
        currentStep: currentStep + 1
      });
    } else {
      // Próxima amostra
      if (currentSample < data.totalSamples) {
        setCurrentSample(currentSample + 1);
        setCurrentStep(0);
        onUpdate({
          ...data,
          currentSample: currentSample + 1,
          currentStep: 0
        });
      } else {
        // Todas as amostras completas
        onNext();
      }
    }
  };

  // Etapa anterior
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      onUpdate({
        ...data,
        currentStep: currentStep - 1
      });
    } else {
      if (currentSample > 1) {
        setCurrentSample(currentSample - 1);
        setCurrentStep(steps.length - 1);
        onUpdate({
          ...data,
          currentSample: currentSample - 1,
          currentStep: steps.length - 1
        });
      } else {
        onPrev();
      }
    }
  };

  // Renderizar input do item
  const renderItemInput = (item: InspectionItem) => {
    const currentData = samples[currentSample]?.[steps[currentStep].id]?.[item.id];

    if (item.type === 'checkbox') {
      return (
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${item.id}-ok`}
              checked={currentData?.status === 'OK'}
              onCheckedChange={() => handleItemCheck(item.id, 'OK')}
            />
            <Label htmlFor={`${item.id}-ok`} className="text-green-700 font-medium">
              OK
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${item.id}-nok`}
              checked={currentData?.status === 'NOK'}
              onCheckedChange={() => handleItemCheck(item.id, 'NOK')}
            />
            <Label htmlFor={`${item.id}-nok`} className="text-red-700 font-medium">
              NOK
            </Label>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Valor"
            value={currentData?.value || ''}
            onChange={(e) => handleParameterInput(item.id, e.target.value, item.unit || '', true)}
            className="w-32"
          />
          <span className="text-sm text-gray-600">{item.unit}</span>
          <Select 
            value={currentData?.withinRange ? 'true' : 'false'} 
            onValueChange={(value) => handleParameterInput(item.id, currentData?.value || '', item.unit || '', value === 'true')}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Dentro</SelectItem>
              <SelectItem value="false">Fora</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }
  };

  const currentStepData = steps[currentStep];
  const currentSampleData = samples[currentSample]?.[currentStepData.id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header com Controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Execução da Inspeção
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Amostra {currentSample} de {data.totalSamples} - {currentStepData.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isActive ? (
                <Button onClick={handleStartInspection} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Iniciar
                </Button>
              ) : (
                <Button variant="outline" onClick={handlePauseInspection} className="flex items-center gap-2">
                  <Pause className="h-4 w-4" />
                  Pausar
                </Button>
              )}
              <Button variant="outline" onClick={handleResetInspection} className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Reiniciar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{currentSample}</div>
              <div className="text-sm text-blue-700">Amostra Atual</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{currentStep + 1}</div>
              <div className="text-sm text-green-700">Etapa Atual</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{currentPhotos}</div>
              <div className="text-sm text-purple-700">Fotos Tiradas</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{requiredPhotos}</div>
              <div className="text-sm text-orange-700">Fotos Necessárias</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Etapa Atual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {currentStepData.name}
              </CardTitle>
              {currentStepData.photoRequired && (
                <div className="flex items-center gap-2 mt-2">
                  <Camera className="h-4 w-4 text-orange-500" />
                  <Badge variant="outline" className="text-orange-700">
                    Fotos Obrigatórias: {currentPhotos}/{requiredPhotos}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Mínimo {currentStepData.minPhotos} foto por item, {currentStepData.photoPercentage}% das amostras
                  </span>
                </div>
              )}
            </div>
            <Badge variant={isCurrentSampleComplete() ? "default" : "secondary"}>
              {isCurrentSampleComplete() ? "Completa" : "Pendente"}
            </Badge>
          </div>
          {currentStepData.helpContent && (
            <p className="text-sm text-gray-600 mt-2">{currentStepData.helpContent}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {currentStepData.items.map((item) => {
              const itemData = currentSampleData?.[item.id];
              
              return (
                <div key={item.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="font-medium">{item.name}</Label>
                        {item.photoRequired && (
                          <Image className="h-4 w-4 text-orange-500" />
                        )}
                        {itemData?.status && (
                          <Badge variant={itemData.status === 'OK' ? 'default' : 'destructive'}>
                            {itemData.status}
                          </Badge>
                        )}
                      </div>
                      
                      {renderItemInput(item)}
                      
                      {/* Observações */}
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-gray-500" />
                          <Label className="text-sm text-gray-600">Observações</Label>
                        </div>
                        <Textarea
                          placeholder="Adicione observações sobre este item..."
                          value={itemData?.observation || ''}
                          onChange={(e) => handleObservationChange(item.id, e.target.value)}
                          className="min-h-[60px]"
                        />
                      </div>
                    </div>
                    
                    {/* Botão de Foto */}
                    {item.photoRequired && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddPhoto(item.id)}
                        className="flex items-center gap-2"
                      >
                        <Camera className="h-4 w-4" />
                        Foto
                      </Button>
                    )}
                  </div>
                  
                  {/* Fotos tiradas */}
                  {itemData?.photos && itemData.photos.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {itemData.photos.map((photo, index) => (
                        <div key={index} className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                          <Image className="h-6 w-6 text-gray-500" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Validações */}
      {currentStep === 0 && currentPhotos < requiredPhotos && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Fotos Obrigatórias Pendentes</span>
            </div>
            <p className="text-sm text-orange-600 mt-1">
              Para materiais gráficos, é obrigatório tirar pelo menos {requiredPhotos} fotos. 
              Atualmente você tem {currentPhotos} fotos.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Navegação */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevStep}>
          Etapa Anterior
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Progresso
          </Button>
          
          <Button 
            onClick={handleNextStep}
            disabled={!isCurrentSampleComplete() || (currentStep === 0 && !areRequiredPhotosTaken())}
            className="flex items-center gap-2"
          >
            {currentStep < steps.length - 1 ? 'Próxima Etapa' : 
             currentSample < data.totalSamples ? 'Próxima Amostra' : 'Finalizar Inspeção'}
            <CheckCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
