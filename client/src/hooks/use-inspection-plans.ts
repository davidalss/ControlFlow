import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { apiRequest } from '@/lib/queryClient';

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

// Perguntas padrão do sistema
export const STANDARD_QUESTIONS = [
  // 1️⃣ Embalagem
  { 
    id: 'packaging_external', 
    name: 'Embalagem externa sem amassados, rasgos ou deformações', 
    description: 'Verificar integridade da embalagem externa',
    type: 'yes_no' as const,
    category: 'Embalagem'
  },
  { 
    id: 'security_seal', 
    name: 'Lacre de segurança presente e intacto', 
    description: 'Verificar presença e integridade do lacre',
    type: 'yes_no' as const,
    category: 'Embalagem'
  },
  { 
    id: 'packaging_protection', 
    name: 'Embalagem protege o produto corretamente', 
    description: 'Avaliar se a embalagem oferece proteção adequada',
    type: 'yes_no' as const,
    category: 'Embalagem'
  },
  
  // 2️⃣ Etiquetas
  { 
    id: 'labels_correct', 
    name: 'Etiquetas estão corretas e legíveis', 
    description: 'Verificar precisão e legibilidade das etiquetas',
    type: 'yes_no' as const,
    category: 'Etiquetas'
  },
  { 
    id: 'serial_number', 
    name: 'Número de série visível, legível e presente no produto', 
    description: 'Confirmar presença e legibilidade do número de série',
    type: 'yes_no' as const,
    category: 'Etiquetas'
  },
  { 
    id: 'label_print_quality', 
    name: 'Qualidade da impressão das etiquetas está correta (sem borrões ou distorções)', 
    description: 'Avaliar qualidade da impressão das etiquetas',
    type: 'yes_no' as const,
    category: 'Etiquetas'
  },
  
  // 3️⃣ Impressão e Aparência
  { 
    id: 'logo_graphics', 
    name: 'Logotipo e gráficos impressos sem falhas', 
    description: 'Verificar qualidade da impressão de logos e gráficos',
    type: 'yes_no' as const,
    category: 'Impressão e Aparência'
  },
  { 
    id: 'color_fidelity', 
    name: 'Fidelidade de cores corresponde ao padrão aprovado', 
    description: 'Verificar se as cores correspondem ao padrão',
    type: 'yes_no' as const,
    category: 'Impressão e Aparência'
  },
  { 
    id: 'manual_art', 
    name: 'Arte do manual está correta', 
    description: 'Verificar precisão da arte do manual',
    type: 'yes_no' as const,
    category: 'Impressão e Aparência'
  },
  { 
    id: 'packaging_art', 
    name: 'Arte da embalagem está correta', 
    description: 'Verificar precisão da arte da embalagem',
    type: 'yes_no' as const,
    category: 'Impressão e Aparência'
  },
  
  // 4️⃣ Produto e Componentes
  { 
    id: 'components_present', 
    name: 'Todos os componentes estão presentes e corretos', 
    description: 'Verificar presença e correção de todos os componentes',
    type: 'yes_no' as const,
    category: 'Produto e Componentes'
  },
  { 
    id: 'connectors_cables', 
    name: 'Conectores, cabos e adaptadores correspondem ao produto aprovado', 
    description: 'Verificar compatibilidade de conectores e cabos',
    type: 'yes_no' as const,
    category: 'Produto e Componentes'
  },
  { 
    id: 'voltage_power', 
    name: 'Voltagem e potência do produto estão corretas e marcadas adequadamente', 
    description: 'Verificar especificações de voltagem e potência',
    type: 'yes_no' as const,
    category: 'Produto e Componentes'
  },
  { 
    id: 'visible_damage', 
    name: 'Componentes não apresentam danos ou defeitos visíveis', 
    description: 'Verificar ausência de danos visíveis',
    type: 'yes_no' as const,
    category: 'Produto e Componentes'
  },
  { 
    id: 'accessories_present', 
    name: 'Todos os acessórios presentes?', 
    description: 'Confirmar presença de todos os acessórios',
    type: 'yes_no' as const,
    category: 'Produto e Componentes'
  },
  
  // 5️⃣ Documentação
  { 
    id: 'manual_revision', 
    name: 'Qual revisão do manual e embalagem?', 
    description: 'Verificar versão/revisão da documentação',
    type: 'text' as const,
    category: 'Documentação'
  },
  { 
    id: 'applications_correct', 
    name: 'Aplicações estão corretas?', 
    description: 'Verificar precisão das informações de aplicação',
    type: 'yes_no' as const,
    category: 'Documentação'
  },
  { 
    id: 'product_risks', 
    name: 'Produto isento de riscos?', 
    description: 'Verificar se o produto está livre de riscos',
    type: 'yes_no' as const,
    category: 'Documentação'
  }
];

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
    questionType: 'yes_no' | 'scale_1_5' | 'text' | 'multiple_choice';
    options?: string[];
    correctAnswer?: string;
  };
}

export interface InspectionStep {
  id: string;
  name: string;
  description: string;
  fields: InspectionField[];
  order: number;
  required: boolean;
  estimatedTime: number;
}

export interface InspectionPlan {
  id: string;
  name: string;
  productId: string;
  productName: string;
  products: Array<{
    id: string;
    code: string;
    description: string;
    voltage: string;
  }>;
  revision: number;
  validUntil: Date;
  status: 'active' | 'draft' | 'expired' | 'archived';
  steps: InspectionStep[];
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  tags: string[];
  efficiency: {
    avgInspectionTime: number;
    rejectionRate: number;
    topRejectionCauses: string[];
  };
  accessControl: {
    roles: string[];
    permissions: {
      view: string[];
      edit: string[];
      delete: string[];
      execute: string[];
      approve: string[];
    };
  };
}

export function useInspectionPlans() {
  const [plans, setPlans] = useState<InspectionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar planos
  const loadPlans = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', '/api/inspection-plans');
      const data = await response.json();
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast({
        title: "Erro",
        description: "Falha ao carregar planos de inspeção",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Criar plano
  const createPlan = async (planData: Omit<InspectionPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiRequest('POST', '/api/inspection-plans', planData);
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
        description: "Plano de inspeção atualizado com sucesso"
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

  // Duplicar plano
  const duplicatePlan = async (plan: InspectionPlan) => {
    const duplicatedPlan = {
      ...plan,
      name: `${plan.name} (Cópia)`,
      revision: plan.revision + 1,
      status: 'draft' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const { id, ...planWithoutId } = duplicatedPlan;
    return await createPlan(planWithoutId);
  };

  // Excluir plano
  const deletePlan = async (id: string) => {
    try {
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
    link.download = `plano-inspecao-${plan.name.replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Importar plano
  const importPlan = async (file: File) => {
    try {
      const text = await file.text();
      const planData = JSON.parse(text);
      return await createPlan(planData);
    } catch (err) {
      toast({
        title: "Erro",
        description: "Arquivo inválido ou corrompido",
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
    duplicatePlan,
    deletePlan,
    togglePlanStatus,
    exportPlan,
    importPlan,
    loadPlans
  };
}
