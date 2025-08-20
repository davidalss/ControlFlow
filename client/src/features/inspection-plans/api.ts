// src/features/inspection-plans/api.ts
import { http, type HttpRequestMeta } from "@/lib/http";
import { generateCorrelationId } from "@/lib/logger";

// Types baseados no sistema existente
export type PlanDTO = {
  id: string;
  planCode: string;
  planName: string;
  planType: 'product' | 'parts';
  version: string;
  status: 'draft' | 'active' | 'inactive' | 'expired' | 'archived';
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
};

export type UpsertPlanDTO = Partial<Omit<PlanDTO, 'id' | 'createdAt' | 'updatedAt'>>;

export type PlanListResponse = {
  plans: PlanDTO[];
  total: number;
  page: number;
  limit: number;
};

export type PlanFilters = {
  status?: string;
  businessUnit?: string;
  inspectionType?: string;
  search?: string;
  page?: number;
  limit?: number;
};

// Configuração da API
const API_BASE = import.meta.env.VITE_API_URL || 'https://enso-backend-0aa1.onrender.com';
const FEATURE = 'inspection-plans';

// Helper para criar meta padrão
function createMeta(action: string, correlationId?: string): HttpRequestMeta {
  return {
    feature: FEATURE,
    action,
    correlationId: correlationId || generateCorrelationId(),
    timeout: 30000 // 30 segundos timeout
  };
}

/**
 * Lista todos os planos de inspeção com filtros opcionais
 */
export async function listPlans(
  filters: PlanFilters = {},
  correlationId?: string
): Promise<PlanDTO[]> {
  const url = new URL(`${API_BASE}/api/inspection-plans`);
  
  // Adicionar filtros como query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });

  return http.get<PlanDTO[]>(
    url.toString(),
    createMeta('list', correlationId)
  );
}

/**
 * Busca um plano específico por ID
 */
export async function getPlan(
  id: string,
  correlationId?: string
): Promise<PlanDTO> {
  return http.get<PlanDTO>(
    `${API_BASE}/api/inspection-plans/${id}`,
    createMeta('get', correlationId)
  );
}

/**
 * Cria um novo plano de inspeção
 */
export async function createPlan(
  payload: UpsertPlanDTO,
  correlationId?: string
): Promise<PlanDTO> {
  return http.post<PlanDTO>(
    `${API_BASE}/api/inspection-plans`,
    payload,
    createMeta('create', correlationId)
  );
}

/**
 * Atualiza um plano existente
 */
export async function updatePlan(
  id: string,
  payload: UpsertPlanDTO,
  correlationId?: string
): Promise<PlanDTO> {
  return http.put<PlanDTO>(
    `${API_BASE}/api/inspection-plans/${id}`,
    payload,
    createMeta('update', correlationId)
  );
}

/**
 * Atualiza parcialmente um plano existente
 */
export async function patchPlan(
  id: string,
  payload: Partial<UpsertPlanDTO>,
  correlationId?: string
): Promise<PlanDTO> {
  return http.patch<PlanDTO>(
    `${API_BASE}/api/inspection-plans/${id}`,
    payload,
    createMeta('patch', correlationId)
  );
}

/**
 * Deleta um plano de inspeção
 */
export async function deletePlan(
  id: string,
  correlationId?: string
): Promise<void> {
  return http.delete<void>(
    `${API_BASE}/api/inspection-plans/${id}`,
    createMeta('delete', correlationId)
  );
}

/**
 * Duplica um plano existente
 */
export async function duplicatePlan(
  id: string,
  newName?: string,
  correlationId?: string
): Promise<PlanDTO> {
  const payload = newName ? { name: newName } : {};
  
  return http.post<PlanDTO>(
    `${API_BASE}/api/inspection-plans/${id}/duplicate`,
    payload,
    createMeta('duplicate', correlationId)
  );
}

/**
 * Ativa/desativa um plano
 */
export async function togglePlanStatus(
  id: string,
  status: PlanDTO['status'],
  correlationId?: string
): Promise<PlanDTO> {
  return http.patch<PlanDTO>(
    `${API_BASE}/api/inspection-plans/${id}/status`,
    { status },
    createMeta('toggle-status', correlationId)
  );
}

/**
 * Busca planos por produto
 */
export async function getPlansByProduct(
  productId: string,
  correlationId?: string
): Promise<PlanDTO[]> {
  return http.get<PlanDTO[]>(
    `${API_BASE}/api/inspection-plans/by-product/${productId}`,
    createMeta('get-by-product', correlationId)
  );
}

/**
 * Busca histórico de revisões de um plano
 */
export async function getPlanRevisions(
  id: string,
  correlationId?: string
): Promise<PlanDTO[]> {
  return http.get<PlanDTO[]>(
    `${API_BASE}/api/inspection-plans/${id}/revisions`,
    createMeta('get-revisions', correlationId)
  );
}

/**
 * Exporta um plano para diferentes formatos
 */
export async function exportPlan(
  id: string,
  format: 'json' | 'pdf' | 'excel' = 'json',
  correlationId?: string
): Promise<Blob> {
  const response = await fetch(`${API_BASE}/api/inspection-plans/${id}/export?format=${format}`, {
    method: 'GET',
    headers: {
      'Accept': format === 'json' ? 'application/json' : 'application/octet-stream'
    }
  });

  if (!response.ok) {
    throw new Error(`Export failed: ${response.status} ${response.statusText}`);
  }

  return response.blob();
}

/**
 * Valida um plano antes de salvar
 */
export async function validatePlan(
  payload: UpsertPlanDTO,
  correlationId?: string
): Promise<{ valid: boolean; errors: string[] }> {
  return http.post<{ valid: boolean; errors: string[] }>(
    `${API_BASE}/api/inspection-plans/validate`,
    payload,
    createMeta('validate', correlationId)
  );
}

/**
 * Busca estatísticas dos planos
 */
export async function getPlansStats(
  filters: PlanFilters = {},
  correlationId?: string
): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byBusinessUnit: Record<string, number>;
  byInspectionType: Record<string, number>;
}> {
  const url = new URL(`${API_BASE}/api/inspection-plans/stats`);
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });

  return http.get(url.toString(), createMeta('stats', correlationId));
}

// API Client com configuração centralizada
export const inspectionPlansApi = {
  list: listPlans,
  get: getPlan,
  create: createPlan,
  update: updatePlan,
  patch: patchPlan,
  delete: deletePlan,
  duplicate: duplicatePlan,
  toggleStatus: togglePlanStatus,
  getByProduct: getPlansByProduct,
  getRevisions: getPlanRevisions,
  export: exportPlan,
  validate: validatePlan,
  getStats: getPlansStats,
};

export default inspectionPlansApi;
