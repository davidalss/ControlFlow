export const BUSINESS_UNITS = {
  DIY: 'DIY',
  TECH: 'TECH', 
  KITCHEN_BEAUTY: 'COZINHA/BEAUTY',
  MOTOR_COMFORT: 'MOTOR & COMFORT'
} as const;

export const USER_ROLES = {
  inspector: 'Inspetor de Qualidade',
  engineering: 'Engenharia da Qualidade',
  manager: 'Gestor',
  block_control: 'Controle de Bloqueios'
} as const;

export const INSPECTION_STATUS = {
  draft: 'Rascunho',
  pending: 'Aguardando Aprovação',
  approved: 'Aprovado',
  conditionally_approved: 'Aprovado Condicional',
  rejected: 'Reprovado'
} as const;

export const DEFECT_TYPES = [
  'Acabamento',
  'Montagem',
  'Funcionalidade',
  'Etiquetagem',
  'Embalagem',
  'Parâmetros Técnicos',
  'Outros'
] as const;
