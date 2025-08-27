-- Script completo para corrigir todos os problemas identificados
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- 1. CORRIGIR TABELA PRODUCTS
-- ========================================

-- Desabilitar RLS temporariamente
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view products" ON public.products;
DROP POLICY IF EXISTS "Users can create products" ON public.products;
DROP POLICY IF EXISTS "Users can update products" ON public.products;
DROP POLICY IF EXISTS "Users can delete products" ON public.products;

-- Reabilitar RLS com política mais permissiva
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Criar política única para todas as operações
CREATE POLICY "Enable all operations for authenticated users" ON public.products
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ========================================
-- 2. VERIFICAR/CRIAR TABELA SUPPLIERS
-- ========================================

-- Verificar se a tabela suppliers existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers' AND table_schema = 'public') THEN
        -- Criar tabela suppliers
        CREATE TABLE public.suppliers (
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

        -- Criar índices
        CREATE INDEX idx_suppliers_code ON public.suppliers(code);
        CREATE INDEX idx_suppliers_name ON public.suppliers(name);
        CREATE INDEX idx_suppliers_status ON public.suppliers(status);
        CREATE INDEX idx_suppliers_type ON public.suppliers(type);

        -- Configurar RLS
        ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Enable all operations for authenticated users" ON public.suppliers
            FOR ALL USING (auth.role() = 'authenticated')
            WITH CHECK (auth.role() = 'authenticated');

        -- Inserir dados de exemplo
        INSERT INTO public.suppliers (code, name, type, category, status, country, contact_person, contact_email)
        VALUES 
            ('SUP001', 'Fornecedor Exemplo 1', 'Manufacturer', 'Eletrônicos', 'active', 'Brasil', 'João Silva', 'joao@exemplo.com'),
            ('SUP002', 'Fornecedor Exemplo 2', 'Distributor', 'Mecânicos', 'active', 'Brasil', 'Maria Santos', 'maria@exemplo.com');
    END IF;
END $$;

-- ========================================
-- 3. VERIFICAR TABELA USERS
-- ========================================

-- Verificar se a tabela users existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        -- Criar tabela users
        CREATE TABLE public.users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255),
            role VARCHAR(50) DEFAULT 'user',
            business_unit VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Configurar RLS
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Enable all operations for authenticated users" ON public.users
            FOR ALL USING (auth.role() = 'authenticated')
            WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

-- ========================================
-- 4. VERIFICAR DADOS DAS TABELAS
-- ========================================

-- Verificar produtos
SELECT 
    'products' AS table_name,
    COUNT(*) AS total_records,
    COUNT(DISTINCT code) AS unique_codes
FROM public.products;

-- Verificar suppliers
SELECT 
    'suppliers' AS table_name,
    COUNT(*) AS total_records
FROM public.suppliers;

-- Verificar users
SELECT 
    'users' AS table_name,
    COUNT(*) AS total_records
FROM public.users;

-- ========================================
-- 5. VERIFICAR ESTRUTURA DAS TABELAS
-- ========================================

-- Estrutura da tabela products
SELECT 
    'products' AS table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Estrutura da tabela suppliers
SELECT 
    'suppliers' AS table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'suppliers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 6. VERIFICAR POLÍTICAS RLS
-- ========================================

-- Políticas da tabela products
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'products';

-- Políticas da tabela suppliers
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'suppliers';
