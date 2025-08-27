import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { apiRequest } from '@/lib/queryClient';
import { supabase } from '@/lib/supabaseClient';

// Tipos de defeito para classificação
export type DefectType = 'MENOR' | 'MAIOR' | 'CRÍTICO';

// Configuração NQA (Nível de Qualidade Aceitável)
export interface AQLConfig {
  critical: { aql: number; acceptance: number; rejection: number };
  major: { aql: number; acceptance: number; rejection: number };
  minor: { aql: number; acceptance: number; rejection: number };
}

// Status de aprovação
export type ApprovalStatus = 'pending' | 'approved' | 'conditionally_approved' | 'rejected';

// Interface para aprovação condicional
export interface ConditionalApproval {
  id: string;
  inspectionId: string;
  reason: string;
  requestedBy: string;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
}

// Interface para histórico de inspeção
export interface InspectionHistory {
  id: string;
  inspectionId: string;
  action: 'created' | 'updated' | 'approved' | 'conditionally_approved' | 'rejected';
  userId: string;
  timestamp: Date;
  details: string;
  defectCounts?: {
    critical: number;
    major: number;
    minor: number;
  };
}

// Etiquetas padrão do sistema
export const STANDARD_LABELS = [
  { id: 'dun', name: 'DUN', description: 'Etiqueta DUN - Código de barras logístico' },
  { id: 'ean', name: 'EAN', description: 'Etiqueta EAN - Código de barras comercial' },
  { id: 'ence', name: 'ENCE', description: 'Etiqueta ENCE - Certificação energética' },
  { id: 'product_id', name: 'ID (Produto)', description: 'Identificação única do produto' },
  { id: 'noise_seal', name: 'Selo Ruído', description: 'Certificação de ruído' },
  { id: 'anatel_seal', name: 'Selo Anatel', description: 'Certificação Anatel' },
  { id: 'energy', name: 'Energia', description: 'Etiqueta de eficiência energética' },
  { id: 'tag', name: 'Tag', description: 'Tag de identificação' },
  { id: 'qr_code', name: 'Etiqueta QR Code', description: 'Código QR para rastreamento' },
  { id: 'attention', name: 'Etiqueta Atenção', description: 'Avisos e precauções' },
  { id: 'voltage_cable', name: 'Etiqueta Voltagem Cabo Elétrico', description: 'Especificações elétricas do cabo' },
  { id: 'security_seal', name: 'Lacre de Segurança', description: 'Lacre de integridade' },
  { id: 'inmetro_seal', name: 'Etiqueta Selo Inmetro', description: 'Certificação Inmetro' }
];

// Perguntas padrão do sistema com classificação de defeitos
export const STANDARD_QUESTIONS = [
  // 1️⃣ Embalagem
  { 
    id: 'packaging_external', 
    name: 'Embalagem externa sem amassados, rasgos ou deformações', 
    description: 'Verificar integridade da embalagem externa',
    type: 'yes_no' as const,
    category: 'Embalagem',
    defectType: 'MENOR' as DefectType
  },
  { 
    id: 'security_seal', 
    name: 'Lacre de segurança presente e intacto', 
    description: 'Verificar presença e integridade do lacre',
    type: 'yes_no' as const,
    category: 'Embalagem',
    defectType: 'CRÍTICO' as DefectType
  },
  { 
    id: 'packaging_protection', 
    name: 'Embalagem protege o produto corretamente', 
    description: 'Avaliar se a embalagem oferece proteção adequada',
    type: 'yes_no' as const,
    category: 'Embalagem',
    defectType: 'MAIOR' as DefectType
  },
  
  // 2️⃣ Etiquetas
  { 
    id: 'labels_correct', 
    name: 'Etiquetas estão corretas e legíveis', 
    description: 'Verificar precisão e legibilidade das etiquetas',
    type: 'yes_no' as const,
    category: 'Etiquetas',
    defectType: 'CRÍTICO' as DefectType
  },
  { 
    id: 'serial_number', 
    name: 'Número de série visível, legível e presente no produto', 
    description: 'Confirmar presença e legibilidade do número de série',
    type: 'yes_no' as const,
    category: 'Etiquetas',
    defectType: 'CRÍTICO' as DefectType
  },
  { 
    id: 'label_print_quality', 
    name: 'Qualidade da impressão das etiquetas está correta (sem borrões ou distorções)', 
    description: 'Avaliar qualidade da impressão das etiquetas',
    type: 'yes_no' as const,
    category: 'Etiquetas',
    defectType: 'MAIOR' as DefectType
  },
  
  // 3️⃣ Impressão e Aparência
  { 
    id: 'logo_graphics', 
    name: 'Logotipo e gráficos impressos sem falhas', 
    description: 'Verificar qualidade da impressão de logos e gráficos',
    type: 'yes_no' as const,
    category: 'Impressão e Aparência',
    defectType: 'MAIOR' as DefectType
  },
  { 
    id: 'color_fidelity', 
    name: 'Fidelidade de cores corresponde ao padrão aprovado', 
    description: 'Verificar se as cores correspondem ao padrão',
    type: 'yes_no' as const,
    category: 'Impressão e Aparência',
    defectType: 'MAIOR' as DefectType
  },
  { 
    id: 'manual_art', 
    name: 'Arte do manual está correta', 
    description: 'Verificar precisão da arte do manual',
    type: 'yes_no' as const,
    category: 'Impressão e Aparência',
    defectType: 'MENOR' as DefectType
  },
  { 
    id: 'packaging_art', 
    name: 'Arte da embalagem está correta', 
    description: 'Verificar precisão da arte da embalagem',
    type: 'yes_no' as const,
    category: 'Impressão e Aparência',
    defectType: 'MAIOR' as DefectType
  },
  
  // 4️⃣ Produto e Componentes
  { 
    id: 'product_integrity', 
    name: 'Produto sem danos físicos ou funcionais', 
    description: 'Verificar integridade física e funcional do produto',
    type: 'yes_no' as const,
    category: 'Produto e Componentes',
    defectType: 'CRÍTICO' as DefectType
  },
  { 
    id: 'components_complete', 
    name: 'Todos os componentes estão presentes', 
    description: 'Verificar se todos os componentes estão incluídos',
    type: 'yes_no' as const,
    category: 'Produto e Componentes',
    defectType: 'CRÍTICO' as DefectType
  },
  { 
    id: 'accessories_quality', 
    name: 'Acessórios em perfeito estado', 
    description: 'Verificar qualidade dos acessórios',
    type: 'yes_no' as const,
    category: 'Produto e Componentes',
    defectType: 'MAIOR' as DefectType
  },
  
  // 5️⃣ Documentação
  { 
    id: 'manual_present', 
    name: 'Manual do usuário presente e correto', 
    description: 'Verificar presença e correção do manual',
    type: 'yes_no' as const,
    category: 'Documentação',
    defectType: 'MAIOR' as DefectType
  },
  { 
    id: 'warranty_card', 
    name: 'Cartão de garantia presente', 
    description: 'Verificar presença do cartão de garantia',
    type: 'yes_no' as const,
    category: 'Documentação',
    defectType: 'MENOR' as DefectType
  },
  { 
    id: 'certification_docs', 
    name: 'Documentos de certificação presentes', 
    description: 'Verificar presença de certificações obrigatórias',
    type: 'yes_no' as const,
    category: 'Documentação',
    defectType: 'CRÍTICO' as DefectType
  }
];

// Configuração NQA padrão
export const DEFAULT_AQL_CONFIG: AQLConfig = {
  critical: { aql: 0, acceptance: 0, rejection: 1 },
  major: { aql: 2.5, acceptance: 0, rejection: 1 },
  minor: { aql: 4.0, acceptance: 0, rejection: 1 }
};

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
  // Campos específicos para etiquetas
  labelConfig?: {
    pdfUrl?: string;
    isEnabled: boolean;
    requiresPhoto: boolean;
    comparisonType: 'exact' | 'similar' | 'presence';
  };
  // Campos específicos para perguntas
  questionConfig?: {
    questionType: 'yes_no' | 'scale_1_5' | 'scale_1_10' | 'text' | 'multiple_choice' | 'true_false' | 'ok_nok' | 'photo' | 'number' | 'checklist' | 'etiqueta';
    options?: string[];
    correctAnswer?: string;
    defectType: DefectType; // Classificação do defeito
    description?: string;
    // Configuração numérica para receitas
    numericConfig?: {
      minValue: number;
      maxValue: number;
      expectedValue?: number;
      unit?: string;
    };
  };
  // Receita associada à pergunta
  recipe?: {
    name: string;
    description?: string;
    steps: string[];
    // Dados específicos para receita numérica
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

export interface InspectionPlan {
  id: string;
  // Campos do frontend (legacy)
  name?: string;
  productId?: string;
  products?: string[];
  revision?: number;
  validUntil?: Date;
  steps?: InspectionStep[];
  updatedBy?: string;
  tags?: string[];
  efficiency?: {
    avgInspectionTime: number;
    rejectionRate: number;
    topRejectionCauses: string[];
  };
  accessControl?: {
    roles: string[];
    permissions: {
      view: string[];
      edit: string[];
      delete: string[];
      execute: string[];
      approve: string[];
    };
  };
  aqlConfig?: AQLConfig;
  
  // Campos do backend (novos)
  planCode?: string;
  planName?: string;
  planType?: 'product' | 'parts';
  version?: string;
  productCode?: string;
  productName?: string;
  productFamily?: string;
  businessUnit?: 'DIY' | 'TECH' | 'KITCHEN_BEAUTY' | 'MOTOR_COMFORT' | 'N/A';
  inspectionType?: 'functional' | 'graphic' | 'dimensional' | 'electrical' | 'packaging' | 'mixed';
  aqlCritical?: number;
  aqlMajor?: number;
  aqlMinor?: number;
  samplingMethod?: string;
  inspectionLevel?: 'I' | 'II' | 'III';
  inspectionSteps?: string; // JSON
  checklists?: string; // JSON
  requiredParameters?: string; // JSON
  requiredPhotos?: string; // JSON
  labelFile?: string;
  manualFile?: string;
  packagingFile?: string;
  artworkFile?: string;
  additionalFiles?: string; // JSON
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: Date;
  observations?: string;
  specialInstructions?: string;
  isActive?: boolean;
  
  // NOVO: Campos para voltagens
  linkedProducts?: LinkedProduct[];
  voltageConfiguration?: VoltageConfiguration;
  questionsByVoltage?: {
    '127V': InspectionQuestion[];
    '220V': InspectionQuestion[];
    'both': InspectionQuestion[];
  };
  labelsByVoltage?: {
    '127V': LabelConfiguration[];
    '220V': LabelConfiguration[];
  };
  
  // Campos comuns
  status: 'draft' | 'active' | 'inactive' | 'expired' | 'archived';
  createdAt: Date;
  updatedAt?: Date;
}

// NOVO: Interfaces para produtos vinculados
export interface LinkedProduct {
  productId: string;
  productCode: string;
  productName: string;
  voltage: '127V' | '220V' | 'BIVOLT';
  isActive: boolean;
}

// NOVO: Configuração de voltagens
export interface VoltageConfiguration {
  hasSingleVoltage: boolean;
  voltageType: '127V' | '220V' | 'BIVOLT' | 'DUAL';
  supports127V: boolean;
  supports220V: boolean;
  questionsByVoltage: {
    '127V': InspectionQuestion[];
    '220V': InspectionQuestion[];
    'both': InspectionQuestion[];
  };
  labelsByVoltage: {
    '127V': LabelConfiguration[];
    '220V': LabelConfiguration[];
  };
}

// NOVO: Pergunta de inspeção com classificação de defeitos
export interface InspectionQuestion {
  id: string;
  question: string;
  type: 'yes_no' | 'scale_1_5' | 'text' | 'number' | 'photo' | 'ok_nok';
  required: boolean;
  defectType: 'CRITICAL' | 'MAJOR' | 'MINOR';
  defectConfig?: {
    ok_nok?: {
      okValue: string;
      nokValue: string;
    };
    numeric?: {
      min: number;
      max: number;
      unit: string;
      tolerance: number;
    };
    scale?: {
      min: number;
      max: number;
      passThreshold: number;
    };
  };
  voltageSpecific?: {
    '127V'?: {
      expectedValue?: any;
      tolerance?: any;
    };
    '220V'?: {
      expectedValue?: any;
      tolerance?: any;
    };
  };
}

// NOVO: Configuração de etiquetas
export interface LabelConfiguration {
  id: string;
  type: 'EAN' | 'DUN' | 'ENCE' | 'ANATEL' | 'INMETRO' | 'ENERGY' | 'QR_CODE';
  isRequired: boolean;
  templateUrl?: string;
  customText?: string;
  validationRules?: {
    requiresPhoto: boolean;
    comparisonType: 'exact' | 'similar' | 'presence';
  };
}

// NOVO: Resultado de validação
export interface InspectionValidation {
  critical: 'PASS' | 'FAIL';
  major: 'PASS' | 'FAIL';
  minor: 'PASS' | 'FAIL';
  overall: 'APPROVED' | 'REJECTED' | 'CONDITIONAL_APPROVAL';
}

// NOVO: Resultado de inspeção com defeitos
export interface InspectionResult {
  id: string;
  inspectionCode: string;
  planId: string;
  voltage: '127V' | '220V';
  
  // Contadores de defeitos
  defects: {
    critical: number;
    major: number;
    minor: number;
  };
  
  // Limites do AQL
  aqlLimits: {
    critical: number;
    major: number;
    minor: number;
  };
  
  // Status da validação
  validation: InspectionValidation;
  
  // Aprovação condicional
  conditionalApproval?: {
    requested: boolean;
    approvedBy?: string;
    approvedAt?: Date;
    reason?: string;
    conditions?: string[];
  };
  
  // ... outros campos existentes
}

export function useInspectionPlans() {
  const [plans, setPlans] = useState<InspectionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar planos
  const loadPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      // Verificar se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('Usuário não autenticado, redirecionando para login...');
        window.location.href = '/login';
        return;
      }

              const response = await apiRequest('GET', '/api/inspection-plans');
      
      if (!response.ok) {
        if (response.status === 401) {
          console.warn('Token expirado, redirecionando para login...');
          window.location.href = '/login';
          return;
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validar se os dados são um array
      if (!Array.isArray(data)) {
        console.warn('Dados recebidos não são um array:', data);
        setPlans([]);
        return;
      }
      
      setPlans(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro ao carregar planos de inspeção:', err);
      setError(errorMessage);
      setPlans([]); // Definir array vazio em caso de erro
      
      toast({
        title: "Erro",
        description: "Falha ao carregar planos de inspeção",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para transformar dados do frontend para o formato do backend
  const transformPlanDataForBackend = (planData: Omit<InspectionPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Gerar código do plano baseado no nome do produto
    const planCode = `PCG${Date.now().toString().slice(-6)}`;
    
    return {
      planCode,
      planName: planData.name,
      planType: 'product' as const,
      version: 'Rev. 01',
      productId: planData.productId,
      productCode: '', // Será preenchido pelo backend
      productName: planData.productName,
      productFamily: '',
      businessUnit: 'N/A' as const, // Valor padrão
      inspectionType: 'mixed' as const, // Valor padrão
      aqlCritical: planData.aqlConfig?.critical?.aql || 0,
      aqlMajor: planData.aqlConfig?.major?.aql || 2.5,
      aqlMinor: planData.aqlConfig?.minor?.aql || 4.0,
      samplingMethod: 'NBR 5426', // Valor padrão
      inspectionLevel: 'II' as const,
      inspectionSteps: JSON.stringify(planData.steps || []),
      checklists: JSON.stringify((planData.steps || []).map(step => ({
        title: step.name,
        items: step.questions.map(q => ({
          description: q.name,
          required: q.required,
          type: q.questionConfig?.questionType || 'ok_nok'
        }))
      }))),
      requiredParameters: JSON.stringify((planData.steps || []).flatMap(step => 
        step.fields.filter(field => field.type === 'number' || field.type === 'text')
      )),
      requiredPhotos: JSON.stringify((planData.steps || []).flatMap(step => 
        step.questions.filter(q => q.questionConfig?.questionType === 'photo')
      )),
      observations: '',
      specialInstructions: ''
    };
  };

  // Criar plano com etapa padrão
  const createPlan = async (planData: Omit<InspectionPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Adicionar etapa padrão se não existir
      const planWithDefaultStep = {
        ...planData,
        steps: (planData.steps || []).length === 0 ? [DEFAULT_GRAPHIC_INSPECTION_STEP] : (planData.steps || []),
        aqlConfig: planData.aqlConfig || DEFAULT_AQL_CONFIG
      };

      // Transformar dados para o formato do backend
      const backendData = transformPlanDataForBackend(planWithDefaultStep);
      
      console.log('📤 Dados sendo enviados para o backend:', backendData);

              const response = await apiRequest('POST', '/api/inspection-plans', backendData);
      const newPlan = await response.json();
      setPlans(prev => [...prev, newPlan]);
      
      toast({
        title: "Sucesso",
        description: "Plano de inspeção criado com sucesso"
      });
      
      return newPlan;
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao criar plano de inspeção",
        variant: "destructive"
      });
      throw err;
    }
  };

  // Atualizar plano
  const updatePlan = async (id: string, updates: Partial<InspectionPlan>) => {
    try {
      const response = await apiRequest('PATCH', `/api/inspection-plans/${id}`, updates);
      const updatedPlan = await response.json();
      setPlans(prev => prev.map(p => p.id === id ? updatedPlan : p));
      
      toast({
        title: "Sucesso",
        description: `Plano de inspeção atualizado com sucesso (Revisão ${updatedPlan.revision})`
      });
      
      return updatedPlan;
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar plano de inspeção",
        variant: "destructive"
      });
      throw err;
    }
  };

  // Buscar histórico de revisões
  const getPlanRevisions = async (id: string) => {
    try {
      const response = await apiRequest('GET', `/api/inspection-plans/${id}/revisions`);
      return await response.json();
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao carregar histórico de revisões",
        variant: "destructive"
      });
      throw err;
    }
  };

     // Duplicar plano
   const duplicatePlan = async (plan: InspectionPlan) => {
     try {
       // Transformar dados para o formato do backend
       const backendData = transformPlanDataForBackend(plan);
       
       console.log('📤 Duplicando plano:', backendData);

               const response = await apiRequest('POST', '/api/inspection-plans', backendData);
       const newPlan = await response.json();
       setPlans(prev => [...prev, newPlan]);
       
       toast({
         title: "Sucesso",
         description: "Plano de inspeção duplicado com sucesso"
       });
       
       return newPlan;
     } catch (err) {
       toast({
         title: "Erro",
         description: "Falha ao duplicar plano de inspeção",
         variant: "destructive"
       });
       throw err;
     }
   };

  // Excluir plano
  const deletePlan = async (id: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
              await apiRequest('DELETE', `/api/inspection-plans/${id}`);
      setPlans(prev => prev.filter(p => p.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Plano de inspeção excluído com sucesso"
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao excluir plano de inspeção",
        variant: "destructive"
      });
      throw err;
    }
  };

  // Ativar/Desativar plano
  const togglePlanStatus = async (id: string, status: InspectionPlan['status']) => {
    return await updatePlan(id, { status });
  };

  // Exportar plano
  const exportPlan = (plan: InspectionPlan) => {
    const dataStr = JSON.stringify(plan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plano-inspecao-${plan.name}-v${plan.revision}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Importar plano
  const importPlan = async (file: File) => {
    try {
      const text = await file.text();
      const planData = JSON.parse(text);
      
      // Validar estrutura do plano
      if (!planData.name || !planData.steps) {
        throw new Error('Arquivo inválido: estrutura de plano de inspeção não reconhecida');
      }

              const response = await apiRequest('POST', '/api/inspection-plans', planData);
      const newPlan = await response.json();
      setPlans(prev => [...prev, newPlan]);
      
      toast({
        title: "Sucesso",
        description: "Plano de inspeção importado com sucesso"
      });
      
      return newPlan;
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao importar plano de inspeção",
        variant: "destructive"
      });
      throw err;
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
    getPlanRevisions,
    duplicatePlan,
    deletePlan,
    togglePlanStatus,
    exportPlan,
    importPlan,
    loadPlans
  };
}

// Hook para resultados de inspeção
export function useInspectionResults() {
  const [results, setResults] = useState<InspectionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar resultados
  const loadResults = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
      const response = await apiRequest('GET', `${apiUrl}/api/inspection-results`);
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast({
        title: "Erro",
        description: "Falha ao carregar resultados de inspeção",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Criar resultado de inspeção
  const createResult = async (resultData: Omit<InspectionResult, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
      const response = await apiRequest('POST', `${apiUrl}/api/inspection-results`, resultData);
      const newResult = await response.json();
      setResults(prev => [...prev, newResult]);
      
      toast({
        title: "Sucesso",
        description: "Resultado de inspeção criado com sucesso"
      });
      
      return newResult;
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao criar resultado de inspeção",
        variant: "destructive"
      });
      throw err;
    }
  };

  // Atualizar resultado de inspeção
  const updateResult = async (id: string, updates: Partial<InspectionResult>) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
      const response = await apiRequest('PATCH', `${apiUrl}/api/inspection-results/${id}`, updates);
      const updatedResult = await response.json();
      setResults(prev => prev.map(r => r.id === id ? updatedResult : r));
      
      toast({
        title: "Sucesso",
        description: "Resultado de inspeção atualizado com sucesso"
      });
      
      return updatedResult;
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar resultado de inspeção",
        variant: "destructive"
      });
      throw err;
    }
  };

  // Aprovar condicionalmente
  const approveConditionally = async (inspectionId: string, reason: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
      const response = await apiRequest('POST', `${apiUrl}/api/inspection-results/${inspectionId}/conditional-approval`, {
        reason,
        status: 'pending'
      });
      const updatedResult = await response.json();
      setResults(prev => prev.map(r => r.id === inspectionId ? updatedResult : r));
      
      toast({
        title: "Sucesso",
        description: "Solicitação de aprovação condicional enviada"
      });
      
      return updatedResult;
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao solicitar aprovação condicional",
        variant: "destructive"
      });
      throw err;
    }
  };

  // Processar aprovação condicional
  const processConditionalApproval = async (inspectionId: string, approved: boolean, comments?: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
      const response = await apiRequest('PATCH', `${apiUrl}/api/inspection-results/${inspectionId}/conditional-approval`, {
        status: approved ? 'approved' : 'rejected',
        comments
      });
      const updatedResult = await response.json();
      setResults(prev => prev.map(r => r.id === inspectionId ? updatedResult : r));
      
      toast({
        title: "Sucesso",
        description: approved ? "Inspeção aprovada condicionalmente" : "Inspeção rejeitada"
      });
      
      return updatedResult;
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao processar aprovação condicional",
        variant: "destructive"
      });
      throw err;
    }
  };

  // Reprovar inspeção
  const rejectInspection = async (inspectionId: string, reason: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
      const response = await apiRequest('PATCH', `${apiUrl}/api/inspection-results/${inspectionId}/reject`, {
        reason,
        status: 'rejected'
      });
      const updatedResult = await response.json();
      setResults(prev => prev.map(r => r.id === inspectionId ? updatedResult : r));
      
      toast({
        title: "Sucesso",
        description: "Inspeção reprovada com sucesso"
      });
      
      return updatedResult;
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao reprovar inspeção",
        variant: "destructive"
      });
      throw err;
    }
  };

  // Calcular resultados AQL
  const calculateAQLResults = (defectCounts: { critical: number; major: number; minor: number }, aqlConfig: AQLConfig) => {
    return {
      critical: {
        found: defectCounts.critical,
        limit: aqlConfig.critical.rejection,
        passed: defectCounts.critical < aqlConfig.critical.rejection
      },
      major: {
        found: defectCounts.major,
        limit: aqlConfig.major.rejection,
        passed: defectCounts.major < aqlConfig.major.rejection
      },
      minor: {
        found: defectCounts.minor,
        limit: aqlConfig.minor.rejection,
        passed: defectCounts.minor < aqlConfig.minor.rejection
      }
    };
  };

  // Verificar se deve solicitar aprovação condicional
  const shouldRequestConditionalApproval = (aqlResults: any) => {
    return !aqlResults.critical.passed || !aqlResults.major.passed || !aqlResults.minor.passed;
  };

  // Verificar se deve reprovar automaticamente
  const shouldAutoReject = (aqlResults: any) => {
    return !aqlResults.critical.passed; // Defeito crítico sempre reprova
  };

  useEffect(() => {
    loadResults();
  }, []);

  return {
    results,
    loading,
    error,
    createResult,
    updateResult,
    approveConditionally,
    processConditionalApproval,
    rejectInspection,
    calculateAQLResults,
    shouldRequestConditionalApproval,
    shouldAutoReject,
    loadResults
  };
}

// Hook para fila de aprovação
export function useApprovalQueue() {
  const [pendingApprovals, setPendingApprovals] = useState<ConditionalApproval[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Carregar aprovações pendentes
  const loadPendingApprovals = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
      const response = await apiRequest('GET', `${apiUrl}/api/conditional-approvals/pending`);
      const data = await response.json();
      setPendingApprovals(data);
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao carregar fila de aprovação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Processar aprovação
  const processApproval = async (approvalId: string, approved: boolean, comments?: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
      const response = await apiRequest('PATCH', `${apiUrl}/api/conditional-approvals/${approvalId}`, {
        status: approved ? 'approved' : 'rejected',
        comments
      });
      
      // Remover da fila
      setPendingApprovals(prev => prev.filter(a => a.id !== approvalId));
      
      toast({
        title: "Sucesso",
        description: approved ? "Aprovação condicional confirmada" : "Aprovação condicional rejeitada"
      });
      
      return await response.json();
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao processar aprovação",
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  return {
    pendingApprovals,
    loading,
    loadPendingApprovals,
    processApproval
  };
}
