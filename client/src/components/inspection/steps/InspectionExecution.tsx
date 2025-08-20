import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  Zap,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Eye,
  Settings,
  Target,
  Shield,
  Gauge,
  Package,
  Tag,
  Wrench,
  TestTube,
  BarChart3
} from 'lucide-react';
import InspectionReport from '../InspectionReport';
import InspectionReportsList from '../InspectionReportsList';

interface InspectionItem {
  id: string;
  name: string;
  type: 'checkbox' | 'parameter' | 'label' | 'document';
  status?: 'OK' | 'NOK';
  value?: string;
  unit?: string;
  withinRange?: boolean;
  observation?: string;
  timestamp?: Date;
  photoRequired?: boolean;
  photos?: string[];
  parameter?: {
    min: number;
    max: number;
    target: number;
    unit: string;
  };
  label?: {
    type: string;
    file: string;
    url: string;
  };
  document?: {
    name: string;
    type: string;
    url: string;
  };
}

interface InspectionStep {
  id: string;
  name: string;
  type: 'functional' | 'non-functional' | 'safety' | 'compliance';
  description: string;
  order: number;
  samplePercentage: number;
  photoRequired: boolean;
  photoPercentage: number;
  minPhotos: number;
  helpContent: string;
  items: InspectionItem[];
  icon: React.ComponentType<any>;
  color: string;
}

interface InspectionExecutionData {
  currentStep: number;
  currentSample: number;
  totalSamples: number;
  sampleSize: number;
  inspectionType?: string;
  quantity?: number;
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
  const [showReport, setShowReport] = useState(false);
  const [showReportsList, setShowReportsList] = useState(false);

  // ✅ PLANO DE INSPEÇÃO PROFISSIONAL E DINÂMICO
  const createInspectionPlan = (): InspectionStep[] => {
    return [
      {
        id: 'packaging-graphics',
        name: 'Embalagem e Materiais Gráficos',
        type: 'non-functional',
        description: 'Inspeção visual de embalagem, manuais, etiquetas e materiais impressos',
        order: 1,
        samplePercentage: 30,
      photoRequired: true,
      photoPercentage: 20,
      minPhotos: 1,
        helpContent: 'Documentar com fotos a qualidade da impressão, cores, textos e integridade da embalagem',
        icon: Package,
        color: 'blue',
        items: [
          { id: 'packaging-integrity', name: 'Integridade da Embalagem', type: 'checkbox', photoRequired: true },
          { id: 'manual-quality', name: 'Qualidade do Manual', type: 'checkbox', photoRequired: true },
          { id: 'label-completeness', name: 'Completude das Etiquetas', type: 'checkbox', photoRequired: true },
          { id: 'print-quality', name: 'Qualidade da Impressão', type: 'checkbox', photoRequired: true },
          { id: 'color-fidelity', name: 'Fidelidade de Cores', type: 'checkbox', photoRequired: true },
          { id: 'text-legibility', name: 'Legibilidade dos Textos', type: 'checkbox', photoRequired: true },
          { id: 'graphic-alignment', name: 'Alinhamento Gráfico', type: 'checkbox', photoRequired: true }
        ]
      },
      {
        id: 'safety-compliance',
        name: 'Conformidade e Segurança',
        type: 'compliance',
        description: 'Verificação de etiquetas obrigatórias e conformidade regulatória',
        order: 2,
        samplePercentage: 30,
        photoRequired: true,
        photoPercentage: 15,
        minPhotos: 1,
        helpContent: 'Conferir presença e legibilidade de todas as etiquetas obrigatórias',
        icon: Shield,
        color: 'red',
        items: [
          { id: 'ean-label', name: 'Etiqueta EAN', type: 'label', photoRequired: true, label: { type: 'EAN', file: 'ean-label.pdf', url: '#' } },
          { id: 'dun-label', name: 'Etiqueta DUN', type: 'label', photoRequired: true, label: { type: 'DUN', file: 'dun-label.pdf', url: '#' } },
          { id: 'anatel-seal', name: 'Selo ANATEL', type: 'label', photoRequired: true, label: { type: 'ANATEL', file: 'anatel-seal.pdf', url: '#' } },
          { id: 'inmetro-seal', name: 'Selo INMETRO', type: 'label', photoRequired: true, label: { type: 'INMETRO', file: 'inmetro-seal.pdf', url: '#' } },
          { id: 'safety-warnings', name: 'Avisos de Segurança', type: 'checkbox', photoRequired: true },
          { id: 'voltage-info', name: 'Informações de Tensão', type: 'checkbox', photoRequired: true },
          { id: 'power-rating', name: 'Especificação de Potência', type: 'checkbox', photoRequired: true }
        ]
      },
      {
        id: 'physical-integrity',
        name: 'Integridade Física',
        type: 'non-functional',
        description: 'Verificação de danos físicos, montagem e acabamento',
        order: 3,
        samplePercentage: 30,
        photoRequired: true,
        photoPercentage: 10,
        minPhotos: 1,
        helpContent: 'Inspecionar integridade física, montagem correta e qualidade do acabamento',
        icon: Eye,
        color: 'green',
        items: [
          { id: 'physical-damage', name: 'Danos Físicos', type: 'checkbox', photoRequired: true },
          { id: 'missing-parts', name: 'Peças Ausentes', type: 'checkbox', photoRequired: true },
          { id: 'assembly-quality', name: 'Qualidade da Montagem', type: 'checkbox', photoRequired: true },
          { id: 'finish-quality', name: 'Qualidade do Acabamento', type: 'checkbox', photoRequired: true },
          { id: 'surface-defects', name: 'Defeitos de Superfície', type: 'checkbox', photoRequired: true },
          { id: 'component-alignment', name: 'Alinhamento de Componentes', type: 'checkbox', photoRequired: true }
        ]
      },
      {
        id: 'dimensional-verification',
        name: 'Verificação Dimensional',
        type: 'non-functional',
        description: 'Medições de dimensões, peso e volume conforme especificação',
        order: 4,
        samplePercentage: 30,
        photoRequired: false,
        photoPercentage: 0,
        minPhotos: 0,
        helpContent: 'Medir dimensões, peso e volume com instrumentos calibrados',
        icon: Target,
        color: 'purple',
        items: [
          { id: 'length', name: 'Comprimento', type: 'parameter', unit: 'mm', parameter: { min: 0, max: 1000, target: 500, unit: 'mm' } },
          { id: 'width', name: 'Largura', type: 'parameter', unit: 'mm', parameter: { min: 0, max: 500, target: 300, unit: 'mm' } },
          { id: 'height', name: 'Altura', type: 'parameter', unit: 'mm', parameter: { min: 0, max: 400, target: 200, unit: 'mm' } },
          { id: 'weight', name: 'Peso', type: 'parameter', unit: 'kg', parameter: { min: 0, max: 50, target: 5, unit: 'kg' } },
          { id: 'volume', name: 'Volume', type: 'parameter', unit: 'L', parameter: { min: 0, max: 100, target: 20, unit: 'L' } }
        ]
      },
      {
        id: 'electrical-parameters',
      name: 'Parâmetros Elétricos',
        type: 'functional',
        description: 'Teste de parâmetros elétricos com instrumentos de medição',
        order: 5,
        samplePercentage: 100,
        photoRequired: true,
        photoPercentage: 25,
        minPhotos: 1,
        helpContent: 'Medir parâmetros elétricos com multímetro calibrado em condições padrão',
        icon: Gauge,
        color: 'orange',
        items: [
          { id: 'voltage', name: 'Tensão de Operação', type: 'parameter', unit: 'V', photoRequired: true, parameter: { min: 110, max: 127, target: 120, unit: 'V' } },
          { id: 'current', name: 'Corrente de Consumo', type: 'parameter', unit: 'A', photoRequired: true, parameter: { min: 0.5, max: 2.0, target: 1.0, unit: 'A' } },
          { id: 'power', name: 'Potência Nominal', type: 'parameter', unit: 'W', photoRequired: true, parameter: { min: 50, max: 200, target: 100, unit: 'W' } },
          { id: 'frequency', name: 'Frequência', type: 'parameter', unit: 'Hz', photoRequired: true, parameter: { min: 59, max: 61, target: 60, unit: 'Hz' } },
          { id: 'power-factor', name: 'Fator de Potência', type: 'parameter', unit: '', photoRequired: true, parameter: { min: 0.8, max: 1.0, target: 0.95, unit: '' } }
        ]
      },
      {
        id: 'functional-testing',
        name: 'Testes Funcionais',
        type: 'functional',
        description: 'Teste de funcionalidades principais do produto',
        order: 6,
        samplePercentage: 100,
        photoRequired: true,
        photoPercentage: 30,
        minPhotos: 2,
        helpContent: 'Testar todas as funcionalidades principais conforme especificação técnica',
        icon: TestTube,
        color: 'cyan',
        items: [
          { id: 'power-on', name: 'Ligamento/Desligamento', type: 'checkbox', photoRequired: true },
          { id: 'main-function', name: 'Função Principal', type: 'checkbox', photoRequired: true },
          { id: 'safety-features', name: 'Recursos de Segurança', type: 'checkbox', photoRequired: true },
          { id: 'control-response', name: 'Resposta dos Controles', type: 'checkbox', photoRequired: true },
          { id: 'noise-level', name: 'Nível de Ruído', type: 'parameter', unit: 'dB', photoRequired: true, parameter: { min: 0, max: 80, target: 50, unit: 'dB' } },
          { id: 'temperature-control', name: 'Controle de Temperatura', type: 'checkbox', photoRequired: true }
        ]
      },
      {
        id: 'accessories-documentation',
        name: 'Acessórios e Documentação',
        type: 'non-functional',
        description: 'Verificação de acessórios incluídos e documentação técnica',
        order: 7,
        samplePercentage: 30,
        photoRequired: true,
        photoPercentage: 15,
        minPhotos: 1,
        helpContent: 'Conferir presença e qualidade de acessórios e documentação',
        icon: Wrench,
        color: 'indigo',
        items: [
          { id: 'accessories-completeness', name: 'Completude dos Acessórios', type: 'checkbox', photoRequired: true },
          { id: 'accessories-quality', name: 'Qualidade dos Acessórios', type: 'checkbox', photoRequired: true },
          { id: 'manual-included', name: 'Manual Incluído', type: 'document', photoRequired: true, document: { name: 'Manual do Usuário', type: 'manual', url: '#' } },
          { id: 'warranty-card', name: 'Cartão de Garantia', type: 'checkbox', photoRequired: true },
          { id: 'certificate-included', name: 'Certificados Incluídos', type: 'checkbox', photoRequired: true }
        ]
      }
    ];
  };

  const [steps] = useState(createInspectionPlan());

  // ✅ CÁLCULO CORRETO DAS FOTOS NECESSÁRIAS
  // Baseado nas regras: N inspeções devem ter fotos de TODOS os campos
  const calculateRequiredPhotos = useCallback((totalSamples: number, currentStepData: InspectionStep) => {
    if (!totalSamples || totalSamples <= 0) return 0;
    
    // Se não é etapa de material gráfico, não há fotos obrigatórias
    if (currentStepData.type !== 'non-functional' && currentStepData.id !== 'packaging-graphics') {
      return 0;
    }
    
    // LÓGICA ESPECÍFICA PARA BONIFICAÇÃO
    if (data.inspectionType === 'bonification') {
      const quantity = data.quantity || 1;
      
      // Se quantidade = 1: foto de todos os campos
      if (quantity === 1) {
        return 1; // 1 inspeção com fotos de todos os campos
      }
      
      // Se quantidade > 1: foto apenas de 1 inspeção com todos os campos
      return 1; // Sempre 1 inspeção com fotos, independente da quantidade
    }
    
    // LÓGICA PARA CONTAINER (mantida como estava)
    // Material gráfico: 30% da quantidade total
    const graphicSample = Math.ceil(totalSamples * 0.3);
    
    // Fotos obrigatórias: 20% da amostra gráfica = número de inspeções que devem ter fotos
    const requiredInspections = Math.ceil(graphicSample * 0.2);
    
    // Mínimo de 1 inspeção se há amostra gráfica
    return graphicSample > 0 ? Math.max(requiredInspections, 1) : 0;
  }, [data.inspectionType, data.quantity]);

  // ✅ VERIFICAR SE FOTO É OBRIGATÓRIA PARA O CAMPO ATUAL
  const isPhotoRequiredForField = useCallback((itemId: string) => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return false;
    
    // Verificar se é etapa de material gráfico
    if (currentStepData.type === 'non-functional' || currentStepData.id === 'packaging-graphics') {
      const item = currentStepData.items.find(item => item.id === itemId);
      return item?.photoRequired || false;
    }
    
    return false;
  }, [currentStep, steps]);

  // ✅ VERIFICAR SE FOTO FOI ADICIONADA PARA O CAMPO
  const hasPhotoForField = useCallback((itemId: string) => {
    const currentSampleData = samples[currentSample];
    if (!currentSampleData) return false;
    
    const stepData = currentSampleData[steps[currentStep]?.id];
    if (!stepData) return false;
    
    const itemData = stepData[itemId];
    return itemData?.photos && itemData.photos.length > 0;
  }, [samples, currentSample, currentStep, steps]);

  // ✅ CÁLCULOS AUTOMÁTICOS PARA O INSPETOR
  // Usar o sampleSize calculado pela tabela NQA como totalSamples
  const totalSamples = data.sampleSize || data.totalSamples || 0;
  const graphicSample = Math.ceil(totalSamples * 0.3); // 30% para material gráfico
  const functionalSample = totalSamples; // 100% para inspeção funcional
  
  // Calcular fotos obrigatórias baseado na etapa atual
  const currentStepData = steps[currentStep];
  const requiredPhotos = calculateRequiredPhotos(totalSamples, currentStepData);
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
    const totalSamples = data.sampleSize || data.totalSamples || 0;
    for (let sample = 1; sample <= totalSamples; sample++) {
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
  }, [samples, data.sampleSize, data.totalSamples, steps]);

  // ✅ Verificar se fotos obrigatórias foram tiradas
  const areRequiredPhotosTaken = useCallback(() => {
    if (currentStep === 0) { // Materiais Gráficos
      // Verificar se a amostra atual tem fotos de todos os campos
      const currentSampleData = samples[currentSample];
      if (!currentSampleData || !currentSampleData[steps[currentStep].id]) return false;
      
      const stepData = currentSampleData[steps[currentStep].id];
      const fieldsRequiringPhotos = steps[currentStep].items.filter(item => item.photoRequired);
      
      // Verificar se todos os campos que requerem foto têm pelo menos 1 foto
      const fieldsWithPhotos = fieldsRequiringPhotos.filter(item => 
        stepData[item.id]?.photos && stepData[item.id]!.photos!.length > 0
      );
      
      return fieldsWithPhotos.length === fieldsRequiringPhotos.length;
    }
    return true;
  }, [currentStep, currentSample, samples, steps]);

  // ✅ Verificar se todas as unidades foram inspecionadas conforme a amostra
  const areAllUnitsInspected = useCallback(() => {
    // Verificar se todas as amostras foram completadas
    if (!areAllSamplesComplete()) return false;
    
    // Verificar se fotos obrigatórias foram tiradas
    if (!areRequiredPhotosTaken()) return false;
    
    return true;
  }, [areAllSamplesComplete, areRequiredPhotosTaken]);

  // ✅ FUNÇÃO DE CÁLCULO DE RESULTADOS E CRITICIDADE
  const calcularResultados = useCallback(() => {
    let resultados = { critico: 0, menor: 0, total: 0 };
    
    // Percorrer todas as amostras e etapas
    Object.keys(samples).forEach(sampleId => {
      const sampleData = samples[Number(sampleId)];
      Object.keys(sampleData).forEach(stepId => {
        const stepData = sampleData[stepId];
        const currentStep = steps.find(step => step.id === stepId);
        
        if (!currentStep) return;
        
        Object.keys(stepData).forEach(itemId => {
          const itemData = stepData[itemId];
          const currentItem = currentStep.items.find(item => item.id === itemId);
          
          if (!currentItem || !itemData.status) return;
          
          resultados.total++;
          
          // Aplicar regras de criticidade
          if (itemData.status === 'NOK') {
            if (currentStep.type === 'functional') {
              // Todos os itens funcionais → sempre crítico
              resultados.critico++;
            } else if (currentStep.type === 'non-functional') {
              // Itens gráficos → menor critério, exceto quando forem informações de manual ou faltar algum item
              if (itemId.includes('manual') || itemId.includes('missing') || itemId.includes('completeness')) {
                resultados.critico++;
              } else {
                resultados.menor++;
              }
            } else if (currentStep.type === 'compliance') {
              // Etiqueta de identificação → sempre crítico
              resultados.critico++;
            }
          }
        });
      });
    });
    
    return resultados;
  }, [samples, steps]);

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
    
    // ✅ Preservar dados existentes (fotos, observações, etc.)
    const existingData = newSamples[currentSample][steps[currentStep].id][itemId] || {};
    
    newSamples[currentSample][steps[currentStep].id][itemId] = {
      ...existingData, // Manter fotos, observações e outros dados
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
    
    // ✅ Preservar dados existentes (fotos, observações, etc.)
    const existingData = newSamples[currentSample][steps[currentStep].id][itemId] || {};
    
    newSamples[currentSample][steps[currentStep].id][itemId] = {
      ...existingData, // Manter fotos, observações e outros dados
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
    
    // ✅ Preservar dados existentes (fotos, status, etc.)
    const existingData = newSamples[currentSample][steps[currentStep].id][itemId] || {};
    
    newSamples[currentSample][steps[currentStep].id][itemId] = {
      ...existingData, // Manter fotos, status e outros dados
      observation
    };
    
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
    
    // ✅ Preservar dados existentes (status, observações, etc.)
    const existingData = newSamples[currentSample][steps[currentStep].id][itemId] || {};
    const existingPhotos = existingData.photos || [];
    
    newSamples[currentSample][steps[currentStep].id][itemId] = {
      ...existingData, // Manter status, observações e outros dados
      photos: [...existingPhotos, `foto_${Date.now()}.jpg`]
    };
    
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
       alert(`É obrigatório tirar fotos de TODOS os campos para esta amostra de materiais gráficos.`);
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
      if (currentSample < totalSamples) {
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
             <Button
               variant={currentData?.status === 'OK' ? 'default' : 'outline'}
               size="sm"
               onClick={() => handleItemCheck(item.id, 'OK')}
               className={`${currentData?.status === 'OK' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-50'}`}
             >
               <CheckCircle className="h-4 w-4 mr-1" />
               OK
             </Button>
             <Button
               variant={currentData?.status === 'NOK' ? 'default' : 'outline'}
               size="sm"
               onClick={() => handleItemCheck(item.id, 'NOK')}
               className={`${currentData?.status === 'NOK' ? 'bg-red-600 hover:bg-red-700' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
             >
               <XCircle className="h-4 w-4 mr-1" />
               N/OK
             </Button>
          </div>
        </div>
      );
    } else if (item.type === 'parameter') {
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
          {item.parameter && (
            <div className="text-xs text-gray-500">
              {item.parameter.min} - {item.parameter.max} {item.parameter.unit}
            </div>
          )}
        </div>
      );
         } else if (item.type === 'label') {
       return (
         <div className="flex items-center gap-4">
           <div className="flex items-center space-x-2">
             <Button
               variant={currentData?.status === 'OK' ? 'default' : 'outline'}
               size="sm"
               onClick={() => handleItemCheck(item.id, 'OK')}
               className={`${currentData?.status === 'OK' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-50'}`}
             >
               <CheckCircle className="h-4 w-4 mr-1" />
               Presente
             </Button>
             <Button
               variant={currentData?.status === 'NOK' ? 'default' : 'outline'}
               size="sm"
               onClick={() => handleItemCheck(item.id, 'NOK')}
               className={`${currentData?.status === 'NOK' ? 'bg-red-600 hover:bg-red-700' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
             >
               <XCircle className="h-4 w-4 mr-1" />
               N/OK
             </Button>
           </div>
          {item.label && (
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Ver {item.label.type}
            </Button>
          )}
        </div>
      );
         } else if (item.type === 'document') {
       return (
         <div className="flex items-center gap-4">
           <div className="flex items-center space-x-2">
             <Button
               variant={currentData?.status === 'OK' ? 'default' : 'outline'}
               size="sm"
               onClick={() => handleItemCheck(item.id, 'OK')}
               className={`${currentData?.status === 'OK' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-50'}`}
             >
               <CheckCircle className="h-4 w-4 mr-1" />
               Presente
             </Button>
             <Button
               variant={currentData?.status === 'NOK' ? 'default' : 'outline'}
               size="sm"
               onClick={() => handleItemCheck(item.id, 'NOK')}
               className={`${currentData?.status === 'NOK' ? 'bg-red-600 hover:bg-red-700' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
             >
               <XCircle className="h-4 w-4 mr-1" />
               N/OK
             </Button>
           </div>
          {item.document && (
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Ver {item.document.name}
            </Button>
          )}
        </div>
      );
    }
  };

  // ✅ COMPONENTE DE OBSERVAÇÕES COMPACTO MELHORADO
  const CompactObservations = ({ itemId, currentValue, onChange }: { 
    itemId: string; 
    currentValue: string; 
    onChange: (value: string) => void; 
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasObservations = currentValue && currentValue.trim().length > 0;

    return (
      <div className="mt-3">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-4 w-4 text-gray-500" />
          <Label className="text-sm text-gray-600">Observações</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
          {hasObservations && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
              {currentValue.length} chars
            </Badge>
          )}
        </div>
        
        {isExpanded ? (
          <Textarea
            placeholder="Adicione observações sobre este item..."
            value={currentValue}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        ) : (
          <div 
            className="p-2 border border-gray-200 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setIsExpanded(true)}
          >
            {hasObservations ? (
              <p className="text-sm text-gray-700 line-clamp-2">{currentValue}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">Clique para adicionar observações...</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const currentSampleData = samples[currentSample]?.[currentStepData.id];

  return (
    <TooltipProvider>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="inspection-execution-step space-y-6"
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
                  Amostra {currentSample} de {totalSamples} - {currentStepData.name}
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
            {/* ✅ PAINEL DE CÁLCULOS AUTOMÁTICOS MELHORADO */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-900">Cálculos Automáticos - NQA</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-blue-700 font-medium">Total a inspecionar:</span>
                  <Badge variant="outline" className="bg-white font-mono">{totalSamples} unidades</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-700 font-medium">Material gráfico:</span>
                  <Badge variant="outline" className="bg-white font-mono">{graphicSample} unidades (30%)</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-700 font-medium">Inspeção funcional:</span>
                  <Badge variant="outline" className="bg-white font-mono">{functionalSample} unidades (100%)</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-700 font-medium">Inspeções com fotos:</span>
                  <Badge variant="outline" className="bg-white font-mono">{requiredPhotos} inspeções (20% da amostra gráfica)</Badge>
                </div>
              </div>
              <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                <strong>Regra:</strong> {requiredPhotos} inspeções devem ter fotos de TODOS os campos gráficos
              </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{currentSample}</div>
              <div className="text-sm text-blue-700">Amostra Atual</div>
                <div className="text-xs text-blue-600 mt-1">de {totalSamples}</div>
            </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{currentStep + 1}</div>
              <div className="text-sm text-green-700">Etapa Atual</div>
                <div className="text-xs text-green-600 mt-1">de {steps.length}</div>
            </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{currentPhotos}</div>
              <div className="text-sm text-purple-700">Fotos Tiradas</div>
                <div className="text-xs text-purple-600 mt-1">Total</div>
                  </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{requiredPhotos}</div>
              <div className="text-sm text-orange-700">Fotos Necessárias</div>
                <div className="text-xs text-orange-600 mt-1">20% da amostra gráfica</div>
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
                  <currentStepData.icon className={`h-5 w-5 text-${currentStepData.color}-600`} />
                {currentStepData.name}
              </CardTitle>
                <p className="text-sm text-gray-600 mt-1">{currentStepData.description}</p>
              {currentStepData.photoRequired && (
                <div className="flex items-center gap-2 mt-2">
                  <Camera className="h-4 w-4 text-orange-500" />
                  <Badge variant="outline" className="text-orange-700">
                      Fotos Obrigatórias: {currentSample}/{requiredPhotos}
                  </Badge>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <div className="space-y-1">
                          <p><strong>Regra de Fotos:</strong></p>
                          <p>• Material gráfico: {graphicSample} unidades (30% do total)</p>
                          <p>• Inspeções com fotos: {requiredPhotos} inspeções (20% da amostra gráfica)</p>
                          <p>• Cada inspeção: fotos de TODOS os campos</p>
                          <p>• Campos que requerem foto: {currentStepData.items.filter(item => item.photoRequired).length}</p>
                          <p>• Status atual: {hasPhotoForField(currentStepData.items[0]?.id) ? '✅ Fotos adicionadas' : '❌ Fotos pendentes'}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
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
                            <div className="flex items-center gap-1">
                              {hasPhotoForField(item.id) ? (
                                <Image className="h-4 w-4 text-green-500" />
                              ) : (
                                <Image className="h-4 w-4 text-red-500 animate-pulse" />
                              )}
                              {!hasPhotoForField(item.id) && isPhotoRequiredForField(item.id) && (
                                <Badge variant="destructive" className="text-xs">
                                  Foto Obrigatória
                                </Badge>
                              )}
                            </div>
                        )}
                        {itemData?.status && (
                          <Badge variant={itemData.status === 'OK' ? 'default' : 'destructive'}>
                            {itemData.status}
                          </Badge>
                        )}
                      </div>
                      
                      {renderItemInput(item)}
                      
                        {/* ✅ Observações Compactas */}
                        <CompactObservations
                          itemId={item.id}
                          currentValue={itemData?.observation || ''}
                          onChange={(value) => handleObservationChange(item.id, value)}
                        />
            </div>
                    
                      {/* Botão de Foto com Status Visual */}
                    {item.photoRequired && (
              <Button
                          variant={hasPhotoForField(item.id) ? "default" : "outline"}
                size="sm"
                        onClick={() => handleAddPhoto(item.id)}
                          className={`flex items-center gap-2 ${
                            hasPhotoForField(item.id) 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'border-red-500 text-red-600 hover:bg-red-50'
                          }`}
              >
                        <Camera className="h-4 w-4" />
                          {hasPhotoForField(item.id) ? 'Foto Adicionada' : 'Adicionar Foto'}
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

        {/* ✅ Validações Melhoradas */}
        {currentStep === 0 && !areRequiredPhotosTaken() && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Fotos Obrigatórias Pendentes</span>
            </div>
              <div className="text-sm text-orange-600 mt-2 space-y-1">
                <p>• <strong>Regra:</strong> {requiredPhotos} inspeções devem ter fotos de TODOS os campos gráficos</p>
                <p>• Material gráfico: {graphicSample} unidades (30% do total)</p>
                <p>• Inspeções com fotos: {requiredPhotos} inspeções (20% da amostra gráfica)</p>
                <p>• Amostra atual: {currentSample}</p>
                <p>• Campos que requerem foto: {currentStepData.items.filter(item => item.photoRequired).length}</p>
                <p>• <strong>Ação:</strong> Adicione fotos em todos os campos marcados com ícone vermelho</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ✅ Validação Final */}
        {currentStep === steps.length - 1 && currentSample === totalSamples && !areAllUnitsInspected() && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Inspeção Incompleta</span>
              </div>
              <div className="text-sm text-red-600 mt-2 space-y-1">
                <p>• <strong>Verificação:</strong> Todas as {totalSamples} amostras foram inspecionadas?</p>
                <p>• <strong>Fotos:</strong> {requiredPhotos} inspeções têm fotos de todos os campos?</p>
                <p>• <strong>Etapas:</strong> Todas as {steps.length} etapas foram completadas?</p>
                <p>• <strong>Ação:</strong> Complete todos os itens pendentes antes de finalizar</p>
              </div>
          </CardContent>
        </Card>
      )}

      {/* Navegação */}
      <div className="wizard-navigation flex justify-between">
        <Button variant="outline" onClick={handlePrevStep}>
          Etapa Anterior
              </Button>
            
            <div className="flex items-center gap-2">
             <Button 
               variant="outline" 
               className="flex items-center gap-2"
               onClick={() => setShowReportsList(true)}
             >
               <BarChart3 className="h-4 w-4" />
               Relatórios de Inspeção
             </Button>
             
             <Button 
               variant="outline" 
               className="flex items-center gap-2"
               onClick={() => setShowReport(true)}
             >
               <FileText className="h-4 w-4" />
               Relatório Atual
             </Button>
             
          <Button variant="outline" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Progresso
              </Button>
              
              <Button
                onClick={handleNextStep}
            disabled={!isCurrentSampleComplete() || (currentStep === 0 && !areRequiredPhotosTaken())}
            className="flex items-center gap-2"
               title={
                 !isCurrentSampleComplete() 
                   ? 'Complete todos os itens da etapa atual' 
                   : currentStep === 0 && !areRequiredPhotosTaken()
                   ? 'Adicione fotos em todos os campos obrigatórios'
                   : ''
               }
          >
            {currentStep < steps.length - 1 ? 'Próxima Etapa' : 
                currentSample < totalSamples ? 'Próxima Amostra' : 'Finalizar Inspeção'}
            <CheckCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
    </motion.div>
       
       {/* ✅ Modal de Relatório */}
       {showReport && (
         <InspectionReport
           inspectionData={{
             ...data,
             samples,
             steps,
             currentStep,
             currentSample,
             startTime
           }}
           onClose={() => setShowReport(false)}
         />
       )}

       {/* ✅ Modal de Lista de Relatórios */}
       {showReportsList && (
         <InspectionReportsList
           onClose={() => setShowReportsList(false)}
           onViewReport={(report) => {
             console.log('Visualizando relatório:', report);
             setShowReportsList(false);
             // Aqui você pode implementar a visualização do relatório específico
             alert(`Visualizando relatório: ${report.product.code} - ${report.product.description}`);
           }}
         />
       )}
     </TooltipProvider>
  );
}
