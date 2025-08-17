-- Migration: Create inspection plans tables
-- Created: 2025-08-16

-- Tabela principal de planos de inspeção
CREATE TABLE IF NOT EXISTS inspection_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    revision INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired', 'archived')),
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags JSONB DEFAULT '[]',
    steps JSONB NOT NULL DEFAULT '[]',
    aql_config JSONB NOT NULL DEFAULT '{}',
    valid_until TIMESTAMP WITH TIME ZONE,
    efficiency JSONB DEFAULT '{}',
    access_control JSONB DEFAULT '{}'
);

-- Tabela de histórico de revisões
CREATE TABLE IF NOT EXISTS inspection_plan_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES inspection_plans(id) ON DELETE CASCADE,
    revision INTEGER NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'archived')),
    changed_by TEXT NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changes JSONB DEFAULT '{}'
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_inspection_plans_product_id ON inspection_plans(product_id);
CREATE INDEX IF NOT EXISTS idx_inspection_plans_status ON inspection_plans(status);
CREATE INDEX IF NOT EXISTS idx_inspection_plans_revision ON inspection_plans(revision);
CREATE INDEX IF NOT EXISTS idx_inspection_plan_revisions_plan_id ON inspection_plan_revisions(plan_id);
CREATE INDEX IF NOT EXISTS idx_inspection_plan_revisions_revision ON inspection_plan_revisions(revision);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inspection_plans_updated_at 
    BEFORE UPDATE ON inspection_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
