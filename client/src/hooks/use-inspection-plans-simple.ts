import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { apiRequest } from '@/lib/queryClient';

// Tipos básicos
export type DefectType = 'MENOR' | 'MAIOR' | 'CRÍTICO';

// Etapa padrão que será criada automaticamente
export const DEFAULT_GRAPHIC_INSPECTION_STEP = {
  id: 'graphic-inspection-step',
  name: 'INSPEÇÃO MATERIAL GRÁFICO',
  description: 'Inspeção de material gráfico e etiquetas',
  order: 1,
  estimatedTime: 15,
  fields: [],
  questions: [],
  defectType: 'MAIOR' as DefectType
};

export interface InspectionPlan {
  id: string;
  planCode: string;
  planName: string;
  planType: 'product' | 'parts';
  version: string;
  status: 'active' | 'inactive' | 'draft';
  productId?: string;
  productCode?: string;
  productName: string;
  productFamily?: string;
  businessUnit: 'DIY' | 'TECH' | 'KITCHEN_BEAUTY' | 'MOTOR_COMFORT' | 'N/A';
  linkedProducts: any[];
  voltageConfiguration: any;
  inspectionType: 'functional' | 'graphic' | 'dimensional' | 'electrical' | 'packaging' | 'mixed';
  aqlCritical: number;
  aqlMajor: number;
  aqlMinor: number;
  samplingMethod: string;
  inspectionLevel: 'I' | 'II' | 'III';
  inspectionSteps: string;
  checklists: string;
  requiredParameters: string;
  requiredPhotos?: string;
  questionsByVoltage: any;
  labelsByVoltage: any;
  labelFile?: string;
  manualFile?: string;
  packagingFile?: string;
  artworkFile?: string;
  additionalFiles?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  observations?: string;
  specialInstructions?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'photo' | 'file' | 'textarea' | 'label' | 'question';
  required: boolean;
  conditional?: {
    dependsOn: string;
    condition: 'approved' | 'rejected' | 'any';
  };
  photoConfig?: {
    required: boolean;
    quantity: number;
    allowAnnotations: boolean;
    compareWithStandard: boolean;
  };
  options?: string[];
  defaultValue?: any;
  description?: string;
  labelConfig?: {
    pdfUrl?: string;
    isEnabled: boolean;
    requiresPhoto: boolean;
    comparisonType: 'exact' | 'similar' | 'presence';
  };
  questionConfig?: {
    questionType: 'yes_no' | 'scale_1_5' | 'scale_1_10' | 'text' | 'multiple_choice' | 'true_false' | 'ok_nok' | 'photo' | 'number' | 'checklist';
    options?: string[];
    correctAnswer?: string;
    defectType: DefectType;
    description?: string;
    numericConfig?: {
      minValue: number;
      maxValue: number;
      expectedValue?: number;
      unit?: string;
    };
  };
  recipe?: {
    name: string;
    description?: string;
    steps: string[];
    numericRecipe?: {
      minValue: number;
      maxValue: number;
      expectedValue?: number;
      unit?: string;
    };
  };
}

export interface InspectionStep {
  id: string;
  name: string;
  description: string;
  order: number;
  estimatedTime: number;
  fields: InspectionField[];
  questions: InspectionField[];
  defectType: DefectType;
}

// Dados mock temporários
const mockPlans: InspectionPlan[] = [
  {
    id: '1',
    planCode: 'PCG02.049',
    planName: 'Plano de Inspeção - Air Fryer 5L',
    planType: 'product',
    version: 'Rev. 01',
    status: 'active',
    productId: 'PROD001',
    productCode: 'AF-5L-001',
    productName: 'Air Fryer 5L Digital',
    productFamily: 'Eletrodomésticos',
    businessUnit: 'KITCHEN_BEAUTY',
    linkedProducts: [],
    voltageConfiguration: { type: 'bivolt', voltages: ['127V', '220V'] },
    inspectionType: 'mixed',
    aqlCritical: 0.065,
    aqlMajor: 1.0,
    aqlMinor: 2.5,
    samplingMethod: 'Normal',
    inspectionLevel: 'II',
    inspectionSteps: JSON.stringify([DEFAULT_GRAPHIC_INSPECTION_STEP]),
    checklists: '[]',
    requiredParameters: '[]',
    createdBy: 'Sistema',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    planCode: 'PCG02.050',
    planName: 'Plano de Inspeção - Liquidificador Profissional',
    planType: 'product',
    version: 'Rev. 02',
    status: 'draft',
    productId: 'PROD002',
    productCode: 'LP-1000-001',
    productName: 'Liquidificador Profissional 1000W',
    productFamily: 'Eletrodomésticos',
    businessUnit: 'KITCHEN_BEAUTY',
    linkedProducts: [],
    voltageConfiguration: { type: 'bivolt', voltages: ['127V', '220V'] },
    inspectionType: 'functional',
    aqlCritical: 0.065,
    aqlMajor: 1.0,
    aqlMinor: 2.5,
    samplingMethod: 'Normal',
    inspectionLevel: 'II',
    inspectionSteps: JSON.stringify([DEFAULT_GRAPHIC_INSPECTION_STEP]),
    checklists: '[]',
    requiredParameters: '[]',
    createdBy: 'Sistema',
    isActive: true,
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-12T09:15:00Z'
  }
];

export function useInspectionPlans() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<InspectionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('GET', '/api/inspection-plans');

      if (response.ok) {
        const data = await response.json();
        setPlans(data || []);
      } else {
        console.error('Erro na API:', response.status, response.statusText);
        // Se a API falhar, usar dados mock como fallback
        setPlans(mockPlans);
        setError('Erro ao carregar planos da API, usando dados de exemplo');
      }
    } catch (err) {
      console.error('Erro ao carregar planos:', err);
      // Se houver erro, usar dados mock como fallback
      setPlans(mockPlans);
      setError('Erro ao carregar planos da API, usando dados de exemplo');
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (planData: Partial<InspectionPlan>) => {
    try {
      const response = await apiRequest('POST', '/api/inspection-plans', planData);

      if (response.ok) {
        const data = await response.json();
        await loadPlans();
        toast({
          title: 'Sucesso',
          description: 'Plano de inspeção criado com sucesso'
        });
        return data;
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao criar plano de inspeção',
          variant: 'destructive'
        });
        return null;
      }
    } catch (err) {
      console.error('Erro ao criar plano:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao criar plano de inspeção',
        variant: 'destructive'
      });
      return null;
    }
  };

  const updatePlan = async (id: string, planData: Partial<InspectionPlan>) => {
    try {
      const response = await apiRequest('PATCH', `/api/inspection-plans/${id}`, planData);

      if (response.ok) {
        const data = await response.json();
        await loadPlans();
        toast({
          title: 'Sucesso',
          description: 'Plano de inspeção atualizado com sucesso'
        });
        return data;
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao atualizar plano de inspeção',
          variant: 'destructive'
        });
        return null;
      }
    } catch (err) {
      console.error('Erro ao atualizar plano:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar plano de inspeção',
        variant: 'destructive'
      });
      return null;
    }
  };

  const deletePlan = async (id: string) => {
    try {
      const response = await apiRequest('DELETE', `/api/inspection-plans/${id}`);

      if (response.ok) {
        await loadPlans();
        toast({
          title: 'Sucesso',
          description: 'Plano de inspeção excluído com sucesso'
        });
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao excluir plano de inspeção',
          variant: 'destructive'
        });
        return false;
      }
    } catch (err) {
      console.error('Erro ao excluir plano:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir plano de inspeção',
        variant: 'destructive'
      });
      return false;
    }
  };

  const getPlanRevisions = async (id: string) => {
    try {
      const response = await apiRequest('GET', `/api/inspection-plans/${id}/revisions`);

      if (response.ok) {
        const data = await response.json();
        return data || [];
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao carregar revisões',
          variant: 'destructive'
        });
        return [];
      }
    } catch (err) {
      console.error('Erro ao carregar revisões:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar revisões',
        variant: 'destructive'
      });
      return [];
    }
  };

  const duplicatePlan = async (id: string) => {
    try {
      const response = await apiRequest('POST', `/api/inspection-plans/${id}/duplicate`);

      if (response.ok) {
        const data = await response.json();
        await loadPlans();
        toast({
          title: 'Sucesso',
          description: 'Plano de inspeção duplicado com sucesso'
        });
        return data;
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao duplicar plano de inspeção',
          variant: 'destructive'
      });
        return null;
      }
    } catch (err) {
      console.error('Erro ao duplicar plano:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao duplicar plano de inspeção',
        variant: 'destructive'
      });
      return null;
    }
  };

  const exportPlan = async (id: string) => {
    try {
      const response = await apiRequest('GET', `/api/inspection-plans/${id}/export`);

      if (response.ok) {
        const data = await response.json();
        // Criar download do arquivo
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json'
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plano-inspecao-${id}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Sucesso',
          description: 'Plano de inspeção exportado com sucesso'
        });
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao exportar plano de inspeção',
          variant: 'destructive'
        });
        return false;
      }
    } catch (err) {
      console.error('Erro ao exportar plano:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar plano de inspeção',
        variant: 'destructive'
      });
      return false;
    }
  };

  const importPlan = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiRequest('POST', '/api/inspection-plans/import', formData);

      if (response.ok) {
        await loadPlans();
        toast({
          title: 'Sucesso',
          description: 'Plano de inspeção importado com sucesso'
        });
        const data = await response.json();
        return data;
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao importar plano de inspeção',
          variant: 'destructive'
        });
        return null;
      }
    } catch (err) {
      console.error('Erro ao importar plano:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao importar plano de inspeção',
        variant: 'destructive'
      });
      return null;
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  return {
    plans,
    loading,
    error,
    createPlan,
    updatePlan,
    deletePlan,
    getPlanRevisions,
    duplicatePlan,
    exportPlan,
    importPlan,
    loadPlans
  };
}
