-- Script para verificar e criar a tabela suppliers se necessário
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela suppliers existe
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'suppliers' 
AND table_schema = 'public';

-- 2. Se a tabela não existir, criar
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website VARCHAR(255),
    tax_id VARCHAR(50),
    registration_date DATE,
    evaluation_score DECIMAL(3,2),
    last_audit_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON public.suppliers(code);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON public.suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON public.suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_type ON public.suppliers(type);

-- 4. Configurar RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.suppliers;
CREATE POLICY "Enable all operations for authenticated users" ON public.suppliers
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 6. Inserir dados de exemplo se a tabela estiver vazia
INSERT INTO public.suppliers (code, name, type, category, status, country, contact_person, contact_email)
SELECT 
    'SUP001',
    'Fornecedor Exemplo 1',
    'Manufacturer',
    'Eletrônicos',
    'active',
    'Brasil',
    'João Silva',
    'joao@exemplo.com'
WHERE NOT EXISTS (SELECT 1 FROM public.suppliers WHERE code = 'SUP001');

-- 7. Verificar dados
SELECT 
    'suppliers' AS table_name,
    COUNT(*) AS total_records
FROM public.suppliers;
